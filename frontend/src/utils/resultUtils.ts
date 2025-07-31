import type { Resposta } from '../types/Resposta';
import type { Cliente } from '../types/Cliente';
import { etapas } from '../data/perguntas';
import { criarContatoENotificar } from '../services/botconversaService';
import jsPDF from 'jspdf';

/**
 * Calcula a pontuação média de cada etapa do diagnóstico (1 a 5 estrelas).
 */
export function calcularPontuacaoPorEtapa(respostas: Resposta[] = []): number[] {
  // 🔒 Garantia extra para não quebrar caso 'respostas' venha errado
  if (!Array.isArray(respostas)) {
    console.error("❌ Erro: 'respostas' não é um array!", respostas);
    respostas = [];
  }

  return etapas.map((etapa) => {
    // filtra respostas da etapa
    const respostasEtapa = respostas.filter(r => r.etapa === etapa.id);

    if (respostasEtapa.length === 0) {
      return 1; // se não respondeu nada, dá 1 estrela
    }

    // média de valores (0 a 2)
    const total = respostasEtapa.reduce((acc, r) => acc + r.valor, 0);
    const media = total / respostasEtapa.length;

    // conversão de 0-2 para 1-5 estrelas
    return Math.round((media / 2) * 4 + 1);
  });
}

/**
 * Gera um resumo em texto (usado para WhatsApp e PDF).
 */
export function gerarResumoTexto(respostas: Resposta[]): string {
  const pontuacoes = calcularPontuacaoPorEtapa(respostas);

  let resumo = `*Raio-X da Comunicação Visual* \n\n`;

  etapas.forEach((etapa, index) => {
    resumo += `*${etapa.titulo}*\n`;
    resumo += `⭐ ${'★'.repeat(pontuacoes[index])}${'☆'.repeat(5 - pontuacoes[index])}\n`;

    if (pontuacoes[index] <= 2) {
      resumo += `Atenção! Há muitos pontos a melhorar nesta área.\n\n`;
    } else if (pontuacoes[index] === 3) {
      resumo += `Mediano. Alguns ajustes podem elevar a comunicação visual.\n\n`;
    } else {
      resumo += `Ótimo! Você está bem nesta etapa.\n\n`;
    }
  });

  resumo += ` *Quer ajuda para melhorar?* Acesse: https://www.desenharcomunicacaovisual.com.br\n`;

  return resumo;
}

/**
 * Envia o diagnóstico para o WhatsApp via BotConversa.
 */
export async function enviarWhatsApp(respostas: Resposta[], cliente: Cliente) {
  if (!cliente.telefone) {
    throw new Error('O cliente não possui telefone cadastrado.');
  }

  const mensagem = gerarResumoTexto(respostas);
  const resultado = await criarContatoENotificar(cliente.nome, cliente.telefone, mensagem);

  if (!resultado.sucesso) {
    throw new Error(resultado.mensagem || 'Erro ao enviar mensagem pelo WhatsApp.');
  }
}

/**
 * Gera um PDF do diagnóstico com layout básico e baixa para o usuário.
 */
export async function baixarPDF(respostas: Resposta[]) {
  const pontuacoes = calcularPontuacaoPorEtapa(respostas);
  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('📊 Raio-X da Comunicação Visual', 20, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('Seu diagnóstico completo de comunicação visual', 20, 30);

  let y = 50;
  etapas.forEach((etapa, index) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`${etapa.titulo}`, 20, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    const estrelas = '★'.repeat(pontuacoes[index]) + '☆'.repeat(5 - pontuacoes[index]);
    doc.text(`Pontuação: ${estrelas}`, 20, y);
    y += 8;

    if (pontuacoes[index] <= 2) {
      doc.setTextColor(200, 0, 0);
      doc.text('Atenção! Há pontos importantes a melhorar.', 20, y);
    } else if (pontuacoes[index] === 3) {
      doc.setTextColor(255, 140, 0);
      doc.text('Mediano. Há espaço para ajustes.', 20, y);
    } else {
      doc.setTextColor(0, 128, 0);
      doc.text('Ótimo! Você está bem nesta etapa.', 20, y);
    }

    doc.setTextColor(0, 0, 0);
    y += 15;

    if (y > 260) {
      doc.addPage();
      y = 20;
    }
  });

  doc.setFontSize(10);
  doc.text('Saiba mais em: www.desenharcomunicacaovisual.com.br', 20, 280);

  doc.save('diagnostico_comunicacao_visual.pdf');
}
