import React, { useState } from 'react';

interface Props {
  onSubmit: (dados: { nome: string; telefone?: string; email?: string }) => void;
}

const CadastroCliente: React.FC<Props> = ({ onSubmit }) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  // Função que aplica a máscara no valor digitado
  const mascaraTelefone = (valor: string) => {
    // Remove tudo que não for número
    const numeros = valor.replace(/\D/g, '');

    // Aplica máscara progressivamente
    if (numeros.length <= 2) {
      return `(${numeros}`;
    }
    if (numeros.length <= 7) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }
    if (numeros.length <= 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    }
    // Limita a 11 dígitos (DDD + 9 dígitos)
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
  };

  // Limpa o telefone para enviar ao backend (só números, com DDI 55 se precisar)
  const limparTelefone = (valor: string) => {
    let somenteNumeros = valor.replace(/\D/g, '');
    if (somenteNumeros.length === 11) {
      somenteNumeros = `55${somenteNumeros}`;
    }
    return somenteNumeros;
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorMascarado = mascaraTelefone(e.target.value);
    setTelefone(valorMascarado);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('Por favor, informe o nome da empresa ou responsável.');
      return;
    }
    const telefoneFormatado = limparTelefone(telefone);
    onSubmit({ nome, telefone: telefoneFormatado, email });
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
          onChange={handleTelefoneChange}
          maxLength={15} // Limita o tamanho da máscara
          placeholder="(99) 99999-9999"
        />

        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite o email"
        />

        <button className="primary-button" type="submit">
          Iniciar diagnóstico
        </button>
      </form>
    </main>
  );
};

export default CadastroCliente;
