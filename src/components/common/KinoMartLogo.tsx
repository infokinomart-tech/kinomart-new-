import React from 'react';
import logoImg from '../../assets/images/kinomart_logo_1785316381299.jpg';

interface KinoMartLogoProps {
  className?: string;
  showBg?: boolean;
  logoUrl?: string;
}

export const KinoMartLogo: React.FC<KinoMartLogoProps> = ({ 
  className = "w-10 h-10",
  showBg = true,
  logoUrl
}) => {
  const srcToUse = logoUrl || logoImg;

  if (srcToUse) {
    return (
      <div className={`relative flex items-center justify-center rounded-xl overflow-hidden ${showBg ? 'bg-black p-0.5 shadow-md border border-black' : ''} ${className}`}>
        <img 
          src={srcToUse} 
          alt="KinoMart Logo" 
          className="w-full h-full object-cover rounded-lg"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center rounded-xl overflow-hidden ${showBg ? 'bg-black p-1.5 shadow-md' : ''} ${className}`}>
      <svg viewBox="0 0 500 500" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Top-left slanted bar - White */}
        <path d="M190 140 H280 L230 255 H165 Z" fill="#FFFFFF" />
        
        {/* Top-right diagonal arm - White */}
        <path d="M255 230 L395 140 H320 L210 220 Z" fill="#FFFFFF" />
        
        {/* Bottom-right diagonal leg - Vibrant Lime Green */}
        <path d="M230 250 L380 335 H305 L195 275 Z" fill="#84CC16" />
        
        {/* Speed lines - Vibrant Lime Green */}
        <rect x="90" y="250" width="55" height="13" rx="6.5" fill="#84CC16" />
        <rect x="120" y="273" width="40" height="13" rx="6.5" fill="#84CC16" />
        <rect x="70" y="296" width="65" height="13" rx="6.5" fill="#84CC16" />
        
        {/* Shopping Cart Body - Vibrant Lime Green */}
        <path d="M135 250 H240 L195 310 H140 Z" fill="#84CC16" />
        
        {/* Cart Wheels - Vibrant Lime Green */}
        <circle cx="155" cy="332" r="12" fill="#84CC16" />
        <circle cx="188" cy="332" r="12" fill="#84CC16" />
      </svg>
    </div>
  );
};

