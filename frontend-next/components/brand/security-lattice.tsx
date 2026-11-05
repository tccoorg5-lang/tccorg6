'use client';

import React from 'react';

interface SecurityLatticeProps {
  className?: string;
  size?: number;
  interactive?: boolean;
}

export function SecurityLattice({
  className = '',
  size = 520,
}: SecurityLatticeProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center pointer-events-none select-none opacity-40 ${className}`}
    >
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Radial Gold Lighting */}
          <radialGradient id="latticeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C5A059" stopOpacity="0.15" />
            <stop offset="60%" stopColor="#C5A059" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#080A0E" stopOpacity="0" />
          </radialGradient>

          {/* Electric Cyan Accent Gradient */}
          <linearGradient id="cyanArc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.1" />
          </linearGradient>

          {/* Antique Gold Gradient */}
          <linearGradient id="goldArc" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8C6D2D" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#C5A059" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#D8B26E" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Ambient Center Glow */}
        <circle cx="250" cy="250" r="230" fill="url(#latticeGlow)" />

        {/* Outer Coordinate Grid Lines */}
        <line x1="250" y1="20" x2="250" y2="480" stroke="#262C3A" strokeWidth="0.8" strokeDasharray="3 5" />
        <line x1="20" y1="250" x2="480" y2="250" stroke="#262C3A" strokeWidth="0.8" strokeDasharray="3 5" />

        {/* Outer Concentric Orbital Ring 1 (Slow clockwise rotation) */}
        <g className="animate-reticle origin-center">
          <circle cx="250" cy="250" r="220" stroke="#C5A059" strokeWidth="1" strokeDasharray="4 8" opacity="0.4" />
          <path d="M250 30 A 220 220 0 0 1 470 250" stroke="url(#goldArc)" strokeWidth="1.5" />
          <circle cx="470" cy="250" r="3" fill="#D8B26E" />
          <circle cx="250" cy="30" r="2.5" fill="#C5A059" />
          <circle cx="30" cy="250" r="3" fill="#D8B26E" />
        </g>

        {/* Concentric Ring 2 (Counter-clockwise rotation with reticle notches) */}
        <g className="animate-reticle-reverse origin-center">
          <circle cx="250" cy="250" r="175" stroke="#262C3A" strokeWidth="1" opacity="0.6" />
          <path d="M250 75 A 175 175 0 0 0 75 250" stroke="url(#cyanArc)" strokeWidth="1.5" opacity="0.7" />
          
          {/* Compass Tick Marks */}
          <line x1="250" y1="70" x2="250" y2="80" stroke="#C5A059" strokeWidth="1.5" />
          <line x1="250" y1="420" x2="250" y2="430" stroke="#C5A059" strokeWidth="1.5" />
          <line x1="70" y1="250" x2="80" y2="250" stroke="#C5A059" strokeWidth="1.5" />
          <line x1="420" y1="250" x2="430" y2="250" stroke="#C5A059" strokeWidth="1.5" />

          {/* Node Lattice Vertices */}
          <circle cx="373" cy="126" r="2.5" fill="#38BDF8" />
          <circle cx="126" cy="373" r="2.5" fill="#38BDF8" />
        </g>

        {/* Concentric Ring 3 (Radar Sweep Layer) */}
        <circle cx="250" cy="250" r="125" stroke="#C5A059" strokeWidth="0.8" strokeDasharray="2 4" opacity="0.5" />
        
        {/* Abstract Hexagonal Cryptographic Core */}
        <polygon
          points="250,170 319,210 319,290 250,330 181,290 181,210"
          stroke="#C5A059"
          strokeWidth="1.2"
          fill="rgba(197, 160, 89, 0.03)"
          opacity="0.8"
        />

        <polygon
          points="250,190 302,220 302,280 250,310 198,280 198,220"
          stroke="#262C3A"
          strokeWidth="0.8"
          strokeDasharray="2 3"
          opacity="0.7"
        />

        {/* Central Core Pulse Point */}
        <circle cx="250" cy="250" r="24" stroke="#C5A059" strokeWidth="0.8" opacity="0.6" />
        <circle cx="250" cy="250" r="10" fill="#C5A059" opacity="0.2" className="animate-ping origin-center" />
        <circle cx="250" cy="250" r="4" fill="#D8B26E" />

        {/* Cryptographic Lattice Connectors */}
        <line x1="181" y1="210" x2="126" y2="175" stroke="#262C3A" strokeWidth="0.8" opacity="0.5" />
        <line x1="319" y1="210" x2="374" y2="175" stroke="#262C3A" strokeWidth="0.8" opacity="0.5" />
        <line x1="250" y1="330" x2="250" y2="390" stroke="#262C3A" strokeWidth="0.8" opacity="0.5" />
      </svg>
    </div>
  );
}
