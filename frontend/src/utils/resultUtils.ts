import type { Resposta } from '../types/Resposta';
import type { Cliente } from '../types/Cliente';
import { etapas } from '../data/perguntas';
import { criarContatoENotificar } from '../services/botconversaService';


export function calcularPontuacaoPorEtapa(respostas: Resposta[] = []): number[] {
  if (!Array.isArray(respostas)) {
    console.error("❌ Erro: 'respostas' não é um array!", respostas);
    respostas = [];
  }

  return etapas.map((etapa) => {
    const respostasEtapa = respostas.filter(r => Number(r.etapa) === etapa.id);

    if (respostasEtapa.length === 0) {
      return 1; 
    }

    const total = respostasEtapa.reduce((acc, r) => acc + r.valor, 0);
    const media = total / respostasEtapa.length;

    return Math.round((media / 2) * 4 + 1);
  });
}

/* 
Resumo para PDF e mensagem BotConversa 
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

  resumo += ` *Quer ajuda para melhorar?* Entre em contato em nosso WhatsApp: (31) 9 9131-1431\n`;

  return resumo;
}

/**
 Envio de mensagem via WhatsApp usando o BotConversa.
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
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// 👇 Sua fonte customizada convertida em base64 (exemplo fictício):
import myFontBase64 from "../assets/font/Comfortaa-Medium.ttf" // conteúdo string base64

// 👇 Sua logo convertida em base64:
import logoBase64 from "../assets/logo.png"; // data:image/png;base64,...

export async function baixarPDF(respostas: string[], cliente: string) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a5", // A5
  });

  // 👉 Adiciona a fonte customizada
  doc.addFileToVFS("Comfortaa.ttf", myFontBase64);
  doc.addFont("Comfortaa.ttf", "Comfortaa", "normal");
  doc.setFont("Comfortaa");

  // 👉 Fundo cinza claro
  doc.setFillColor("#d7d7d7");
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), "F");

  // 👉 Logo no canto superior esquerdo
  doc.addImage(logoBase64, "PNG", 20, 20, 60, 60); // x, y, w, h

  // 👉 Texto do título
  doc.setTextColor("#000");
  doc.setFontSize(16);
  doc.text("Diagnóstico de Comunicação Visual", 100, 40);

  // 👉 Informações do cliente
  doc.setFontSize(12);
  doc.text(`Cliente: ${cliente}`, 100, 65);

  // 👉 Tabela com respostas (exemplo simplificado)
  autoTable(doc, {
    startY: 100,
    head: [["Etapa", "Resposta"]],
    body: respostas.map((resp, i) => [`Etapa ${i + 1}`, resp]),
    styles: {
      textColor: "#000",
      font: "Comfortaa",
      fontSize: 10,
    },
    headStyles: {
      fillColor: "#444",
      textColor: "#fff",
    },
  });

  // 👉 Salva o PDF
  doc.save("diagnostico.pdf");
}
