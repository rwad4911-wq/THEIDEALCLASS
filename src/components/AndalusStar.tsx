import React from 'react';

interface AndalusStarProps {
  className?: string;
  size?: number;
  variant?: 'gold' | 'emerald' | 'amber';
}

export const AndalusStar: React.FC<AndalusStarProps> = ({
  className = 'w-5 h-5',
  size = 24,
  variant = 'gold'
}) => {
  const colors = {
    gold: {
      outer: '#d4af37',
      inner: '#e6be44',
      center: '#8c6d23'
    },
    emerald: {
      outer: '#10b981',
      inner: '#34d399',
      center: '#064e3b'
    },
    amber: {
      outer: '#f59e0b',
      inner: '#fbbf24',
      center: '#78350f'
    }
  }[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer 8-pointed Andalusian Khatam star */}
      <polygon
        points="20,2 25,12 36,9 31,20 38,28 27,29 24,40 16,33 8,38 11,27 2,21 12,16"
        fill={colors.inner}
        stroke={colors.outer}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Inner geometric square rot 45 */}
      <rect
        x="13"
        y="13"
        width="14"
        height="14"
        fill="#041a12"
        stroke={colors.outer}
        strokeWidth="1"
      />
      <rect
        x="13"
        y="13"
        width="14"
        height="14"
        transform="rotate(45 20 20)"
        fill="#072a1e"
        stroke={colors.outer}
        strokeWidth="1"
      />
      {/* Central ceramic jewel dot */}
      <circle cx="20" cy="20" r="2.5" fill={colors.inner} />
    </svg>
  );
};
