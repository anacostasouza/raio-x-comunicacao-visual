import React, { useState } from 'react';
import type { Resposta } from '../types/Resposta';
import type { Cliente } from '../types/Cliente';
import { calcularPontuacaoPorEtapa, gerarResumoTexto, enviarWhatsApp, baixarPDF } from '../utils/resultUtils';
import { etapas } from '../data/perguntas';
import '../styles/result.css';

interface ResultProps {
  respostas: Resposta[];
  onRestart: () => void;
  cliente?: Cliente | null;
}

const Result: React.FC<ResultProps> = ({ respostas, onRestart, cliente }) => {
  const [status, setStatus] = useState<string>('');

  const handleEnviarWhatsApp = async () => {
    if (!cliente) return alert('Cliente não encontrado!');
    try {
      setStatus('Enviando...');
      await enviarWhatsApp(respostas, cliente);
      setStatus('Mensagem enviada com sucesso!');
    } catch (err) {
      setStatus('Erro ao enviar WhatsApp.');
      console.error(err);
    }
  };

  const handlePDF = async () => {
    await baixarPDF(respostas);
  };

  return (
    <div>
      <h2>Diagnóstico concluído!</h2>

      <div className="diagnostico">
        {(() => {
          const resumoEtapas = gerarResumoTexto(respostas).split('\n\n');
          const pontuacoes = calcularPontuacaoPorEtapa(respostas); 

          return etapas.map((etapa, index) => (
            <div key={etapa.id} className="etapa-diagnostico">
              <h3>{etapa.titulo}</h3>
              <p>
                {'★'.repeat(pontuacoes[index])}{'☆'.repeat(5 - pontuacoes[index])}
              </p>
              <p>{resumoEtapas[index + 1]?.split('\n').slice(2).join(' ')}</p>
            </div>
          ));
        })()}
      </div>

      <div className='actions'>
        <button className='primary-button' onClick={handleEnviarWhatsApp}>
          Enviar Resultado pelo WhatsApp
        </button>

        <button className='primary-button' onClick={handlePDF}>
          Baixar PDF do Diagnóstico
        </button>

        <button className='primary-button' onClick={onRestart}>
          Reiniciar Diagnóstico
        </button>
      </div>

      {status && <p>{status}</p>}
    </div>
  );
};

export default Result;
