import React, { useState } from 'react';
import { etapas as etapasData } from '../data/perguntas';
import type { Etapa, Pergunta } from '../data/perguntas';
import '../styles/adminPerguntas.css';

const AdminPerguntas: React.FC = () => {
  const [etapas, setEtapas] = useState<Etapa[]>(etapasData);

  const adicionarPergunta = (etapaId: number) => {
    setEtapas(prev =>
      prev.map(etapa => {
        if (etapa.id !== etapaId) return etapa;

        const novoId = Math.max(0, ...etapa.perguntas.map(p => p.id)) + 1;
        const novaPergunta: Pergunta = {
          id: novoId,
          texto: 'Nova pergunta...',
          opcoes: [
            { texto: 'Resposta ótima', valor: 2 },
            { texto: 'Resposta média', valor: 1 },
            { texto: 'Resposta ruim', valor: 0 },
          ],
        };

        return { ...etapa, perguntas: [...etapa.perguntas, novaPergunta] };
      })
    );
  };

  const removerPergunta = (etapaId: number, perguntaId: number) => {
    setEtapas(prev =>
      prev.map(etapa => {
        if (etapa.id !== etapaId) return etapa;

        if (etapa.perguntas.length <= 2) {
          alert('Cada etapa deve ter pelo menos 2 perguntas.');
          return etapa;
        }

        const novasPerguntas = etapa.perguntas.filter(p => p.id !== perguntaId);
        return { ...etapa, perguntas: novasPerguntas };
      })
    );
  };

  const atualizarTextoPergunta = (
    etapaId: number,
    perguntaId: number,
    novoTexto: string
  ) => {
    setEtapas(prev =>
      prev.map(etapa => {
        if (etapa.id !== etapaId) return etapa;

        const perguntasAtualizadas = etapa.perguntas.map(p =>
          p.id === perguntaId ? { ...p, texto: novoTexto } : p
        );

        return { ...etapa, perguntas: perguntasAtualizadas };
      })
    );
  };

  const atualizarOpcao = (
    etapaId: number,
    perguntaId: number,
    opcaoIndex: number,
    novoTexto: string
  ) => {
    setEtapas(prev =>
      prev.map(etapa => {
        if (etapa.id !== etapaId) return etapa;

        const perguntasAtualizadas = etapa.perguntas.map(p => {
          if (p.id !== perguntaId) return p;

          const opcoesAtualizadas = p.opcoes.map((opcao, idx) =>
            idx === opcaoIndex ? { ...opcao, texto: novoTexto } : opcao
          );

          return { ...p, opcoes: opcoesAtualizadas };
        });

        return { ...etapa, perguntas: perguntasAtualizadas };
      })
    );
  };

  return (
    <div>
      <h1>Administração de Perguntas</h1>

      {etapas.map(etapa => (
        <section key={etapa.id}>
          <h2>{etapa.titulo}</h2>

          {etapa.perguntas.map(pergunta => (
            <article key={pergunta.id}>
              <input
                type="text"
                value={pergunta.texto}
                onChange={e =>
                  atualizarTextoPergunta(etapa.id, pergunta.id, e.target.value)
                }
              />

              {pergunta.opcoes.map((opcao, idx) => (
                <div key={idx}>
                  <label>
                    {idx === 0
                      ? 'Ótima: '
                      : idx === 1
                      ? 'Média: '
                      : 'Ruim: '}
                  </label>
                  <input
                    type="text"
                    value={opcao.texto}
                    onChange={e =>
                      atualizarOpcao(etapa.id, pergunta.id, idx, e.target.value)
                    }
                  />
                </div>
              ))}

              <button
                onClick={() => removerPergunta(etapa.id, pergunta.id)}
              >
                Remover Pergunta
              </button>
            </article>
          ))}

          <button onClick={() => adicionarPergunta(etapa.id)}>
            Adicionar Pergunta
          </button>
        </section>
      ))}

      <div>
        <button onClick={() => console.log('Salvar mudanças', etapas)}>
          Salvar Alterações
        </button>
      </div>
    </div>
  );
};

export default AdminPerguntas;
