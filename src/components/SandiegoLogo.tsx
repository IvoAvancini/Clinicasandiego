import React from 'react';
import sandiegoLogoSvg from '../assets/sandiego-logo.svg';

interface SandiegoLogoProps {
  className?: string;
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

export function SandiegoLogo({ className = '', variant = 'full', size = 'md' }: SandiegoLogoProps) {
  // Prominent height classes for perfect centering & high resolution
  const heightClass = size === 'sm' ? 'h-12' : size === 'lg' ? 'h-24' : 'h-16';

  if (variant === 'icon') {
    return (
      <img
        src={sandiegoLogoSvg}
        alt="Símbolo Oficial Sandiego"
        className={`${heightClass} w-auto object-contain shrink-0 rounded-full shadow-xs ${className}`}
      />
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none min-w-0 ${className}`}>
      {/* Emblem Symbol with White Background Circle */}
      <img
        src={sandiegoLogoSvg}
        alt="Emblema Oficial Sandiego"
        className={`${heightClass} w-auto object-contain shrink-0 rounded-full shadow-xs`}
      />

      {/* Typography Matched to Official Brand */}
      <div className="flex flex-col justify-center leading-none min-w-0">
        <span className="text-xl font-bold tracking-tight text-[#E5C782] font-['Plus_Jakarta_Sans']">
          Sandiego
        </span>

        {/* Subtitle flanked by silver dashes */}
        <div className="flex items-center gap-1 mt-1">
          <span className="h-[2px] w-2 bg-gradient-to-r from-slate-400 to-slate-200 rounded-full inline-block shrink-0 opacity-80" />
          <span className="text-[10px] font-semibold text-[#E5C782] tracking-tight uppercase whitespace-nowrap opacity-95">
            Clínica Médica e Vacinas
          </span>
          <span className="h-[2px] w-2 bg-gradient-to-r from-slate-200 to-slate-400 rounded-full inline-block shrink-0 opacity-80" />
        </div>
      </div>
    </div>
  );
}
