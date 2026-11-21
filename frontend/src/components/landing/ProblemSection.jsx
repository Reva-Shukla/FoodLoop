import React from 'react';
import { AlertCircle, Clock, UtensilsCrossed, ArrowRight } from 'lucide-react';
import { LeafMotif } from '../common/BotanicalElements';

export default function ProblemSection() {
  const highlights = [
    {
      num: '01',
      title: 'Daily Surplus',
      desc: 'Buffering for fluctuating attendance creates unavoidable meal surplus.',
    },
    {
      num: '02',
      title: 'A Rapid Window',
      desc: 'Freshly cooked meals must be claimed and moved within hours.',
    },
    {
      num: '03',
      title: 'The Missing Link',
      desc: 'Without a shared platform, kitchens and local charities operate in silos.',
    },
  ];

  return (
    <section
      id="the-problem"
      style={{
        paddingTop: 'clamp(56px, 7vw, 96px)',
        paddingBottom: 'clamp(56px, 7vw, 96px)',
        backgroundColor: 'var(--color-cream-light)',
        borderTop: '1px solid var(--color-cream-border)',
        borderBottom: '1px solid var(--color-cream-border)',
        position: 'relative',
      }}
    >
      <div className="container">
        {/* Asymmetrical 2-Column Editorial Showcase */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 0.95fr) minmax(0, 1.05fr)',
            gap: 'clamp(36px, 6vw, 68px)',
            alignItems: 'center',
          }}
          className="problem-grid"
        >
          {/* Left Column: Editorial Photo with Warm Organic Shape */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: 'var(--radius-organic-2)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                border: '3px solid #FFFFFF',
                backgroundColor: 'var(--color-forest)',
                position: 'relative',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80"
                alt="University kitchen preparation"
                style={{
                  width: '100%',
                  height: 380,
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'contrast(1.05)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(16, 41, 34, 0.75) 0%, transparent 60%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '24px',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontSize: '1.15rem',
                    color: 'var(--color-cream)',
                    margin: 0,
                  }}
                >
                  "Surplus happens daily. The challenge is connecting it in time."
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Statement & 3 Highlights */}
          <div>
            <div className="kicker kicker-terracotta" style={{ marginBottom: 12 }}>
              <AlertCircle size={12} color="var(--color-terracotta)" />
              <span>The Campus Reality</span>
            </div>

            <h2 className="display-section" style={{ marginBottom: 16 }}>
              Good food shouldn't <br />
              <span className="editorial-italic" style={{ color: 'var(--color-terracotta)' }}>
                go to waste.
              </span>
            </h2>

            {/* Single Strong Statement */}
            <p
              className="lead-text"
              style={{
                marginBottom: 36,
                fontSize: '1.08rem',
                lineHeight: 1.55,
                color: 'var(--text-secondary)',
              }}
            >
              Campus kitchens prepare thousands of meals daily. When service concludes, wholesome food is too often lost to time — not intent.
            </p>

            {/* Three Ultra-Concise Highlights (Editorial rows, not heavy cards) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {highlights.map((item) => (
                <div
                  key={item.num}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 18,
                    paddingBottom: 16,
                    borderBottom: '1px solid var(--color-cream-border)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--color-terracotta)',
                    }}
                  >
                    {item.num}
                  </span>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.18rem',
                        fontWeight: 600,
                        color: 'var(--color-forest-dark)',
                        marginBottom: 4,
                      }}
                    >
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .problem-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </section>
  );
}
