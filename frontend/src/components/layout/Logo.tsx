import React from 'react';

interface LogoProps {
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ light = false }) => {
  return (
    <div className={`flex flex-col items-center justify-center border-2 border-dashed ${
      light ? 'border-[#0E1B2B]/30 text-[#0E1B2B]' : 'border-white/30 text-white'
    } rounded-xl px-6 py-4 font-mono font-bold tracking-wider select-none w-fit`}>
      <span className="text-[10px] uppercase opacity-60 mb-0.5">[ LOGO IMAGE PLACEHOLDER ]</span>
      <span className="text-sm tracking-widest font-black uppercase">Sebrae Sense</span>
    </div>
  );
};
