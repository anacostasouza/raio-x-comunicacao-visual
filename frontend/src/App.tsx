import { useEffect, useState } from 'react';
import Welcome from './components/Welcome';
import CadastroCliente from './components/RegisterClient';
import Quiz from './components/Quiz';
import Result from './components/Result';
import AdminPerguntasFirestore from './components/AdminPerguntasFirestore';
import AdminLogin from './components/AdminLogin';

import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import type { Cliente } from './types/Cliente';
import type { Resposta } from './types/Resposta';

const ADMINS = ['ti.desenhar@gmail.com']; // emails autorizados

function App() {
  const [fase, setFase] = useState<'welcome' | 'cadastro' | 'quiz' | 'result' | 'admin' | 'login'>('welcome');
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email ?? null);
    });
    return () => unsubscribe();
  }, []);

  const abrirAdmin = () => {
    if (userEmail && ADMINS.includes(userEmail)) {
      setFase('admin');
    } else {
      setFase('login'); // se não estiver logado, vai para tela de login
    }
  };

  const sair = async () => {
    await signOut(auth);
    setFase('welcome');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      {fase === 'welcome' && <Welcome onStart={() => setFase('cadastro')} onAdminOpen={abrirAdmin} showAdmin={true} />}

      {fase === 'cadastro' && <CadastroCliente onSubmit={(dados) => { setCliente({ ...dados, criadoEm: new Date() }); setFase('quiz'); }} />}

      {fase === 'quiz' && <Quiz onFinish={(respostas) => { setRespostas(respostas); setFase('result'); }} />}

      {fase === 'result' && cliente && (
        <Result respostas={respostas} cliente={cliente} onRestart={() => setFase('welcome')} />
      )}

      {fase === 'login' && <AdminLogin onLoginSuccess={() => setFase('admin')} />}

      {fase === 'admin' && userEmail && ADMINS.includes(userEmail) && (
        <div>
          <AdminPerguntasFirestore onClose={() => setFase('welcome')} />
          <button className='primary-button' onClick={sair}>Sair</button>
        </div>
      )}
    </div>
  );
}

export default App;
