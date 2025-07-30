import React from 'react';

interface HeaderPageProps {
  titulo: string;
}

const HeaderPage: React.FC<HeaderPageProps> = ({ titulo }) => {
  return (
    <header className="header-page">
      <h2>{titulo}</h2>
    </header>
  );
};

export default HeaderPage;
