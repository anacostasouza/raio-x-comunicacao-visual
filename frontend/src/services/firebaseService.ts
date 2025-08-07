import { collection, addDoc, Timestamp, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import type { Cliente } from "../types/Cliente";
import type { Resposta } from "../types/Resposta";
import type { Etapa } from "../types/Etapas";

export async function salvarDiagnostico(cliente: Cliente, respostas: Resposta[]) {
  await addDoc(collection(db, "diagnosticos"), {
    cliente,
    respostas,
    criadoEm: Timestamp.now()
  });
}

export async function buscarEtapasDoFirestore(): Promise<Etapa[]> {
  const etapasRef = collection(db, 'etapas');
  const snapshot = await getDocs(etapasRef);
  const etapas: Etapa[] = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Etapa[];
  return etapas;
}