import React from 'react';
import { ArrowUpRight, Compass, Sparkles } from 'lucide-react';
import RotatingStamp from '../common/RotatingStamp';
import { WheatMotif, LeafMotif } from '../common/BotanicalElements';

export default function HeroSection() {
  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        paddingTop: 'clamp(36px, 5vw, 64px)',
        paddingBottom: 'clamp(50px, 7vw, 90px)',
        overflow: 'hidden',
        backgroundColor: 'var(--color-cream)',
      }}
    >
      {/* Decorative Botanical Watermark */}
      <div
        style={{
          position: 'absolute',
          top: '6%',
          right: '2%',
          opacity: 0.16,
          pointerEvents: 'none',
          transform: 'rotate(12deg)',
        }}
        aria-hidden="true"
      >
        <WheatMotif size={90} color="var(--color-sage-dark)" />
      </div>

      <div className="container">
        {/* Asymmetrical 2-Column Editorial Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)',
            gap: 'clamp(32px, 5vw, 56px)',
            alignItems: 'center',
          }}
          className="hero-grid"
        >
          {/* Left Column: Headline & Concise Story */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="kicker kicker-saffron">
              <Sparkles size={12} color="var(--color-saffron-dark)" />
              <span>Chitkara University</span>
            </div>

            {/* Preserved Headline with Editorial Italic Flair */}
            <h1
              className="display-hero"
              style={{
                marginTop: 10,
                marginBottom: 20,
                color: 'var(--color-forest-dark)',
              }}
            >
              Every Meal<br />
              Deserves a<br />
              <span
                className="editorial-italic"
                style={{
                  color: 'var(--color-terracotta)',
                  position: 'relative',
                  display: 'inline-block',
                }}
              >
                Destination.
                <svg
                  viewBox="0 0 260 16"
                  fill="none"
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: -6,
                    width: '100%',
                    height: '10px',
                  }}
                  aria-hidden="true"
                >
                  <path
                    d="M3 12 C 70 3, 180 3, 255 11"
                    stroke="var(--color-sage)"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Concise Supporting Text (1-2 short sentences) */}
            <p
              className="lead-text"
              style={{
                marginBottom: 32,
                color: 'var(--text-secondary)',
                fontSize: 'clamp(1.05rem, 1.35vw, 1.2rem)',
                lineHeight: 1.5,
              }}
            >
              Connecting our campus kitchens with local communities to ensure fresh food never goes unserved.
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 14,
                marginBottom: 36,
              }}
            >
              <a
                href="/login"
                className="btn btn-primary"
                style={{
                  fontSize: '0.98rem',
                  padding: '13px 26px',
                }}
              >
                <span>Get Started</span>
                <ArrowUpRight size={17} />
              </a>

              <a
                href="#how-it-works"
                className="btn btn-secondary"
                style={{
                  fontSize: '0.98rem',
                  padding: '13px 24px',
                }}
              >
                <Compass size={16} color="var(--color-forest)" />
                <span>Discover FoodLoop</span>
              </a>
            </div>

            {/* Ultra-Concise Human Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--color-cream-border)',
              }}
            >
              <LeafMotif size={16} color="var(--color-forest)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-forest-dark)', fontWeight: 600 }}>
                Campus-wide redistribution across 7 residential messes
              </span>
            </div>
          </div>

          {/* Right Column: Visual Composition with Rotating Stamp */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            className="hero-visual-wrapper"
          >
            {/* Background Organic Wave Shape */}
            <div
              style={{
                position: 'absolute',
                inset: '-10px',
                background: 'linear-gradient(135deg, rgba(169, 198, 160, 0.3) 0%, rgba(24, 60, 50, 0.06) 100%)',
                borderRadius: '42% 58% 70% 30% / 45% 45% 55% 55%',
                transform: 'rotate(-4deg)',
                zIndex: 0,
              }}
              aria-hidden="true"
            />

            {/* Main Featured Food Photo Container */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: 460,
                borderRadius: 'var(--radius-organic-1)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)',
                border: '4px solid #FFFFFF',
                backgroundColor: 'var(--color-forest-dark)',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80"
                alt="Freshly prepared Indian campus meal with dal, rice, and chapati"
                style={{
                  width: '100%',
                  height: 420,
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'contrast(1.05) saturate(1.08)',
                }}
              />

              {/* Minimalist Editorial Photo Tag */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(16, 41, 34, 0.8) 0%, transparent 45%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '20px 24px',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.15rem',
                    color: 'var(--color-cream)',
                    fontWeight: 500,
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  Wholesome meals cooked daily across campus.
                </p>
              </div>
            </div>

            {/* Overlapping Vignette Card */}
            <div
              style={{
                position: 'absolute',
                bottom: -20,
                left: -20,
                zIndex: 3,
                width: 155,
                height: 155,
                borderRadius: 'var(--radius-organic-2)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                border: '3px solid #FFFFFF',
              }}
              className="vignette-card"
            >
              <img
                src="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80"
                alt="Fresh chapati and wholesome grains"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>

            {/* Rotating Stamp */}
            <div
              style={{
                position: 'absolute',
                top: -25,
                right: -20,
                zIndex: 3,
                backgroundColor: 'rgba(245, 240, 227, 0.96)',
                borderRadius: '50%',
                padding: 4,
                boxShadow: 'var(--shadow-md)',
                backdropFilter: 'blur(8px)',
              }}
              className="hero-stamp"
            >
              <RotatingStamp size={118} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .hero-visual-wrapper {
            margin-top: 10px;
          }
          .vignette-card {
            display: none !important;
          }
          .hero-stamp {
            top: -12px !important;
            right: 0 !important;
          }
        }
      `}</style>
    </section>
  );
}
