export type Opcao = {
  texto: string;
  valor: number; // 0 a 2 para simplificar pontuação
};

export type Pergunta = {
  id: number;
  texto: string;
  opcoes: Opcao[];
};

export type Etapa = {
  id: number;
  titulo: string;
  perguntas: Pergunta[];
};

export const etapas: Etapa[] = [
  {
    id: 1,
    titulo: 'Identidade Visual',
    perguntas: [
      {
        id: 1,
        texto: 'Sua empresa tem um logotipo profissional?',
        opcoes: [
          { texto: 'Sim, feito por designer profissional.', valor: 2 },
          { texto: 'Sim, mas feito por mim / alguém sem formação.', valor: 1 },
          { texto: 'Não temos um logotipo definido.', valor: 0 },
        ],
      },
      {
        id: 2,
        texto: 'Suas cores e fontes são usadas de forma consistente em todos os materiais?',
        opcoes: [
          { texto: 'Sempre.', valor: 2 },
          { texto: 'Às vezes.', valor: 1 },
          { texto: 'Não.', valor: 0 },
        ],
      },
    ],
  },
  {
    id: 2,
    titulo: 'Materiais Gráficos',
    perguntas: [
      {
        id: 3,
        texto: 'Seus materiais impressos (cartões, folders, banners) têm aparência moderna?',
        opcoes: [
          { texto: 'Sim, revisamos com frequência.', valor: 2 },
          { texto: 'Foram feitos há alguns anos.', valor: 1 },
          { texto: 'Não usamos muito material gráfico.', valor: 0 },
        ],
      },
      {
        id: 4,
        texto: 'Os materiais seguem um mesmo padrão visual?',
        opcoes: [
          { texto: 'Sim, tudo padronizado.', valor: 2 },
          { texto: 'Tem alguma padronização.', valor: 1 },
          { texto: 'Cada material parece de uma empresa diferente.', valor: 0 },
        ],
      },
    ],
  },
  {
    id: 3,
    titulo: 'Presença Digital',
    perguntas: [
      {
        id: 5,
        texto: 'Sua comunicação visual está bem adaptada às redes sociais?',
        opcoes: [
          { texto: 'Sim, temos templates e identidade forte.', valor: 2 },
          { texto: 'Postamos com o que dá.', valor: 1 },
          { texto: 'Raramente postamos ou não temos redes sociais.', valor: 0 },
        ],
      },
      {
        id: 6,
        texto: 'Seu site (caso tenha) transmite profissionalismo?',
        opcoes: [
          { texto: 'Sim, é atualizado e bem desenhado.', valor: 2 },
          { texto: 'Tem site, mas está desatualizado.', valor: 1 },
          { texto: 'Não temos site.', valor: 0 },
        ],
      },
    ],
  },
  {
    id: 4,
    titulo: 'Sinalização e Ponto de Venda',
    perguntas: [
      {
        id: 7,
        texto: 'Sua fachada / sinalização atrai atenção?',
        opcoes: [
          { texto: 'Sim, pensada estrategicamente.', valor: 2 },
          { texto: 'É funcional, mas sem estratégia.', valor: 1 },
          { texto: 'Não chama atenção / é improvisada.', valor: 0 },
        ],
      },
      {
        id: 8,
        texto: 'O cliente consegue identificar claramente quem você é e o que faz ao ver sua empresa?',
        opcoes: [
          { texto: 'Sim, na hora.', valor: 2 },
          { texto: 'Precisa prestar atenção.', valor: 1 },
          { texto: 'Fica confuso ou não entende.', valor: 0 },
        ],
      },
    ],
  },
];
