export type Pergunta = {
  id: string;
  texto: string;
  resposta: 'sim' | 'nao' | null;
};