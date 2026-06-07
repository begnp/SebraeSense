import React from 'react';
import logoImg from '../../assets/logo.png';

interface LogoProps {
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = () => {
  return (
    <div className="flex items-center justify-center select-none w-fit">
      <img src={logoImg} alt="Sebrae Sense Logo" className="h-10 w-auto object-contain" />
    </div>
  );
};
