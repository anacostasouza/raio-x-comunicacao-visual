import React from 'react';
import logo from '../assets/logo.png';
import '../styles/welcome.css';

interface Props {
  onStart: () => void;
  onAdminOpen?: (destino?: 'diagnosticos' | 'admin') => void;
  showAdmin?: boolean; 
}

const Welcome: React.FC<Props> = ({ onStart, onAdminOpen, showAdmin }) => {
  return (
    <main className="app-container centered-container">
      <img src={logo} alt="Logo Desenhar Comunicação Visual" className="logo" />
      <h1>Raio-X da Comunicação Visual</h1>
      <p>Descubra o que a sua comunicação visual está realmente transmitindo!</p>

      <button className="primary-button" onClick={onStart}>
        Começar o Raio-X
      </button>

      {onAdminOpen && (
        <>
          {showAdmin ? (
            <>
              <button
                className="primary-button"
                onClick={() => onAdminOpen('diagnosticos')}
              >
                Ver Diagnósticos
              </button>
              <button
                className="primary-button"
                onClick={() => onAdminOpen('admin')}
              >
                Administrar Perguntas
              </button>
            </>
          ) : (
            <button
              className="primary-button"
              onClick={() => onAdminOpen('admin')}
            >
              Login Admin
            </button>
          )}
        </>
      )}
    </main>
  );
};

export default Welcome;
