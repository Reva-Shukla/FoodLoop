import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: isError ? '#991B1B' : '#1E4620',
        color: '#FFFFFF',
        padding: '14px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '420px',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      {isError ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
      <span style={{ fontSize: '0.9rem', fontWeight: 500, flex: 1 }}>{toast.message}</span>
      <button
        onClick={onClose}
        style={{ background: 'transparent', color: '#FFFFFF', opacity: 0.8 }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
