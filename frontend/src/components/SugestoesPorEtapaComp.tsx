import React, { useEffect, useState } from 'react';
import {
  carregarSugestoesDoFirebase,
  salvarSugestao,
  sugestaoPorEtapa,
} from '../utils/SugestoesPorEtapa';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FaEdit, FaSave } from 'react-icons/fa';
import '../styles/adminSugestoes.css';

interface Etapa {
  id: string;
  titulo: string;
  _docId: string;
}

const categorias = [
  { label: 'Ruim', key: '2' },
  { label: 'Médio', key: '3' },
  { label: 'Ótimo', key: '5' },
];

const SugestoesPorEtapa: React.FC<{ onClose: () => void }> = () => {
  const [carregado, setCarregado] = useState(false);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [modoEdicao, setModoEdicao] = useState<Record<string, boolean>>({});
  const [valores, setValores] = useState<Record<string, string>>({});

  useEffect(() => {
    const carregar = async () => {
      // Carrega etapas do Firebase
      const q = query(collection(db, 'etapas'), orderBy('id'));
      const snapshot = await getDocs(q);
      const etapasCarregadas: Etapa[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Omit<Etapa, '_docId'>;
        return { ...data, _docId: docSnap.id };
      });
      setEtapas(etapasCarregadas);

      // Carrega sugestões do Firebase
      await carregarSugestoesDoFirebase();

      // Monta valores iniciais
      const valoresIniciais: Record<string, string> = {};
      for (const etapa of etapasCarregadas) {
        for (const categoria of categorias) {
          const chave = `${etapa.id}-${categoria.key}`;
          valoresIniciais[chave] = sugestaoPorEtapa(etapa.id, parseInt(categoria.key));
        }
      }
      setValores(valoresIniciais);
      setCarregado(true);
    };

    carregar();
  }, []);

  const toggleEditar = (chave: string) => {
    setModoEdicao((prev) => ({ ...prev, [chave]: !prev[chave] }));
  };

  const handleChange = (chave: string, texto: string) => {
    setValores((prev) => ({ ...prev, [chave]: texto }));
  };

  const handleSalvar = async (etapaId: string, categoriaKey: string) => {
    const chave = `${etapaId}-${categoriaKey}`;
    await salvarSugestao(etapaId, parseInt(categoriaKey), valores[chave]);
    toggleEditar(chave);
  };

  if (!carregado) return <p>Carregando sugestões e etapas...</p>;

  return (
    <div className="admin-perguntas-container">
      <h2>Sugestões por Etapa</h2>
      {etapas.map((etapa) => (
        <div key={etapa.id} className="etapa-section">
          <h3>{etapa.titulo}</h3>

          {categorias.map((categoria) => {
            const chave = `${etapa.id}-${categoria.key}`;
            const valor = valores[chave] || '';

            return (
              <div key={chave} className="sugestao-item">
                <strong>{categoria.label}:</strong>
                {modoEdicao[chave] ? (
                  <>
                    <textarea
                      value={valor}
                      onChange={(e) => handleChange(chave, e.target.value)}
                      rows={2}
                      className="sugestao-textarea"
                    />
                    <button onClick={() => handleSalvar(etapa.id, categoria.key)}>
                      <FaSave /> Salvar
                    </button>
                  </>
                ) : (
                  <span className="sugestao-texto">
                    {valor || 'Sem sugestão cadastrada'}
                    <button className="icon-button" onClick={() => toggleEditar(chave)} title="Editar sugestão">
                      <FaEdit />
                    </button>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default SugestoesPorEtapa;
