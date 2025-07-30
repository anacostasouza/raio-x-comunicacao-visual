import { useState } from 'react';
import Welcome from './components/Welcome';
import CadastroCliente from './components/RegisterClient';
import Quiz from './components/Quiz';
import Result from './components/Result';
import { salvarDiagnostico } from './services/firebaseService';
import type { Cliente } from './types/Cliente';
import type { Resposta } from './types/Resposta';

function App() {
  const [fase, setFase] = useState<'welcome' | 'cadastro' | 'quiz' | 'result'>('welcome');
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [respostas, setRespostas] = useState<Resposta[]>([]);

  const iniciarCadastro = () => setFase('cadastro');

  const finalizarCadastro = (dados: { nome: string; telefone?: string; email?: string }) => {
    setCliente({ ...dados, criadoEm: new Date() });
    setFase('quiz');
  };

  const finalizarQuiz = async (respostasRecebidas: Resposta[]) => {
    setRespostas(respostasRecebidas);
    if (cliente) {
      await salvarDiagnostico(cliente, respostasRecebidas);
    }
    setFase('result');
  };

  const reiniciar = () => {
    setCliente(null);
    setRespostas([]);
    setFase('welcome');
  };

  return (
    <>
      {fase === 'welcome' && <Welcome onStart={iniciarCadastro} />}
      {fase === 'cadastro' && <CadastroCliente onSubmit={finalizarCadastro} />}
      {fase === 'quiz' && <Quiz onFinish={finalizarQuiz} />}
      {fase === 'result' && cliente && (
        <Result respostas={respostas} cliente={cliente} onRestart={reiniciar} />
      )}
    </>
  );
}

export default App;
