import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const sugestoes: Record<string, string> = {};

export async function carregarSugestoesDoFirebase() {
  for (const etapaId of [1, 2, 3, 4]) {
    const ref = doc(db, 'sugestoes', `etapa-${etapaId}`);
    const snap = await getDoc(ref);
    const dados = snap.data() as Record<string, string> | undefined;

    if (dados) {
      for (const key of ['2', '3', '5']) {
        sugestoes[`${etapaId}-${key}`] = dados[key] || '';
      }
    }
  }
}

export function sugestaoPorEtapa(etapaId: string, estrelas: number): string {
  const categoria = estrelas <= 2 ? '2' : estrelas === 5 ? '5' : '3';
  return sugestoes[`${etapaId}-${categoria}`] || '';
}

export async function salvarSugestao(etapaId: string, estrelas: number, texto: string) {
  const categoria = estrelas <= 2 ? '2' : estrelas === 5 ? '5' : '3';
  const chave = `${etapaId}-${categoria}`;
  sugestoes[chave] = texto;

  const ref = doc(db, 'sugestoes', `etapa-${etapaId}`);
  const snap = await getDoc(ref);
  const dadosAtuais = snap.exists() ? snap.data() : {};
  const novo = { ...dadosAtuais, [categoria]: texto };
  await setDoc(ref, novo);
}
