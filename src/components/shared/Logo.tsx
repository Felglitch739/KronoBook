import React from 'react';
import IconoKronoBook from '../../assets/IconoKronoBook.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  // Configuración de tamaño responsivo según la prop 'size'
  let containerGap = 'gap-2';
  let imageClass = 'w-9 h-9 sm:w-11 sm:h-11';
  let textClass = 'text-xl sm:text-2xl font-black tracking-tight';

  if (size === 'sm') {
    containerGap = 'gap-1.5 sm:gap-2';
    imageClass = 'w-8 h-8 sm:w-9 sm:h-9';
    textClass = 'text-lg sm:text-xl font-black tracking-tight';
  } else if (size === 'lg') {
    containerGap = 'gap-3.5 sm:gap-5';
    imageClass = 'w-20 h-20 sm:w-28 sm:h-28';
    textClass = 'text-4xl sm:text-6xl font-black tracking-tight';
  }

  return (
    <div className={`group flex items-center cursor-pointer select-none ${containerGap} ${className}`}>
      {/* Icono de KronoBook original con efecto de brillo y hover */}
      <img
        src={IconoKronoBook}
        alt="KronoBook Logo"
        className={`${imageClass} object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]`}
      />
      {/* Texto de KronoBook con tipografía monospaced oficial (font-mono) */}
      <span className={`${textClass} font-mono text-zinc-50 transition-colors duration-300 leading-none group-hover:text-sky-100 group-hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]`}>
        Krono<span className="text-sky-400">Book</span>
      </span>
    </div>
  );
};

export default Logo;
