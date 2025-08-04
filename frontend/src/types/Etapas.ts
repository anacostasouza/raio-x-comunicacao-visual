import type { Pergunta } from './Pergunta';

export interface Etapa {
  id: string;
  titulo: string;
  ordem?: number; // <- adicionado para ordenação
  perguntas: Pergunta[];
}
