import type { Pergunta } from './Pergunta';

export interface Etapa {
  id: string;
  titulo: string;
  ordem?: number; 
  perguntas: Pergunta[];
}
