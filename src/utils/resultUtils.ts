import { etapas } from '../data/perguntas';
import type { Resposta } from '../types/Resposta';
import { jsPDF } from 'jspdf';

const estrelas = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

/**
 * Calcula a pontuação por etapa baseado nas respostas.
 */
export function calcularPontuacaoPorEtapa(respostas: Resposta[]) {
  return etapas.map((etapa) => {
    const soma = respostas
      .filter((r) => r.etapa === etapa.id)
      .reduce((acc, cur) => acc + cur.valor, 0);

    const estrelasCount = Math.round((soma / (etapa.perguntas.length * 2)) * 5);
    return estrelasCount;
  });
}

/**
 * Gera o texto resumo do diagnóstico para enviar via WhatsApp ou outros usos.
 */
export function gerarResumoTexto(respostas: Resposta[]) {
  const pontuacaoPorEtapa = calcularPontuacaoPorEtapa(respostas);
  const sugestoesPorEtapa = [
    [
      'Ótimo logo! Continue investindo na identidade visual.',
      'Considere melhorar a consistência de cores e fontes.',
      'Crie ou atualize seu logotipo para algo profissional.',
    ],
    [
      'Materiais modernos ajudam a passar credibilidade.',
      'Atualize seus materiais para um padrão visual único.',
      'Invista em novos materiais gráficos para melhorar a imagem.',
    ],
    [
      'Redes sociais ativas aumentam o alcance.',
      'Mantenha as redes atualizadas e com identidade forte.',
      'Considere criar ou melhorar sua presença digital.',
    ],
    [
      'Fachada impactante chama a atenção e atrai clientes.',
      'Repense a sinalização para torná-la mais estratégica.',
      'Invista em melhor sinalização e comunicação clara no ponto de venda.',
    ],
  ];

  return etapas
    .map((etapa, idx) => {
      const pontuacao = pontuacaoPorEtapa[idx];
      const sugestao =
        sugestoesPorEtapa[idx][
          pontuacao >= 4 ? 0 : pontuacao >= 2 ? 1 : 2
        ];
      return `${etapa.titulo}:\n${estrelas(pontuacao)}\nSugestão: ${sugestao}`;
    })
    .join('\n\n');
}

/**
 * Abre o WhatsApp Web com o texto do diagnóstico.
 */
export function enviarWhatsApp(respostas: Resposta[]) {
  const texto = encodeURIComponent(
    `Olá! Aqui está o resultado do seu Raio-X da Comunicação Visual:\n\n${gerarResumoTexto(respostas)}`
  );
  const url = `https://wa.me/?text=${texto}`;
  window.open(url, '_blank');
}

/**
 * Gera e baixa um PDF com o diagnóstico.
 */
export function baixarPDF(respostas: Resposta[]) {
  const pontuacaoPorEtapa = calcularPontuacaoPorEtapa(respostas);
  const sugestoesPorEtapa = [
    [
      'Ótimo logo! Continue investindo na identidade visual.',
      'Considere melhorar a consistência de cores e fontes.',
      'Crie ou atualize seu logotipo para algo profissional.',
    ],
    [
      'Materiais modernos ajudam a passar credibilidade.',
      'Atualize seus materiais para um padrão visual único.',
      'Invista em novos materiais gráficos para melhorar a imagem.',
    ],
    [
      'Redes sociais ativas aumentam o alcance.',
      'Mantenha as redes atualizadas e com identidade forte.',
      'Considere criar ou melhorar sua presença digital.',
    ],
    [
      'Fachada impactante chama a atenção e atrai clientes.',
      'Repense a sinalização para torná-la mais estratégica.',
      'Invista em melhor sinalização e comunicação clara no ponto de venda.',
    ],
  ];

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Raio-X da Comunicação Visual', 10, 20);

  let y = 30;
  etapas.forEach((etapa, idx) => {
    const pontuacao = pontuacaoPorEtapa[idx];
    const sugestao =
      sugestoesPorEtapa[idx][
        pontuacao >= 4 ? 0 : pontuacao >= 2 ? 1 : 2
      ];

    doc.setFontSize(14);
    doc.text(etapa.titulo, 10, y);
    y += 8;

    doc.setFontSize(12);
    doc.text(`Pontuação: ${estrelas(pontuacao)}`, 10, y);
    y += 8;

    doc.text(`Sugestão: ${sugestao}`, 10, y);
    y += 15;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save('raio-x-comunicacao-visual.pdf');
}
