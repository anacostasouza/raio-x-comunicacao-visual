export interface Pergunta {
  id: number;
  texto: string;
  opcoes: Opcao[];
}

export interface Opcao {
  texto: string;
  valor: number;
}
