import React from 'react';
import { Sparkles } from 'lucide-react';
import { LeafMotif, WheatMotif } from '../common/BotanicalElements';
import RotatingStamp from '../common/RotatingStamp';

export default function SustainabilitySection() {
  return (
    <section
      id="sustainability"
      style={{
        paddingTop: 'clamp(64px, 8vw, 108px)',
        paddingBottom: 'clamp(64px, 8vw, 108px)',
        backgroundColor: 'var(--color-forest)',
        color: 'var(--color-cream)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Botanical Watermark */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          opacity: 0.08,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <WheatMotif size={320} color="#FFFFFF" />
      </div>

      <div className="container">
        {/* Asymmetrical Editorial Composition (Photo + Powerful Statement) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 0.95fr) minmax(0, 1.05fr)',
            gap: 'clamp(36px, 6vw, 64px)',
            alignItems: 'center',
          }}
          className="sustainability-editorial-grid"
        >
          {/* Left: Striking Editorial Photography with Curved Organic Mask */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: 'var(--radius-organic-1)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-dark)',
                border: '3px solid rgba(169, 198, 160, 0.35)',
                position: 'relative',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80"
                alt="Nutritious food shared with community"
                style={{
                  width: '100%',
                  height: 380,
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'contrast(1.08) brightness(0.95)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(11, 29, 24, 0.8) 0%, transparent 50%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <LeafMotif size={18} color="var(--color-sage)" />
                  <span style={{ fontSize: '0.88rem', color: 'var(--color-cream)', fontWeight: 500 }}>
                    Respecting every portion cooked on campus
                  </span>
                </div>
              </div>
            </div>

            {/* Subtle floating rotating stamp */}
            <div
              style={{
                position: 'absolute',
                top: -20,
                left: -20,
                zIndex: 2,
              }}
              className="sustainability-stamp"
            >
              <RotatingStamp size={105} dark={true} />
            </div>
          </div>

          {/* Right: Strong Headline & Minimal Copy */}
          <div>
            <div className="kicker kicker-light" style={{ marginBottom: 16 }}>
              <Sparkles size={12} color="var(--color-sage)" />
              <span>Sustainability With Dignity</span>
            </div>

            <h2
              className="display-section"
              style={{
                color: 'var(--color-cream)',
                marginBottom: 20,
                lineHeight: 1.1,
              }}
            >
              Surplus isn't waste.<br />
              It's a meal waiting for<br />
              <span className="editorial-italic" style={{ color: 'var(--color-sage)' }}>
                someone who needs it.
              </span>
            </h2>

            {/* Minimal Copy (One short sentence) */}
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(1.05rem, 1.3vw, 1.18rem)',
                color: 'var(--color-sage-light)',
                lineHeight: 1.55,
                marginBottom: 32,
                maxWidth: 520,
              }}
            >
              Every serving saved honours the labor, water, and agricultural care that brought it to our tables.
            </p>

            {/* Clean Micro-Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--color-cream)',
                  backgroundColor: 'rgba(169, 198, 160, 0.16)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid rgba(169, 198, 160, 0.3)',
                }}
              >
                UN SDG 12 · Responsible Consumption
              </span>

              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--color-saffron)',
                  backgroundColor: 'rgba(230, 162, 60, 0.15)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid rgba(230, 162, 60, 0.3)',
                }}
              >
                UN SDG 2 · Zero Hunger
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .sustainability-editorial-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .sustainability-stamp {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
