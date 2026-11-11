import React from 'react';

interface AlAndalusLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const AlAndalusLogo: React.FC<AlAndalusLogoProps> = ({
  className = '',
  size = 52,
  showText = false
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md select-none"
        aria-label="Al-Andalus Schools Saudi Arabia Logo"
      >
        <defs>
          {/* Gold metallic gradient for emblems and accents */}
          <linearGradient id="saudiGoldGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#e5b945" />
            <stop offset="75%" stopColor="#c59b27" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          {/* Deep Royal Saudi Blue Gradient */}
          <linearGradient id="saudiBlueShield" x1="15" y1="15" x2="105" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="40%" stopColor="#0f2b5c" />
            <stop offset="100%" stopColor="#08172c" />
          </linearGradient>

          {/* Core Crest Inner Gradient */}
          <linearGradient id="saudiInnerGrad" x1="30" y1="30" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#0a2347" />
          </linearGradient>

          <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.75" />
          </filter>
        </defs>

        {/* 1. Outer Star of Knowledge / Academic Crest Border */}
        <circle cx="60" cy="60" r="56" fill="#08172c" stroke="#ffffff" strokeWidth="2.5" />
        <circle cx="60" cy="60" r="51.5" fill="url(#saudiBlueShield)" stroke="url(#saudiGoldGrad)" strokeWidth="1" strokeDasharray="3 2" />

        {/* 2. Top Arch Text: "المملكة العربية السعودية" (Kingdom of Saudi Arabia) */}
        <path id="ksaTextPath" d="M22 60 A38 38 0 0 1 98 60" fill="none" />
        <text fill="#fef08a" fontSize="6.5" fontWeight="700" fontFamily="'Cairo', sans-serif">
          <textPath href="#ksaTextPath" startOffset="50%" textAnchor="middle">
            المملكة العربية السعودية • K.S.A
          </textPath>
        </text>

        {/* 3. Center Educational Emblem: Open Book of Knowledge + Torch/Sun Rays */}
        <g transform="translate(60, 52)">
          {/* Sun Rays of Enlightenment */}
          <path d="M-18 -14 L-14 -8 M0 -18 L0 -10 M18 -14 L14 -8" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="0" cy="-6" r="3" fill="#fef08a" />

          {/* Open Book Pages (كتاب العلم المفتوح) */}
          {/* Left Page */}
          <path
            d="M-1 -1 C-7 -4 -16 -4 -22 -1 L-22 13 C-16 10 -7 10 -1 13 Z"
            fill="#ffffff"
            stroke="#0a2347"
            strokeWidth="1"
          />
          {/* Left Page Text lines */}
          <line x1="-18" y1="3" x2="-6" y2="1.5" stroke="#1e40af" strokeWidth="0.8" />
          <line x1="-18" y1="7" x2="-7" y2="5.5" stroke="#1e40af" strokeWidth="0.8" />

          {/* Right Page */}
          <path
            d="M1 -1 C7 -4 16 -4 22 -1 L22 13 C16 10 7 10 1 13 Z"
            fill="#ffffff"
            stroke="#0a2347"
            strokeWidth="1"
          />
          {/* Right Page Text lines */}
          <line x1="6" y1="1.5" x2="18" y2="3" stroke="#1e40af" strokeWidth="0.8" />
          <line x1="7" y1="5.5" x2="18" y2="7" stroke="#1e40af" strokeWidth="0.8" />

          {/* Book Spine */}
          <path d="M-1 -1 L0 13 L1 -1 Z" fill="#e5b945" />
        </g>

        {/* 4. Center Banner: "مدارس الأندلس" */}
        <rect x="20" y="72" width="80" height="18" rx="5" fill="#ffffff" stroke="#e5b945" strokeWidth="1.2" filter="url(#logoShadow)" />
        <text
          x="60"
          y="84.5"
          textAnchor="middle"
          fill="#08172c"
          fontFamily="'Cairo', sans-serif"
          fontSize="11.5"
          fontWeight="900"
        >
          مدارس الأندلس
        </text>

        {/* 5. Subtitle: "AL-ANDALUS SCHOOLS" */}
        <text
          x="60"
          y="99"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontSize="6"
          fontWeight="800"
          letterSpacing="1.2"
        >
          AL-ANDALUS SCHOOLS
        </text>

        {/* 6. Bottom Laurel / Palm Frond of Excellence */}
        <path
          d="M38 104 C48 108 72 108 82 104"
          fill="none"
          stroke="url(#saudiGoldGrad)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="44" cy="105.5" r="1.3" fill="#fef08a" />
        <circle cx="52" cy="107" r="1.3" fill="#ffffff" />
        <circle cx="60" cy="107.5" r="1.5" fill="#fef08a" />
        <circle cx="68" cy="107" r="1.3" fill="#ffffff" />
        <circle cx="76" cy="105.5" r="1.3" fill="#fef08a" />
      </svg>

      {showText && (
        <div className="flex flex-col text-left rtl:text-right">
          <span className="text-lg font-black tracking-wide text-white leading-tight font-sans">
            مدارس الأندلس
          </span>
          <span className="text-[10px] font-bold text-sky-200 tracking-wider font-sans uppercase">
            AL-ANDALUS SCHOOLS • KSA
          </span>
        </div>
      )}
    </div>
  );
};
