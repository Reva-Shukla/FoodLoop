import React from 'react';

/**
 * Preserved FoodLoop Logo & Brand Mark
 * Features the signature circular leaf-loop emblem with organic return arrow,
 * symbolizing closed-loop food stewardship.
 */
export default function FoodLoopLogo({ variant = 'default', size = 'default' }) {
  const isLight = variant === 'light';

  const markSize = size === 'large' ? 44 : size === 'small' ? 32 : 38;
  const textSize = size === 'large' ? '1.55rem' : size === 'small' ? '1.15rem' : '1.35rem';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 11, userSelect: 'none' }}>
      {/* Botanical Loop SVG Mark */}
      <div
        style={{
          width: markSize,
          height: markSize,
          borderRadius: '50%',
          backgroundColor: isLight ? 'rgba(169, 198, 160, 0.15)' : 'var(--color-forest)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: isLight ? '1.5px solid var(--color-sage)' : '1.5px solid var(--color-forest-dark)',
          boxShadow: isLight ? 'none' : '0 3px 10px rgba(24, 60, 50, 0.2)',
          flexShrink: 0,
        }}
      >
        <svg
          width={markSize * 0.58}
          height={markSize * 0.58}
          viewBox="0 0 24 24"
          fill="none"
          stroke={isLight ? '#F5F0E3' : '#F5F0E3'}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Continuous leaf loop */}
          <path
            d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"
            stroke={isLight ? 'var(--color-sage)' : '#A9C6A0'}
          />
          <path
            d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"
            stroke={isLight ? 'var(--color-saffron)' : '#E6A23C'}
          />
        </svg>
      </div>

      {/* Brand Wordmark & Subtitle */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: textSize,
              fontWeight: 700,
              color: isLight ? 'var(--color-cream)' : 'var(--color-forest)',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
            }}
          >
            Food
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: textSize,
              fontWeight: 700,
              color: 'var(--color-saffron)',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
            }}
          >
            Loop
          </span>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.66rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: isLight ? 'var(--color-sage)' : 'var(--text-muted)',
            lineHeight: 1,
            marginTop: 2,
          }}
        >
          Chitkara University
        </span>
      </div>
    </div>
  );
}
