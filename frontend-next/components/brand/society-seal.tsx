import React from 'react';

interface SocietySealProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export function SocietySeal({ size = 56, className = '', glow = false }: SocietySealProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 ${
        glow ? 'drop-shadow-[0_0_16px_rgba(216,178,110,0.3)]' : ''
      } ${className}`}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <radialGradient id="sealBurgundyGrad" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#5C161D" />
            <stop offset="65%" stopColor="#3B0C11" />
            <stop offset="100%" stopColor="#0F1218" />
          </radialGradient>

          <linearGradient id="goldRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5E4B7" />
            <stop offset="35%" stopColor="#D8B26E" />
            <stop offset="70%" stopColor="#C5A059" />
            <stop offset="100%" stopColor="#8C6D2D" />
          </linearGradient>

          <linearGradient id="shieldBorderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D8B26E" />
            <stop offset="100%" stopColor="#8C6D2D" />
          </linearGradient>
        </defs>

        {/* Outer Concentric Beaded Border */}
        <circle cx="60" cy="60" r="57" stroke="#262C3A" strokeWidth="1" opacity="0.6" />
        <circle cx="60" cy="60" r="54" stroke="url(#goldRimGrad)" strokeWidth="1.6" strokeDasharray="2 3" opacity="0.8" />
        <circle cx="60" cy="60" r="50" stroke="#C5A059" strokeWidth="1.2" />
        <circle cx="60" cy="60" r="47.5" stroke="#8C6D2D" strokeWidth="0.6" opacity="0.8" />

        {/* 8 Cardinal Star Studs */}
        <circle cx="60" cy="7" r="1.6" fill="#D8B26E" />
        <circle cx="60" cy="113" r="1.6" fill="#D8B26E" />
        <circle cx="7" cy="60" r="1.6" fill="#D8B26E" />
        <circle cx="113" cy="60" r="1.6" fill="#D8B26E" />
        <circle cx="22" cy="22" r="1.2" fill="#C5A059" />
        <circle cx="98" cy="22" r="1.2" fill="#C5A059" />
        <circle cx="22" cy="98" r="1.2" fill="#C5A059" />
        <circle cx="98" cy="98" r="1.2" fill="#C5A059" />

        {/* Heraldic Laurel Wreath - Left Branch */}
        <path d="M30 75 C 23 64, 24 45, 36 34 C 33 40, 33 48, 38 54 C 32 58, 31 66, 36 72 Z" fill="#C5A059" opacity="0.9" />
        <path d="M26 62 C 21 55, 22 44, 30 38 C 28 44, 29 50, 33 55 Z" fill="#D8B26E" opacity="0.95" />
        <path d="M33 45 C 30 38, 33 30, 42 26 C 39 31, 40 37, 43 41 Z" fill="#C5A059" opacity="0.9" />

        {/* Heraldic Laurel Wreath - Right Branch */}
        <path d="M90 75 C 97 64, 96 45, 84 34 C 87 40, 87 48, 82 54 C 88 58, 89 66, 84 72 Z" fill="#C5A059" opacity="0.9" />
        <path d="M94 62 C 99 55, 98 44, 90 38 C 92 44, 91 50, 87 55 Z" fill="#D8B26E" opacity="0.95" />
        <path d="M87 45 C 90 38, 87 30, 78 26 C 81 31, 80 37, 77 41 Z" fill="#C5A059" opacity="0.9" />

        {/* Heraldic Shield Body */}
        <path
          d="M60 21 C 76 21, 83 27, 83 45 C 83 69, 60 90, 60 90 C 60 90, 37 69, 37 45 C 37 27, 44 21, 60 21 Z"
          fill="url(#sealBurgundyGrad)"
          stroke="url(#shieldBorderGrad)"
          strokeWidth="1.8"
        />

        {/* Shield Inner Hairline Inset */}
        <path
          d="M60 25 C 73 25, 79 30, 79 45 C 79 65, 60 84, 60 84 C 60 84, 41 65, 41 45 C 41 30, 47 25, 60 25 Z"
          fill="none"
          stroke="#C5A059"
          strokeWidth="0.8"
          opacity="0.6"
        />

        {/* Central 8-Pointed Compass Star & Radiant Intellect Motif */}
        <polygon points="60,31 62.5,49 60,53 57.5,49" fill="#D8B26E" />
        <polygon points="60,75 62.5,57 60,53 57.5,57" fill="#8C6D2D" />
        <polygon points="38,53 56,50.5 60,53 56,55.5" fill="#C5A059" />
        <polygon points="82,53 64,50.5 60,53 64,55.5" fill="#D8B26E" />
        <polygon points="44,37 58,49 60,53 56,51" fill="#C5A059" opacity="0.85" />
        <polygon points="76,69 62,57 60,53 64,55" fill="#8C6D2D" opacity="0.85" />
        <polygon points="76,37 62,49 60,53 64,51" fill="#D8B26E" opacity="0.85" />
        <polygon points="44,69 58,57 60,53 56,55" fill="#C5A059" opacity="0.85" />

        {/* Core Jewel */}
        <circle cx="60" cy="53" r="3.2" fill="#FFFFFF" />
        <circle cx="60" cy="53" r="2" fill="#D8B26E" />
      </svg>
    </div>
  );
}
