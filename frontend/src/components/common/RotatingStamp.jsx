import React from 'react';

/**
 * Editorial Rotating Stamp
 * Inspired by Reference 1 (Savora) & Reference 5 (Legurmè).
 * Displays a circular SVG text seal rotating gently around a central botanical motif.
 */
export default function RotatingStamp({ size = 130, dark = false }) {
  const textColor = dark ? '#F5F0E3' : '#183C32';
  const subColor = dark ? '#A9C6A0' : '#8BA882';

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
      className="animate-spin-slow"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ overflow: 'visible' }}
      >
        <path
          id="stampTextPath"
          d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
          fill="none"
        />
        <text
          fontSize="9.2"
          fontWeight="600"
          letterSpacing="2.2"
          fill={textColor}
          style={{
            fontFamily: 'var(--font-sans)',
            textTransform: 'uppercase',
            opacity: 0.85,
          }}
        >
          <textPath href="#stampTextPath" startOffset="0%">
            EVERY MEAL DESERVES A DESTINATION • CHITKARA UNIVERSITY •
          </textPath>
        </text>
      </svg>

      {/* Central Botanical Icon */}
      <div
        style={{
          position: 'absolute',
          width: size * 0.38,
          height: size * 0.38,
          borderRadius: '50%',
          backgroundColor: dark ? 'rgba(169, 198, 160, 0.18)' : 'rgba(24, 60, 50, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px dashed ${subColor}`,
        }}
      >
        <svg
          width={size * 0.2}
          height={size * 0.2}
          viewBox="0 0 24 24"
          fill="none"
          stroke={dark ? '#A9C6A0' : '#183C32'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Z" />
          <path d="M12 9v4" />
        </svg>
      </div>
    </div>
  );
}
