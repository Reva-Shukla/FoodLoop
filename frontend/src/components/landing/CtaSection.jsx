import React from 'react';
import { ArrowUpRight, Compass, Sparkles } from 'lucide-react';
import { WheatMotif } from '../common/BotanicalElements';
import { Link } from 'react-router-dom';

export default function CtaSection() {
  return (
    <section
      id="cta"
      style={{
        paddingTop: 'clamp(40px, 5vw, 64px)',
        paddingBottom: 'clamp(56px, 7vw, 88px)',
        backgroundColor: 'var(--color-cream)',
        position: 'relative',
      }}
    >
      <div className="container">
        {/* Curved Card Container */}
        <div
          style={{
            backgroundColor: 'var(--color-forest)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(40px, 6vw, 68px) clamp(24px, 5vw, 56px)',
            color: 'var(--color-cream)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
            textAlign: 'center',
          }}
        >
          {/* Subtle Botanical Silhouette */}
          <div
            style={{
              position: 'absolute',
              right: -30,
              bottom: -40,
              opacity: 0.07,
              pointerEvents: 'none',
              transform: 'rotate(-15deg)',
            }}
            aria-hidden="true"
          >
            <WheatMotif size={360} color="#FFFFFF" />
          </div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
            <div className="kicker kicker-light" style={{ marginBottom: 14 }}>
              <Sparkles size={12} color="var(--color-sage)" />
              <span>Join FoodLoop</span>
            </div>

            <h2
              className="display-section"
              style={{
                color: 'var(--color-cream)',
                marginBottom: 16,
                lineHeight: 1.08,
              }}
            >
              Small actions.<br />
              <span className="editorial-italic" style={{ color: 'var(--color-saffron)' }}>
                Lasting impact.
              </span>
            </h2>

            {/* Short Supporting Sentence */}
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(1.05rem, 1.3vw, 1.18rem)',
                color: 'var(--color-sage-light)',
                lineHeight: 1.5,
                marginBottom: 32,
              }}
            >
              Join our campus initiative to make food waste a thing of the past.
            </p>

            {/* CTAs */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 14,
              }}
            >
              <Link
                to="/login"
                className="btn btn-saffron"
                style={{
                  fontSize: '0.98rem',
                  padding: '13px 26px',
                }}
              >
                <span>Access Demo Portals</span>
                <ArrowUpRight size={17} />
              </Link>

              <a
                href="#our-campus"
                className="btn btn-outline-cream"
                style={{
                  fontSize: '0.98rem',
                  padding: '13px 24px',
                }}
              >
                <Compass size={16} />
                <span>View Campus Messes</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
