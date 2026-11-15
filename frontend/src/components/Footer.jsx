import React from 'react';
import { Heart, ShieldCheck, RefreshCw } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid var(--border)',
      padding: '32px 24px 24px',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: 1240,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16
      }}>
        {/* Quote Banner matching Reference UI */}
        <div style={{
          backgroundColor: 'var(--primary-light)',
          border: '1px dashed var(--sage)',
          borderRadius: 30,
          padding: '10px 24px',
          color: 'var(--primary)',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          textAlign: 'center'
        }}>
          <Heart size={16} fill="#2C5E3B" color="#2C5E3B" />
          <span>"Every meal shared is a smile created." – FoodLoop</span>
        </div>

        {/* Member 1 & Architecture Details */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 20,
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} color="var(--primary)" />
            <strong>FoodLoop Platform</strong>: Member 1 – Donor Management Module
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} color="var(--accent-saffron)" />
            Core Java HTTP Server + MySQL + PreparedStatement + Multithreading
          </span>
        </div>

        <p style={{ fontSize: '0.75rem', color: '#88998C', textAlign: 'center' }}>
          Food safety declaration: FoodLoop provides surplus food matching. All donations are unserved surplus verified by registered donors.
        </p>
      </div>
    </footer>
  );
}
