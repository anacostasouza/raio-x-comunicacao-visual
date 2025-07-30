import type { Resposta } from '../types/Resposta';
import type { Cliente } from '../types/Cliente';
import { etapas } from '../data/perguntas';
import { criarContatoENotificar } from '../services/botconversaService';
import jsPDF from 'jspdf';

/**
 * Calcula a pontuação média de cada etapa do diagnóstico.
 */
export function calcularPontuacaoPorEtapa(respostas: Resposta[]): number[] {
  const pontuacoes: number[] = [];
  const etapasAgrupadas = etapas.map((_, index) =>
    respostas.filter(r => r.etapa === index + 1)
  );

  etapasAgrupadas.forEach(respostasEtapa => {
    if (respostasEtapa.length === 0) {
      pontuacoes.push(0);
      return;
    }
    const media = respostasEtapa.reduce((acc, r) => acc + r.valor, 0) / respostasEtapa.length;
    pontuacoes.push(Math.round(media));
  });

  return pontuacoes;
}

/**
 * Gera um resumo em texto (usado para WhatsApp e PDF).
 */
export function gerarResumoTexto(respostas: Resposta[]): string {
  const pontuacoes = calcularPontuacaoPorEtapa(respostas);

  let resumo = `📊 *Raio-X da Comunicação Visual* 📊\n\n`;

  etapas.forEach((etapa, index) => {
    resumo += `*${etapa.titulo}*\n`;
    resumo += `⭐ ${'★'.repeat(pontuacoes[index])}${'☆'.repeat(5 - pontuacoes[index])}\n`;

    if (pontuacoes[index] <= 2) {
      resumo += `⚠️ Atenção! Há muitos pontos a melhorar nesta área.\n\n`;
    } else if (pontuacoes[index] === 3) {
      resumo += `✅ Mediano. Alguns ajustes podem elevar a comunicação visual.\n\n`;
    } else {
      resumo += `🎉 Ótimo! Você está bem nesta etapa.\n\n`;
    }
  });

  resumo += `👉 *Quer ajuda para melhorar?* Acesse: https://www.desenharcomunicacaovisual.com.br\n`;

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

  // ✅ Chama o serviço atualizado que retorna { sucesso, mensagem }
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

  // === Cabeçalho ===
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('📊 Raio-X da Comunicação Visual', 20, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('Seu diagnóstico completo de comunicação visual', 20, 30);

  // === Corpo (pontuação por etapa) ===
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
      doc.text('⚠️ Atenção! Há pontos importantes a melhorar.', 20, y);
    } else if (pontuacoes[index] === 3) {
      doc.setTextColor(255, 140, 0);
      doc.text('✅ Mediano. Há espaço para ajustes.', 20, y);
    } else {
      doc.setTextColor(0, 128, 0);
      doc.text('🎉 Ótimo! Você está bem nesta etapa.', 20, y);
    }

    doc.setTextColor(0, 0, 0);
    y += 15;

    // Quebra página automática se o PDF estiver enchendo
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
  });

  // === Rodapé ===
  doc.setFontSize(10);
  doc.text('Saiba mais em: www.desenharcomunicacaovisual.com.br', 20, 280);

  // === Baixar PDF ===
  doc.save('diagnostico_comunicacao_visual.pdf');
}
