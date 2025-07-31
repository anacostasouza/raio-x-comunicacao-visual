import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { etapas } from '../data/perguntas';

async function addPerguntas() {
  for (const etapa of etapas) {
    await addDoc(collection(db, 'etapas'), etapa);
    console.log(`✅ Etapa "${etapa.titulo}" adicionada`);
  }
}

addPerguntas();
