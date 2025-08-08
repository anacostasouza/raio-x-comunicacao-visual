/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import type { Etapa } from '../types/Etapas';
import { db } from '../services/firebase';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { FaPencilAlt, FaCheck, FaTimes } from 'react-icons/fa';
import '../styles/adminPerguntas.css';

interface Props {
  onClose?: () => void;
}

const AdminPerguntas: React.FC<Props> = () => {
  const [etapas, setEtapas] = useState<(Etapa & { _docId?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [editandoEtapaId, setEditandoEtapaId] = useState<number | null>(null);
  const [etapaTemp, setEtapaTemp] = useState<Etapa & { _docId?: string } | null>(null);

  useEffect(() => {
    async function carregarEtapas() {
      setLoading(true);
      try {
        const q = query(collection(db, 'etapas'), orderBy('id'));
        const snapshot = await getDocs(q);
        const dados: (Etapa & { _docId: string })[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data() as Etapa;
          return {
            ...data,
            _docId: docSnap.id,
            perguntas: data.perguntas || [],
          };
        });
        setEtapas(dados);
      } catch (err) {
        alert('Erro ao carregar etapas: ' + err);
      }
      setLoading(false);
    }

    carregarEtapas();
  }, []);

  const atualizarEtapas = (etapaAtualizada: Etapa & { _docId?: string }) => {
    setEtapas(prev =>
      prev.map(e => (e.id === etapaAtualizada.id ? etapaAtualizada : e))
    );
  };

  const iniciarEdicaoEtapa = (etapa: Etapa & { _docId?: string }) => {
    setEditandoEtapaId(Number(etapa.id));
    setEtapaTemp(JSON.parse(JSON.stringify(etapa)));
  };

  const salvarEtapa = async () => {
    if (!etapaTemp) return;

    atualizarEtapas(etapaTemp);
    setEditandoEtapaId(null);
    setSalvando(true);

    try {
      if (etapaTemp._docId) {
        const docRef = doc(db, 'etapas', etapaTemp._docId);
        const { _docId, ...dadosParaSalvar } = etapaTemp;
        await updateDoc(docRef, dadosParaSalvar);
        alert('Etapa salva com sucesso!');
      }
    } catch (err) {
      alert('Erro ao salvar etapa: ' + err);
    }
    setSalvando(false);
  };

  const salvarAlteracoes = async () => {
    const etapasInvalidas = etapas.filter(e => e.perguntas.length !== 2);
    if (etapasInvalidas.length > 0) {
      alert('⚠️ Todas as etapas devem ter exatamente 2 perguntas antes de salvar.');
      return;
    }

    setSalvando(true);
    try {
      await Promise.all(
        etapas.map(async etapa => {
          if (!etapa._docId) return;
          const docRef = doc(db, 'etapas', etapa._docId);
          const { _docId, ...dadosParaSalvar } = etapa;
          await updateDoc(docRef, dadosParaSalvar);
        })
      );
      alert('Alterações salvas com sucesso!');
      // Não tem redirecionamento aqui
    } catch (err) {
      alert('Erro ao salvar alterações: ' + err);
    }
    setSalvando(false);
  };

  if (loading) return <p>Carregando etapas...</p>;

  return (
    <div className='AdminPerguntas'>
      <h1>Administração de Perguntas</h1>

      {etapas.map(etapa => {
        const emEdicao = editandoEtapaId === Number(etapa.id);
        const dados = emEdicao ? etapaTemp! : etapa;

        return (
          <section key={etapa.id}>
            <div className="view-row">
              {emEdicao ? (
                <input
                  value={dados.titulo}
                  onChange={e =>
                    setEtapaTemp({ ...dados, titulo: e.target.value })
                  }
                  disabled={salvando}
                />
              ) : (
                <span className="titulo-etapa">{etapa.titulo}</span>
              )}

              {!emEdicao && (
                <button onClick={() => iniciarEdicaoEtapa(etapa)}>
                  <FaPencilAlt />
                </button>
              )}
            </div>

            {dados.perguntas.map((pergunta, pIndex) => (
              <div className='perguntas' key={pergunta.id}>
                {emEdicao ? (
                  <input
                    value={pergunta.texto}
                    onChange={e => {
                      const novasPerguntas = [...dados.perguntas];
                      novasPerguntas[pIndex] = {
                        ...pergunta,
                        texto: e.target.value,
                      };
                      setEtapaTemp({ ...dados, perguntas: novasPerguntas });
                    }}
                    disabled={salvando}
                  />
                ) : (
                  <span className='perguntas-titulo'>{pergunta.texto}</span>
                )}

                {pergunta.opcoes.map((opcao, idx) => (
                  <div key={idx} className="view-row">
                    <label>{idx === 0 ? 'Ótima:' : idx === 1 ? 'Média:' : 'Ruim:'}</label>
                    {emEdicao ? (
                      <input
                        value={opcao.texto}
                        onChange={e => {
                          const novasPerguntas = [...dados.perguntas];
                          novasPerguntas[pIndex].opcoes[idx] = {
                            ...opcao,
                            texto: e.target.value,
                          };
                          setEtapaTemp({ ...dados, perguntas: novasPerguntas });
                        }}
                        disabled={salvando}
                      />
                    ) : (
                      <span>{opcao.texto}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {emEdicao && (
              <div className="edit-actions">
                <button onClick={salvarEtapa} disabled={salvando}><FaCheck /></button>
                <button onClick={() => setEditandoEtapaId(null)} disabled={salvando}><FaTimes /></button>
              </div>
            )}
          </section>
        );
      })}

      <div className='admin-actions'>
        <button onClick={salvarAlteracoes} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
};

export default AdminPerguntas;
