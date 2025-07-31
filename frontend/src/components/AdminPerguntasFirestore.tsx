import React, { useEffect, useState } from 'react';
import type { Etapa, Pergunta } from '../data/perguntas';
import { db } from '../services/firebase';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
  addDoc,
} from 'firebase/firestore';
import '../styles/AdminScreen.css';

interface Props {
  onClose: () => void;
}

const etapasCollection = collection(db, 'etapas');

const AdminPerguntasFirestore: React.FC<Props> = ({ onClose }) => {
  const [etapas, setEtapas] = useState<(Etapa & { _docId?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // 🔄 Carregar dados do Firestore
  useEffect(() => {
    async function carregarEtapas() {
      setLoading(true);
      try {
        const q = query(etapasCollection, orderBy('id'));
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

  // 🔄 Atualizar localmente as etapas no estado
  const atualizarEtapas = (etapaAtualizada: Etapa & { _docId?: string }) => {
    setEtapas(prev =>
      prev.map(e => (e.id === etapaAtualizada.id ? etapaAtualizada : e))
    );
  };

  // ➕ Adicionar pergunta (máximo 2)
  const adicionarPergunta = (etapa: Etapa & { _docId?: string }) => {
    if (etapa.perguntas.length >= 2) {
      alert('Cada etapa deve ter exatamente 2 perguntas. Não é possível adicionar mais.');
      return;
    }

    const novoId = etapa.perguntas.length
      ? Math.max(...etapa.perguntas.map(p => p.id)) + 1
      : 1;

    const novaPergunta: Pergunta = {
      id: novoId,
      texto: 'Nova pergunta...',
      opcoes: [
        { texto: 'Resposta ótima', valor: 2 },
        { texto: 'Resposta média', valor: 1 },
        { texto: 'Resposta ruim', valor: 0 },
      ],
    };

    const novaEtapa = {
      ...etapa,
      perguntas: [...etapa.perguntas, novaPergunta],
    };
    atualizarEtapas(novaEtapa);
  };

  // ❌ Remover pergunta (mínimo 2)
  const removerPergunta = (etapa: Etapa & { _docId?: string }, perguntaId: number) => {
    if (etapa.perguntas.length <= 2) {
      alert('Cada etapa deve ter exatamente 2 perguntas. Não é possível remover.');
      return;
    }

    const novaEtapa = {
      ...etapa,
      perguntas: etapa.perguntas.filter(p => p.id !== perguntaId),
    };

    atualizarEtapas(novaEtapa);
  };

  // 📝 Atualizar texto da pergunta
  const atualizarTextoPergunta = (
    etapa: Etapa & { _docId?: string },
    perguntaId: number,
    novoTexto: string
  ) => {
    const novaEtapa = {
      ...etapa,
      perguntas: etapa.perguntas.map(p =>
        p.id === perguntaId ? { ...p, texto: novoTexto } : p
      ),
    };
    atualizarEtapas(novaEtapa);
  };

  // 📝 Atualizar texto da opção
  const atualizarOpcao = (
    etapa: Etapa & { _docId?: string },
    perguntaId: number,
    opcaoIndex: number,
    novoTexto: string
  ) => {
    const novaEtapa = {
      ...etapa,
      perguntas: etapa.perguntas.map(p =>
        p.id === perguntaId
          ? {
              ...p,
              opcoes: p.opcoes.map((opcao, idx) =>
                idx === opcaoIndex ? { ...opcao, texto: novoTexto } : opcao
              ),
            }
          : p
      ),
    };
    atualizarEtapas(novaEtapa);
  };

  // 💾 Salvar etapas atualizadas no Firestore
  const salvarAlteracoes = async () => {
    // ✅ Verificação antes de salvar
    const etapasInvalidas = etapas.filter(e => e.perguntas.length !== 2);
    if (etapasInvalidas.length > 0) {
      alert('⚠️ Todas as etapas devem ter exatamente 2 perguntas antes de salvar.');
      return;
    }

    setSalvando(true);
    try {
      await Promise.all(
        etapas.map(async etapa => {
          if (!('_docId' in etapa) || !etapa._docId) return;
          const docRef = doc(db, 'etapas', String(etapa._docId));
          // Remove a propriedade _docId antes de salvar
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _docId, ...etapaSalvar } = etapa;
          await updateDoc(docRef, etapaSalvar);
        })
      );
      alert('Alterações salvas com sucesso!');
    } catch (err) {
      alert('Erro ao salvar alterações: ' + err);
    }
    setSalvando(false);
  };

  if (loading) return <p>Carregando etapas...</p>;

  return (
    <div>
      <h1>Administração de Perguntas (Firestore)</h1>

      <button id='button-admin' onClick={onClose}>Fechar Administração</button>

      {etapas.map(etapa => (
        <section key={etapa.id}>
          <h2>{etapa.titulo}</h2>

          {etapa.perguntas.map(pergunta => (
            <div key={pergunta.id}>
              <input
                id='pergunta-texto'
                className='form-edit input'
                type="text"
                value={pergunta.texto}
                onChange={e =>
                  atualizarTextoPergunta(etapa, pergunta.id, e.target.value)
                }
              />

              {pergunta.opcoes.map((opcao, idx) => (
                <div key={idx}>
                  <label>
                    {idx === 0
                      ? ' Ótima:'
                      : idx === 1
                      ? ' Média:'
                      : ' Ruim:'}
                  </label>
                  <input
                    id='opcao-texto'
                    className='form-edit input'
                    type="text"
                    value={opcao.texto}
                    onChange={e =>
                      atualizarOpcao(etapa, pergunta.id, idx, e.target.value)
                    }
                  />
                </div>
              ))}

              <button id='button-admin' onClick={() => removerPergunta(etapa, pergunta.id)}>
                Remover Pergunta
              </button>
            </div>
          ))}

          {/* Botão de adicionar pergunta, desabilitado se já houver 2 */}
          <button
            id='button-admin'
            onClick={() => adicionarPergunta(etapa)}
            disabled={etapa.perguntas.length >= 2}
          >
            ➕ Adicionar Pergunta
          </button>
        </section>
      ))}

      <div>
        <button 
        id='button-admin'
        onClick={salvarAlteracoes} disabled={salvando}>
          {salvando ? 'Salvando...' : '💾 Salvar Alterações'}
        </button>
      </div>
    </div>
  );
};

export default AdminPerguntasFirestore;
