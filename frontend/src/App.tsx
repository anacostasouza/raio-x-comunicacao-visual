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

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

function App() {
  const [fase, setFase] = useState<'welcome' | 'cadastro' | 'quiz' | 'result' | 'admin' | 'login'>('welcome');
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setIsAdmin(user.email === ADMIN_EMAIL);
      } else {
        setUserEmail(null);
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const abrirAdmin = () => {
    if (isAdmin) {
      setFase('admin');
    } else {
      setFase('login');
    }
  };

  const sair = async () => {
    await signOut(auth);
    setFase('welcome');
  };

  return (
    <div>
      {fase === 'welcome' && (
        <Welcome
          onStart={() => setFase('cadastro')}
          onAdminOpen={abrirAdmin}
          showAdmin={isAdmin}
        />
      )}

      {fase === 'cadastro' && (
        <CadastroCliente
          onSubmit={(dados) => {
            setCliente({ ...dados, criadoEm: new Date() });
            setFase('quiz');
          }}
          onBack={() => setFase('welcome')}  
        />
      )}

      {fase === 'quiz' && (
        <Quiz
          onFinish={(respostas) => {
            setRespostas(respostas);
            setFase('result');
          }}
        />
      )}

      {fase === 'result' && cliente && (
        <Result
          respostas={respostas}
          cliente={cliente}
          onRestart={() => setFase('welcome')}
        />
      )}

      {fase === 'login' && <AdminLogin onLoginSuccess={() => setFase('admin')} />}

      {fase === 'admin' && userEmail && isAdmin && (
        <div>
          <AdminPerguntasFirestore onClose={() => setFase('welcome')} />
        </div>
      )}
    </div>
  );
}

export default App;
