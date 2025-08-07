/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-unused-vars */

import type { Resposta } from '../types/Resposta';
import type { Cliente } from '../types/Cliente';
import { criarContatoENotificar } from '../services/botconversaService';
import { jsPDF } from 'jspdf';
import myFontUrl from '../assets/font/Comfortaa-Medium.ttf';
import logoUrl from '../assets/logo.png';

// Funções auxiliares para converter assets
async function arrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function fetchAsBase64(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const buf = await res.arrayBuffer();
    return await arrayBufferToBase64(buf);
  } catch (err) {
    console.warn('Erro ao converter asset para base64:', err);
    return undefined;
  }
}

// Conversão da média para 1-5 blocos
function mediaToEstrelas(media: number): number {
  const scaled = (media / 2) * 4 + 1;
  return Math.max(1, Math.min(5, Math.round(scaled)));
}

// Mapeia respostas por etapa e retorna a pontuação de 1 a 5
export function calcularPontuacaoPorEtapa(respostas: Resposta[]): Map<number, number> {
  const map = new Map<number, number>();
  const byEtapa = new Map<number, Resposta[]>();

  respostas.forEach(r => {
    const etapaId = Number(r.etapa);
    const arr = byEtapa.get(etapaId) ?? [];
    arr.push(r);
    byEtapa.set(etapaId, arr);
  });

  byEtapa.forEach((arr, etapaId) => {
    const total = arr.reduce((s, it) => s + Number(it.valor), 0);
    const media = total / arr.length;
    const estrelas = mediaToEstrelas(media);
    map.set(etapaId, estrelas);
  });

  return map;
}

// Títulos por etapa
function etapaTitulo(etapaId: number): string {
  switch (etapaId) {
    case 1: return 'Identidade Visual';
    case 2: return 'Materiais Gráficos';
    case 3: return 'Presença Digital';
    case 4: return 'Sinalização e Ponto de Venda';
    default: return `Etapa ${etapaId}`;
  }
}

