import React from 'react';
import { ClipboardList, HeartHandshake, LineChart, ArrowRight } from 'lucide-react';
import { LeafMotif } from '../common/BotanicalElements';

export default function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Track',
      desc: 'Mess managers record surplus portions right after meal service.',
      icon: ClipboardList,
      accent: 'var(--color-saffron)',
      bg: 'var(--color-saffron-light)',
    },
    {
      step: '02',
      title: 'Redistribute',
      desc: 'Verified local NGOs claim batches and coordinate prompt pickup.',
      icon: HeartHandshake,
      accent: 'var(--color-terracotta)',
      bg: 'var(--color-terracotta-light)',
    },
    {
      step: '03',
      title: 'Improve',
      desc: 'Campus supervisors analyze trends to optimize future kitchen prep.',
      icon: LineChart,
      accent: 'var(--color-forest)',
      bg: 'var(--color-forest-surface)',
    },
  ];

  return (
    <section
      id="how-it-works"
      style={{
        paddingTop: 'clamp(56px, 7vw, 96px)',
        paddingBottom: 'clamp(56px, 7vw, 96px)',
        backgroundColor: 'var(--color-cream)',
        position: 'relative',
      }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 48px auto' }}>
          <div className="kicker kicker-light" style={{ backgroundColor: 'rgba(24, 60, 50, 0.06)' }}>
            <LeafMotif size={13} color="var(--color-forest)" />
            <span>How FoodLoop Works</span>
          </div>

          <h2 className="display-section" style={{ marginTop: 10, marginBottom: 14 }}>
            Closing the{' '}
            <span className="editorial-italic" style={{ color: 'var(--color-forest)' }}>
              food loop.
            </span>
          </h2>

          <p className="lead-text" style={{ margin: '0 auto', fontSize: '1.05rem' }}>
            Three simple steps from campus kitchen to community plate.
          </p>
        </div>

        {/* 3 Step Editorial Stepper (Light, spacious, horizontal flow) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(20px, 3vw, 40px)',
            position: 'relative',
          }}
          className="steps-flow-grid"
        >
          {steps.map((s, index) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  position: 'relative',
                  padding: '28px 24px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid var(--color-cream-border)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.25s, box-shadow 0.25s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                {/* Icon & Step Number */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: '50%',
                      backgroundColor: s.bg,
                      color: s.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={22} />
                  </div>

                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                    }}
                  >
                    {s.step}
                  </span>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.55rem',
                    fontWeight: 600,
                    color: 'var(--color-forest-dark)',
                    marginBottom: 8,
                  }}
                >
                  {s.title}
                </h3>

                {/* Single Short Sentence */}
                <p
                  style={{
                    fontSize: '0.94rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .steps-flow-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </section>
  );
}
