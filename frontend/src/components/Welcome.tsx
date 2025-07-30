import React from 'react';
import logo from '../assets/logo.png';

interface Props {
  onStart: () => void;
}

const Welcome: React.FC<Props> = ({ onStart }) => {
  return (
    <main className="app-container centered-container">
      <img src={logo} alt="Logo Desenhar Comunicação Visual" className="logo" />
      <h1>Raio-X da Comunicação Visual</h1>
      <p>Descubra o que a sua comunicação visual está realmente transmitindo!</p>
      <button className="primary-button" onClick={onStart}>
        Começar o Raio-X
      </button>
    </main>
  );
};

export default Welcome;
