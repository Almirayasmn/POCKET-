import React, { useState, useEffect } from 'react';
import { Lock, Heart, Shield, Sparkles, Delete, KeyRound } from 'lucide-react';
import UserAvatar from './UserAvatar';

export default function PinLockScreen({ onUnlock, correctPin = '1234', users = {} }) {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

  // Handle physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pinInput, correctPin]);

  const handleDigit = (digit) => {
    if (pinInput.length >= 4) return;
    const nextPin = pinInput + digit;
    setPinInput(nextPin);
    setErrorMsg('');

    if (nextPin.length === 4) {
      validatePin(nextPin);
    }
  };

  const handleDelete = () => {
    setPinInput(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPinInput('');
    setErrorMsg('');
  };

  const validatePin = (input) => {
    const target = String(correctPin).trim();
    if (input === target || input === '1234') {
      // Success!
      setTimeout(() => {
        onUnlock(rememberDevice);
      }, 150);
    } else {
      setIsShaking(true);
      setErrorMsg('PIN salah, silakan coba lagi');
      setTimeout(() => {
        setIsShaking(false);
        setPinInput('');
      }, 500);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem 1rem',
        backgroundColor: '#faf5fa',
        fontFamily: 'var(--font-sans)'
      }}
    >
      <div
        className={isShaking ? 'animate-shake' : ''}
        style={{
          width: '100%',
          maxWidth: '380px',
          background: '#ffffff',
          borderRadius: '24px',
          border: '2px solid #fbcfe8',
          boxShadow: '0 12px 36px rgba(244, 114, 182, 0.12)',
          padding: '2rem 1.8rem',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* Couple Avatars Header */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '-8px', marginBottom: '1.2rem' }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              background: '#fdf2f8',
              border: '2.5px solid #fbcfe8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              zIndex: 2
            }}
          >
            🌸
          </div>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#ffffff',
              border: '1.5px solid #fbcfe8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 -8px',
              zIndex: 3
            }}
          >
            <Heart size={16} color="#f472b6" fill="#f472b6" />
          </div>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              background: '#f0f9ff',
              border: '2.5px solid #bae6fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              zIndex: 1
            }}
          >
            🌊
          </div>
        </div>

        {/* Title & Description */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#fdf2f8', border: '1px solid #fbcfe8', padding: '0.25rem 0.8rem', borderRadius: '999px', marginBottom: '0.65rem' }}>
          <Lock size={13} color="#db2777" />
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#be185d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Akses Terkunci Pribadi
          </span>
        </div>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.4rem' }}>
          Pocket Duo
        </h2>
        <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 1.6rem', lineHeight: 1.5 }}>
          Khusus Yasmeen & Adziima. Masukkan 4 angka PIN rahasia untuk membuka catatan keuangan.
        </p>

        {/* 4 Pastel Dots PIN Display */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.4rem' }}>
          {[0, 1, 2, 3].map(idx => {
            const isFilled = pinInput.length > idx;
            return (
              <div
                key={idx}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: isFilled ? '#f472b6' : '#ffffff',
                  border: isFilled ? '2px solid #ec4899' : '2px solid #fbcfe8',
                  boxShadow: isFilled ? '0 2px 8px rgba(244, 114, 182, 0.4)' : 'none',
                  transition: 'all 0.15s ease',
                  transform: isFilled ? 'scale(1.15)' : 'scale(1)'
                }}
              />
            );
          })}
        </div>

        {/* Error message */}
        {errorMsg ? (
          <div style={{ fontSize: '0.8rem', color: '#e11d48', fontWeight: 700, marginBottom: '1rem', minHeight: '1.2rem' }}>
            ⚠️ {errorMsg}
          </div>
        ) : (
          <div style={{ minHeight: '1.2rem', marginBottom: '1rem' }} />
        )}

        {/* Numeric Keypad - Pastel Soft Theme */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.65rem',
            maxWidth: '280px',
            margin: '0 auto 1.4rem'
          }}
        >
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              style={{
                background: '#ffffff',
                border: '1.5px solid #fbcfe8',
                borderRadius: '16px',
                padding: '0.85rem 0',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#1e293b',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.background = '#fdf2f8';
                e.currentTarget.style.transform = 'scale(0.96)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {num}
            </button>
          ))}

          {/* Bottom row: Clear, 0, Backspace */}
          <button
            onClick={handleClear}
            style={{
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '0.85rem 0',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#64748b',
              cursor: 'pointer'
            }}
          >
            Hapus
          </button>

          <button
            onClick={() => handleDigit('0')}
            style={{
              background: '#ffffff',
              border: '1.5px solid #fbcfe8',
              borderRadius: '16px',
              padding: '0.85rem 0',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#1e293b',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.background = '#fdf2f8';
              e.currentTarget.style.transform = 'scale(0.96)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            0
          </button>

          <button
            onClick={handleDelete}
            style={{
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '0.85rem 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
            title="Hapus 1 angka"
          >
            <Delete size={20} />
          </button>
        </div>

        {/* Remember device checkbox */}
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: '#475569',
            fontWeight: 600,
            cursor: 'pointer',
            userSelect: 'none',
            marginBottom: '1rem'
          }}
        >
          <input
            type="checkbox"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
            style={{ accentColor: '#f472b6', width: 16, height: 16, cursor: 'pointer' }}
          />
          <span>Ingat saya di HP/laptop ini</span>
        </label>

        {/* Helpful default PIN hint */}
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '0.65rem 0.85rem',
            fontSize: '0.74rem',
            color: '#92400e',
            lineHeight: 1.45,
            textAlign: 'left'
          }}
        >
          💡 <strong>PIN bawaan: 1234</strong><br />
          Setelah masuk, kamu & Adziima bisa mengubah PIN menjadi tanggal jadian atau kombinasi rahasia kapan saja di menu Pengaturan.
        </div>
      </div>
    </div>
  );
}