// Sugestões personalizadas por etapa e nível
function sugestaoPorEtapa(etapaId: number, estrelas: number): string {
  if (etapaId === 1) {
    if (estrelas <= 2) return 'Parece que a sua identidade visual está um pouco apagada e não está comunicando o valor do seu negócio. Uma boa alternativa é investir em uma fachada moderna e harmoniosa com letras caixa em ACM ou PVC expandido — materiais resistentes e com ótimo acabamento que garantem presença forte e atrativa desde a primeira impressão. Complemente com um cartão de visita ou folheto elegante que reflita a sua essência, usando cores, formas e tipografia consistentes com sua marca.';
    if (estrelas === 3) return 'Sua identidade visual tem potencial, mas ainda falta aquela personalidade que encanta. Podemos elevar o resultado aplicando detalhes diferenciados como acabamento com verniz localizado em cartões de visita ou folders, e reforçar o reconhecimento com letreiro em ACM com iluminação sutil ou acabamento especial — contrastes bem pensados ajudam a fixar sua imagem na mente do cliente.';
    return 'Já estamos vendo uma identidade consistente, o que é um ótimo ponto de partida! Agora, que tal consolidar isso com elementos visuais robustos e refinados? Fachadas com letras caixa de ACM ou em PVC expandido, em cores da marca e com acabamento de qualidade, trazem durabilidade e estilo. Pode-se adicionar verniz UV ou detalhes em acrílico nos seus materiais gráficos para um toque ainda mais sofisticado e memorável.';
  }

  if (etapaId === 2) {
    if (estrelas <= 2) return 'Os materiais disponíveis ainda não comunicam sua proposta de forma eficaz. Vamos dar vida ao seu marketing com um cartão de visita profissional em papel com verniz UV ou verniz localizado — isso valoriza sua marca com qualidade tátil — e produzir panfletos e folders visualmente claros e bem organizados. Adesivos e rótulos estratégicos também reforçam seu visual de forma prática e versátil.';
    if (estrelas === 3) return 'Os materiais estão funcionando, mas ainda há espaço para aprimorar detalhes que fortalecem o impacto. Aplique acabamento especial como verniz localizado nos cartões de visita, use logotipo em relevo ou displays em acrílico para dar sofisticação. Adesivos com acabamento fosco ou brilhante podem destacar seu material físico com um toque moderno.';
    return 'Ótimo trabalho já realizado — seus materiais têm boa qualidade, e agora vale potencializar isso! Use banners com impressão de alta definição, folders bem diagramados e displays em acrílico que envolvem visualmente o cliente. Produza papelaria personalizada como calendários, bottons e mouse pads para presença constante da sua marca na rotina dos clientes.';
  }

  if (etapaId === 3) {
    if (estrelas <= 2) return 'Sua presença digital ainda não está gerando o interesse que sua empresa merece. Vamos começar pelo básico: um feed no Instagram (como @desenhardigital) que mostre seus projetos — fachadas, letras caixa, letreiros — de forma visualmente atraente, incluindo bastidores das criações. No site, uma galeria organizada e casos de sucesso ajudam a instigar e converter novos clientes. Aproveite seu histórico de mais de 41 anos para reforçar confiança e legado.';
    if (estrelas === 3) return 'A presença online está iniciada, mas falta engajamento profundo. Para avançar, use posts com antes e depois de instalações, vídeo de processo (como produção de letra caixa), e depoimentos de clientes reais. Otimize o site para que o cliente encontre facilmente seus serviços (fachadas, impressão de materiais, sinalização). Use também destaques no Instagram para mostrar categorias: “Fachadas”, “Materiais Gráficos”, “Instalações”.';
    return 'Você já tem uma base sólida — agora é hora de potencializar. Explore o Instagram com Reels ou carrosséis que mostrem suas fachadas em ACM, letreiros iluminados, projetos exclusivos em PVC expandido e aço galvanizado. No site, adicione uma seção de portfólio com filtro por tipo de serviço. Invista em conteúdo informativo, como “Como escolher o melhor material para sua fachada” ou “Benefícios do verniz localizado”, agregando valor para o cliente e reforçando seu know-how.';
  }

  if (etapaId === 4) {
    if (estrelas <= 2) return 'Sua sinalização e ambiente de vendas ainda não destacam seu negócio. Uma saída eficaz é instalar letreiros em ACM ou PVC expandido — eles são duráveis, modernos e muito visualizados. Adesivação de fachadas ou vitrine com comunicação clara e visual alinhado à sua identidade já gera presença real no ponto de venda.';
    if (estrelas === 3) return 'Você já possui elementos no local, mas falta impacto visual que retenha atenção. Podemos melhorar com letras caixa em ACM com iluminação ou relevo, totens informativos em PVC para indicar produtos/áreas, e placas internas como orientadores com design fiel à identidade visual.';
    return 'Sua sinalização está funcionando, mas agora podemos refinar. Inclua iluminação indireta ou detalhe retroiluminado nas letras caixa para destacar à noite. Totens em PVC expandido ou acrílico com acabamento de qualidade promovem interatividade e facilitam a navegação no ponto de venda. Adesivos decorativos interna e externamente, complementados por faixas e painéis, reforçam sua marca de forma marcante e eficaz.';
  }

  return 'Consulte nossa equipe para sugestões personalizadas.';
}

// Gera o texto para WhatsApp com blocos
export function gerarResumoTexto(respostas: Resposta[]): string {
  const etapasUnicas = Array.from(new Set(respostas.map(r => Number(r.etapa)))).sort((a, b) => a - b);
  const pontuacoesMap = calcularPontuacaoPorEtapa(respostas);

  let resumo = `*Raio-X da Comunicação Visual*\n\n`;

  etapasUnicas.forEach((etapaId) => {
    const estrelas = pontuacoesMap.get(etapaId) ?? 1;
    resumo += `*${etapaTitulo(etapaId)}*\n`;
    resumo += `Pontuação: ${'■'.repeat(estrelas)}${'□'.repeat(5 - estrelas)}\n`;
    resumo += `${sugestaoPorEtapa(etapaId, estrelas)}\n\n`;
  });

  resumo += `*Quer ajuda para melhorar?* Fale conosco: (31) 9 9131-1431\n`;
  return resumo;
}

