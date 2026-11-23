import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { useFoodLoop } from '../context/FoodLoopContext';

export default function DashboardLayout({ title, children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { dbError, refreshData } = useFoodLoop();

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--color-cream-light)',
      }}
    >
      {/* Sidebar Component */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(16, 41, 34, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 90,
          }}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: '100vh',
        }}
      >
        <DashboardHeader
          title={title}
          onToggleMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        <main
          style={{
            flex: 1,
            padding: 'clamp(20px, 3.5vw, 36px)',
            maxWidth: 1280,
            width: '100%',
            margin: '0 auto',
          }}
        >
          {/* Database Connectivity Status Banner */}
          {dbError && (
            <div
              style={{
                marginBottom: 24,
                padding: '14px 18px',
                backgroundColor: '#fff5f5',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-md, 8px)',
                color: '#991b1b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                fontSize: '0.88rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 700 }}>Database Service Offline:</span>
                <span>{dbError}</span>
              </div>
              <button
                type="button"
                onClick={refreshData}
                style={{
                  background: 'none',
                  border: '1px solid #f87171',
                  borderRadius: 4,
                  padding: '4px 12px',
                  color: '#991b1b',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                Retry Connection
              </button>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
