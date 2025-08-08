export function etapaTitulo(etapaId: number): string {
  switch (etapaId) {
    case 1: return 'Identidade Visual';
    case 2: return 'Materiais Gráficos';
    case 3: return 'Presença Digital';
    case 4: return 'Sinalização e Ponto de Venda';
    default: return `Etapa ${etapaId}`;
  }
}