// Envio da mensagem via backend
export async function enviarWhatsApp(respostas: Resposta[], cliente: Cliente) {
  if (!cliente || !cliente.telefone) {
    throw new Error('O cliente não possui telefone cadastrado.');
  }
  const mensagem = gerarResumoTexto(respostas);
  const resultado = await criarContatoENotificar(cliente.nome, cliente.telefone, mensagem);
  if (!resultado.sucesso) {
    throw new Error(resultado.mensagem || 'Erro ao enviar mensagem pelo WhatsApp.');
  }
}

// Geração do PDF com separação por etapa
export async function baixarPDF(respostas: Resposta[], cliente: Cliente) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a5' });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // Carregar fonte
  let fontLoaded = false;
  try {
    const fontB64 = await fetchAsBase64(myFontUrl as string);
    if (fontB64) {
      doc.addFileToVFS('Comfortaa.ttf', fontB64);
      doc.addFont('Comfortaa.ttf', 'Comfortaa', 'normal');
      doc.setFont('Comfortaa');
      fontLoaded = true;
    }
  } catch {
    doc.setFont('helvetica');
  }

  const etapasUnicas = Array.from(new Set(respostas.map(r => Number(r.etapa)))).sort((a, b) => a - b);
  const pontuacoes = calcularPontuacaoPorEtapa(respostas);

  for (let i = 0; i < etapasUnicas.length; i++) {
    const etapaId = etapasUnicas[i];
    const titulo = etapaTitulo(etapaId);
    const estrelas = pontuacoes.get(etapaId) ?? 1;
    const sugestao = sugestaoPorEtapa(etapaId, estrelas);
    const blocos = '■'.repeat(estrelas) + '□'.repeat(5 - estrelas);

    if (i > 0) doc.addPage();
    doc.setFillColor('#d7d7d7');
    doc.rect(0, 0, pageW, pageH, 'F');

    // Logo
    try {
      const logoB64 = await fetchAsBase64(logoUrl as string);
      if (logoB64) {
        doc.addImage(`data:image/png;base64,${logoB64}`, 'PNG', 20, 20, 60, 60);
      }
    } catch { /* empty */ }

    doc.setFontSize(16);
    doc.setFont(fontLoaded ? 'Comfortaa' : 'helvetica');
    doc.text('Diagnóstico de Comunicação Visual', 100, 40);
    doc.setFontSize(11);
    doc.text(`Cliente: ${cliente?.nome ?? '-'}`, 100, 62);

    const leftX = 30;
    let cursorY = 100;

    // Conteúdo da etapa
    doc.setFontSize(14);
    doc.text(titulo, leftX, cursorY);
    cursorY += 20;

    doc.setFontSize(12);
    doc.text(`Pontuação: ${blocos}`, leftX, cursorY);
    cursorY += 16;

    doc.setFontSize(10);
    const wrapped = doc.splitTextToSize(sugestao, pageW - 60);
    doc.text(wrapped, leftX, cursorY);
  }

  // Rodapé da última página
  doc.setFontSize(9);
  const footerTexts = [
    'Instagram: @desenhardigital',
    'WhatsApp: (31) 9 9131-1431',
    'Email: contato@copiadoradesenhar.com.br',
    'Site: desenhardigital.com.br',
  ];
  const finalY = pageH - 30;
  const fullLine = footerTexts.join('   •   ');
  const totalWidth = doc.getTextWidth(fullLine);

  if (totalWidth + 40 <= pageW) {
    doc.text(fullLine, (pageW - totalWidth) / 2, finalY);
  } else {
    const half = Math.ceil(footerTexts.length / 2);
    const l1 = footerTexts.slice(0, half).join('   •   ');
    const l2 = footerTexts.slice(half).join('   •   ');
    doc.text(l1, (pageW - doc.getTextWidth(l1)) / 2, finalY - 6);
    doc.text(l2, (pageW - doc.getTextWidth(l2)) / 2, finalY + 8);
  }

  const safeName = (cliente?.nome ?? 'cliente').replace(/[^a-z0-9_\-]/gi, '_').slice(0, 40);
  const fileName = `diagnostico-${safeName}.pdf`;

  doc.save(fileName);
}
