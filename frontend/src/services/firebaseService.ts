import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import type { Cliente } from "../types/Cliente";
import type { Resposta } from "../types/Resposta";

export async function salvarDiagnostico(cliente: Cliente, respostas: Resposta[]) {
  await addDoc(collection(db, "diagnosticos"), {
    cliente,
    respostas,
    criadoEm: Timestamp.now()
  });
}
