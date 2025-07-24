import React, { useState } from 'react';

interface Props {
  onSubmit: (dados: { nome: string; telefone?: string; email?: string }) => void;
}

const CadastroCliente: React.FC<Props> = ({ onSubmit }) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('Por favor, informe o nome da empresa ou responsável.');
      return;
    }
    onSubmit({ nome, telefone, email });
  };

  return (
    <main className="app-container centered-container">
      <h2>Antes de começar, preencha seus dados</h2>
      <form className="form-cadastro" onSubmit={handleSubmit}>
        <label>Nome da empresa ou responsável*:</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          placeholder="Digite o nome da empresa ou responsável"
        />

        <label>Telefone:</label>
        <input
          type="tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="Digite o telefone"
        />

        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite o email"
        />

        <button className="primary-button" type="submit">Iniciar diagnóstico</button>
      </form>
    </main>
  );
};

export default CadastroCliente;
