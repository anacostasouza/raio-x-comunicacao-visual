import { useEffect, useState } from 'react';
import Welcome from './components/Welcome';
import CadastroCliente from './components/RegisterClient';
import Quiz from './components/Quiz';
import Result from './components/Result';
import AdminPerguntasFirestore from './components/AdminPerguntas';
import AdminDiagnosticos from './components/AdminDiagnosticos';
import AdminLogin from './components/AdminLogin';
import SugestoesPorEtapa from './components/SugestoesPorEtapaComp';



import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import type { Cliente } from './types/Cliente';
import type { Resposta } from './types/Resposta';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

function App() {
  const [fase, setFase] = useState<
      'welcome' | 'cadastro' | 'quiz' | 'result' | 'admin' | 'login' | 'diagnosticos' | 'sugestoes'
    >('welcome');


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

  const abrirAdmin = (destino: 'admin' | 'diagnosticos' | 'sugestoes' = 'admin') => {
    if (isAdmin) {
      setFase(destino);
    } else {
      setFase('login');
    }
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
            <div className='logout-container'>
              <button className="logout-button" onClick={() => setFase('welcome')}>
                Voltar para o Início
              </button>
          </div>
        </div>
      )}

      {fase === 'diagnosticos' && userEmail && isAdmin && (
        <div>
          <AdminDiagnosticos />
          <div className='logout-container'>
            <button className="primary-button" onClick={() => setFase('welcome')}>
              Voltar para o Início
            </button>
          </div>
        </div>
      )}

      {fase === 'sugestoes' && userEmail && isAdmin && (
        <div>
          <SugestoesPorEtapa onClose={() => setFase('admin')} />
          <div className='logout-container'>
            <button className="primary-button" onClick={() => setFase('welcome')}>
              Voltar para o inicio
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App; 
