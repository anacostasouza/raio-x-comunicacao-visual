// src/components/AdminDiagnosticos.tsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { enviarWhatsApp } from '../utils/resultUtils';
import type { Cliente } from '../types/Cliente';
import type { Resposta } from '../types/Resposta';
import '../styles/admindiagnosticos.css';

interface Diagnostico {
  cliente: Cliente;
  respostas: Resposta[];
  criadoEm?: { seconds?: number; nanoseconds?: number } | string | number;
  // outros campos que você tenha no documento
}

const AdminDiagnosticos: React.FC = () => {
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDiagnosticos() {
      try {
        const snapshot = await getDocs(collection(db, 'diagnosticos'));
        const data: Diagnostico[] = snapshot.docs.map(doc => doc.data() as Diagnostico);
        setDiagnosticos(data);
      } catch (err) {
        console.error('Erro ao buscar diagnósticos:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDiagnosticos();
  }, []);

  const handleReenviarWhatsApp = async (respostas: Resposta[], cliente: Cliente) => {
    try {
      await enviarWhatsApp(respostas, cliente);
      alert('✅ Mensagem reenviada com sucesso!');
    } catch (err) {
      console.error(err);
      alert('❌ Erro ao reenviar mensagem: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  if (loading) return <p>Carregando diagnósticos...</p>;
  if (diagnosticos.length === 0) return <p>Nenhum diagnóstico encontrado.</p>;

  return (
    <div className="AdminDiagnosticos">
      <h1>Histórico de Diagnósticos</h1>

      {diagnosticos.map((d, i) => (
        <div key={i} className="diagnostico-card">
          <h3>{d.cliente?.nome ?? 'Sem nome'}</h3>
          <p>Telefone: {d.cliente?.telefone ?? '—'}</p>
          <div className="diagnostico-acoes">
            <button onClick={() => handleReenviarWhatsApp(d.respostas, d.cliente)}>Reenviar WhatsApp</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDiagnosticos;
