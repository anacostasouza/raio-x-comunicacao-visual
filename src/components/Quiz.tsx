import React, { useState } from 'react';
import { etapas, type Etapa, type Pergunta } from '../data/perguntas';
import type { Resposta } from '../types/Resposta';

interface QuizProps {
  onFinish: (respostas: Resposta[]) => void;
}

const Quiz: React.FC<QuizProps> = ({ onFinish }) => {
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [respostasEtapa, setRespostasEtapa] = useState<Record<number, number>>({});
  const [respostasAcumuladas, setRespostasAcumuladas] = useState<Resposta[]>([]);

  const etapa: Etapa = etapas[etapaAtual];

  const handleResposta = (perguntaId: number, valor: number) => {
    setRespostasEtapa(prev => ({ ...prev, [perguntaId]: valor }));
  };

  const todasRespondidas = etapa.perguntas.every(
    pergunta => Object.prototype.hasOwnProperty.call(respostasEtapa, pergunta.id)
  );

  const handleProximaEtapa = () => {
    if (!todasRespondidas) {
      alert('Por favor, responda todas as perguntas antes de continuar.');
      return;
    }

    const respostasDaEtapa: Resposta[] = etapa.perguntas.map(pergunta => ({
      etapa: etapa.id,
      perguntaId: pergunta.id,
      valor: respostasEtapa[pergunta.id],
    }));

    const todasRespostas = [...respostasAcumuladas, ...respostasDaEtapa];

    if (etapaAtual < etapas.length - 1) {
      setRespostasAcumuladas(todasRespostas);
      setRespostasEtapa({});
      setEtapaAtual(etapaAtual + 1);
    } else {
      onFinish(todasRespostas);
    }
  };

  return (
    <main className="app-container">
      <div className="quiz-container">
        <h2>{etapa.titulo}</h2>
        {etapa.perguntas.map((pergunta: Pergunta) => (
          <div key={pergunta.id} className="pergunta">
            <p>{pergunta.texto}</p>
            <div className="opcoes">
              {pergunta.opcoes.map((opcao, i) => {
                const isSelected = respostasEtapa[pergunta.id] === opcao.valor;
                return (
                  <button
                    key={i}
                    type="button"
                    className={`opcao-btn ${isSelected ? 'selecionado' : ''}`}
                    onClick={() => handleResposta(pergunta.id, opcao.valor)}
                  >
                    {opcao.texto}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <button
          onClick={handleProximaEtapa}
          className="botao-proximo"
          disabled={!todasRespondidas}
        >
          {etapaAtual === etapas.length - 1 ? 'Finalizar' : 'Próxima Etapa'}
        </button>
      </div>
    </main>
  );
};

export default Quiz;