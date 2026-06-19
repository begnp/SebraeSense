import React from 'react';
import logoImg from '../../assets/logo.png';
import bigLogoImg from '../../assets/big_logo.png';

interface LogoProps {
  light?: boolean;
  large?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ large }) => {
  const src = large ? bigLogoImg : logoImg;
  const sizeClass = large 
    ? "h-auto w-56 md:w-72 lg:w-96 object-contain max-w-full" 
    : "h-10 w-auto object-contain";

  return (
    <div className="flex items-center justify-center select-none w-fit">
      <img src={src} alt="Sebrae Sense Logo" className={sizeClass} />
    </div>
  );
};
