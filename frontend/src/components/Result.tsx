// src/components/Result.tsx
import React, { useState, useEffect } from 'react';
import type { Resposta } from '../types/Resposta';
import type { Cliente } from '../types/Cliente';
import {
  calcularPontuacaoPorEtapa,
  gerarResumoTexto,
  enviarWhatsApp,
} from '../utils/resultUtils';
import { salvarDiagnostico } from '../services/firebaseService';
import '../styles/result.css';

interface ResultProps {
  respostas: Resposta[];
  onRestart: () => void;
  cliente?: Cliente | null;
}

const Result: React.FC<ResultProps> = ({ respostas, onRestart, cliente }) => {
  const [status, setStatus] = useState<string>('');
  const [resumo, setResumo] = useState<string[]>([]);
  const [pontuacoes, setPontuacoes] = useState<Map<number, number>>(new Map());
  const [etapasUnicas, setEtapasUnicas] = useState<number[]>([]);

  // Salva o diagnóstico no Firestore ao montar / quando respostas ou cliente mudarem
  useEffect(() => {
    if (cliente) {
      salvarDiagnostico(cliente, respostas)
        .then(() => console.log('✅ Diagnóstico salvo no Firestore!'))
        .catch(err => console.error('❌ Erro ao salvar diagnóstico:', err));
    } else {
      console.warn('⚠️ Nenhum cliente encontrado, diagnóstico não foi salvo.');
    }
  }, [cliente, respostas]);

  // Calcula pontuação, resumo e etapas únicas sempre que respostas mudarem
  useEffect(() => {
    const processarResumo = async () => {
      try {
        const etapas = Array.from(new Set(respostas.map(r => Number(r.etapa)))).sort((a, b) => a - b);
        setEtapasUnicas(etapas);

        const resumoTexto = await gerarResumoTexto(respostas);
        console.log('📝 Resumo texto gerado:', resumoTexto);

        setResumo(resumoTexto.split('\n\n'));

        const mapaPontuacoes = calcularPontuacaoPorEtapa(respostas);
        setPontuacoes(mapaPontuacoes);
      } catch (err) {
        console.error('Erro ao calcular resumo/pontuações:', err);
        setResumo([]);
        setPontuacoes(new Map());
        setEtapasUnicas([]);
      }
    };

    processarResumo();
  }, [respostas]);

  const handleEnviarWhatsApp = async () => {
    if (!cliente) {
      alert('Cliente não encontrado! Não é possível enviar WhatsApp.');
      return;
    }

    if (!cliente.telefone || !cliente.telefone.trim()) {
      alert('Telefone do cliente inválido.');
      return;
    }

    try {
      setStatus('Enviando...');
      await enviarWhatsApp(respostas, cliente);
      setStatus('Mensagem enviada com sucesso!');
    } catch (err) {
      setStatus('Erro ao enviar WhatsApp.');
      console.error(err);
      alert('Erro ao enviar WhatsApp. Verifique o console para detalhes.');
    }
  };

  return (
    <div className="ResultContainer">
      <h2 id="title">Diagnóstico concluído!</h2>

      <div className="diagnostico">
        {etapasUnicas.length === 0 ? (
          <p>Nenhuma etapa encontrada para exibir.</p>
        ) : (
          etapasUnicas.map((etapaId, index) => {
            const estrelas = pontuacoes.get(etapaId) ?? 0;
            const textoEtapa = resumo[index + 1] ?? '';
            const paragrafo = textoEtapa.split('\n').slice(2).join(' ');

            return (
              <div key={String(etapaId)} className="etapa-diagnostico">
                <h3>Etapa {etapaId}</h3>
                <p className="estrelas">
                  {'★'.repeat(starsSafe(starsSafeNormalize(estrelas)))}
                  {'☆'.repeat(5 - starsSafe(starsSafeNormalize(estrelas)))}
                </p>
                <p>{paragrafo}</p>
              </div>
            );
          })
        )}
      </div>

      <div className="actions">
        <button className="primary-button" onClick={handleEnviarWhatsApp}>
          Enviar Resultado pelo WhatsApp
        </button>

        <button className="primary-button" onClick={onRestart}>
          Reiniciar Diagnóstico
        </button>
      </div>

      {status && <p className="status">{status}</p>}
    </div>
  );
};

export default Result;

/**
 * Helpers locais para garantir número de estrelas entre 0 e 5
 */
function starsSafe(n: number) {
  const nn = Number.isFinite(n) ? Math.round(n) : 0;
  return Math.max(0, Math.min(5, nn));
}

/**
 * Normaliza valores para o intervalo 1..5, convertendo médias se necessário
 */
function starsSafeNormalize(v: number) {
  if (!Number.isFinite(v)) return 0;
  if (v >= 1 && v <= 5) return v;
  if (v >= 0 && v <= 2) {
    return Math.round((v / 2) * 4 + 1);
  }
  return Math.round(v);
}
