import React from 'react';
import type { Resposta } from '../types/Resposta';
import { etapas } from '../data/perguntas';
import {
  calcularPontuacaoPorEtapa,
  gerarResumoTexto,
  enviarWhatsApp,
  baixarPDF,
} from '../utils/resultUtils';

interface Props {
  respostas: Resposta[];
  onRestart: () => void;
}

const Result: React.FC<Props> = ({ respostas, onRestart }) => {
  const pontuacaoPorEtapa = calcularPontuacaoPorEtapa(respostas);
  const resumoTexto = gerarResumoTexto(respostas);

  return (
    <main className="app-container centered-container">
      <h2>Seu Raio-X da Comunicação Visual</h2>
      <div className="diagnostico">
        {etapas.map((etapa, index) => (
          <div key={etapa.id} className="etapa-diagnostico">
            <h3>{etapa.titulo}</h3>
            <p>{'★'.repeat(pontuacaoPorEtapa[index])}{'☆'.repeat(5 - pontuacaoPorEtapa[index])}</p>
            <p>{resumoTexto.split('\n\n')[index].split('\n').slice(2).join('')}</p>
          </div>
        ))}
      </div>

      <section className="resumo-texto">
        {resumoTexto}
      </section>

      <div className="acoes">
        <button className="primary-button" onClick={() => enviarWhatsApp(respostas)}>
          Receber resultado por WhatsApp
        </button>
        <button className="primary-button" onClick={() => baixarPDF(respostas)}>
          Baixar diagnóstico em PDF
        </button>
        <a
          href="https://www.desenharcomunicacaovisual.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="primary-button"
        >
          Ler mais sobre soluções que oferecemos
        </a>
        <button className="primary-button" onClick={onRestart}>
          Fazer novo diagnóstico
        </button>
      </div>
    </main>
  );
};

export default Result;