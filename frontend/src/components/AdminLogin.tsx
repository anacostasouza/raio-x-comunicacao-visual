import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase'; 
import '../styles/adminLogin.css';

interface Props {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<Props> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      onLoginSuccess();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    } catch (error: any) {
      setErro('Falha no login. Verifique email e senha.');
    }
  };

  return (
    <div id='admin-login-container'>
      <h2 id='admin-title'>Login do Administrador</h2>
      <div className="input-button-container">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br/>

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        /><br/>

        {erro && <p style={{ color: 'red' }}>{erro}</p>}

        <button onClick={handleLogin}>Entrar</button>
      </div>
    </div>
  );
};

export default AdminLogin;
