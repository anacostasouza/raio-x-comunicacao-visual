import type { Resposta } from '../types/Resposta';
import type { Cliente } from '../types/Cliente';
import type { Etapa } from '../types/Etapas';
import { criarContatoENotificar } from '../services/botconversaService';
import { carregarSugestoesDoFirebase, sugestaoPorEtapa } from '../utils/SugestoesPorEtapa';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// Cache local para evitar múltiplas consultas
let etapasCache: (Etapa & { _docId?: string })[] = [];

// Função para carregar etapas do Firebase
export async function carregarEtapasDoFirebase(): Promise<(Etapa & { _docId?: string })[]> {
  if (etapasCache.length > 0) {
    console.log('📦 Usando etapas do cache:', etapasCache);
    return etapasCache;
  }

  console.log('📡 Buscando etapas do Firebase...');
  const q = query(collection(db, 'etapas'), orderBy('id'));
  const snapshot = await getDocs(q);

  etapasCache = snapshot.docs.map(docSnap => {
    const data = docSnap.data() as Etapa;
    return {
      ...data,
      _docId: docSnap.id,
      perguntas: data.perguntas || [],
    };
  });

  console.log('✅ Etapas carregadas:', etapasCache);
  return etapasCache;
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

  console.log('📊 Pontuação por etapa:', map);
  return map;
}

// Gera o texto para WhatsApp com blocos e sugestões carregadas do Firebase
export async function gerarResumoTexto(respostas: Resposta[]): Promise<string> {
  // Garante que os caches estejam carregados
  await carregarSugestoesDoFirebase();
  const etapas = await carregarEtapasDoFirebase();

  const etapasUnicas = Array.from(new Set(respostas.map(r => Number(r.etapa)))).sort((a, b) => a - b);
  const pontuacoesMap = calcularPontuacaoPorEtapa(respostas);

  let resumo = `*Raio-X da Comunicação Visual*\n\n`;

  etapasUnicas.forEach((etapaId) => {
    const etapa = etapas.find(e => Number(e.id) === etapaId);
    const titulo = etapa ? etapa.titulo : `Etapa ${etapaId}`;
    const estrelas = pontuacoesMap.get(etapaId) ?? 1;

    resumo += `*${titulo}*\n`;
    resumo += `Pontuação: ${'■'.repeat(estrelas)}${'□'.repeat(5 - estrelas)}\n`;
    resumo += `${sugestaoPorEtapa(etapaId.toString(), estrelas)}\n\n`;
  });

  console.log('📄 Resumo gerado:', resumo);
  return resumo;
}

// Envio da mensagem via backend
export async function enviarWhatsApp(respostas: Resposta[], cliente: Cliente) {
  if (!cliente || !cliente.telefone) {
    throw new Error('O cliente não possui telefone cadastrado.');
  }
  console.log('📱 Enviando WhatsApp para:', cliente);

  const mensagem = await gerarResumoTexto(respostas);
  const resultado = await criarContatoENotificar(cliente.nome, cliente.telefone, mensagem);

  console.log('📬 Resultado do envio:', resultado);

  if (!resultado.sucesso) {
    throw new Error(resultado.mensagem || 'Erro ao enviar mensagem pelo WhatsApp.');
  }
}
