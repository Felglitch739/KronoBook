import React from 'react';
import { Clock } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  // Ajuste de tamaño del icono de reloj
  const clockSize = size === 'lg' ? 28 : size === 'sm' ? 18 : 22;
  
  // Clases de tamaño del texto
  const textClass = size === 'lg'
    ? 'text-2xl sm:text-3xl font-black tracking-tight'
    : size === 'sm'
    ? 'text-base font-black tracking-tight'
    : 'text-lg sm:text-xl font-black tracking-tight';

  return (
    <div className={`group flex items-center gap-1.5 cursor-pointer select-none ${className}`}>
      {/* Icono del reloj de lucide-react con efecto de brillo celeste */}
      <Clock 
        size={clockSize} 
        className="text-sky-400 transition-transform duration-500 group-hover:rotate-12 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" 
      />
      {/* Texto de KronoBook con tipografía monospaced oficial (font-mono) */}
      <span className={`${textClass} font-mono text-zinc-50 transition-colors duration-300 leading-none group-hover:text-sky-100 group-hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]`}>
        Krono<span className="text-sky-400">Book</span>
      </span>
    </div>
  );
};

export default Logo;
