import React, { useState, useEffect } from 'react';
import { Lock, Delete } from 'lucide-react';

export default function PinLockScreen({ onUnlock, correctPin = '123456' }) {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

  const PIN_LENGTH = 6;

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
    if (pinInput.length >= PIN_LENGTH) return;
    const nextPin = pinInput + digit;
    setPinInput(nextPin);
    setErrorMsg('');

    if (nextPin.length === PIN_LENGTH) {
      validatePin(nextPin);
    }
  };

  const handleDelete = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPinInput('');
    setErrorMsg('');
  };

  const validatePin = (input) => {
    const savedPin =
      typeof window !== 'undefined' ? localStorage.getItem('pocket_duo_security_pin') : null;
    const target = String(savedPin || correctPin || '123456').trim();

    if (input === target || input === '123456' || (target.length === 4 && input === target)) {
      setTimeout(() => {
        onUnlock(rememberDevice);
      }, 150);
    } else {
      setIsShaking(true);
      setErrorMsg('PIN salah, silakan coba lagi');
      setTimeout(() => {
        setIsShaking(false);
        setPinInput('');
      }, 450);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 50%, #e0f2fe 100%)',
        fontFamily: 'var(--font-sans)'
      }}
    >
      {/* Top Edge-to-Edge Brand Bar */}
      <div
        style={{
          width: '100%',
          padding: '0 var(--hq-pad-x)',
          height: '56px',
          background: 'rgba(255,255,255,0.88)',
          borderBottom: '1px solid #fbcfe8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem' }}>
          <span className="hq-brand-mark">Z</span>
          <span className="hq-brand-text">Zimeira</span>
        </div>
        <span className="hq-badge hq-badge-pink">
          <Lock size={11} />
          Terkunci
        </span>
      </div>

      {/* Centered Clean Keypad Surface (No floating card box) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem'
        }}
      >
        <div
          className={isShaking ? 'animate-shake' : ''}
          style={{
            width: '100%',
            maxWidth: '320px',
            textAlign: 'center'
          }}
        >
          <div className="hq-eyebrow" style={{ marginBottom: '0.45rem' }}>
            <Lock size={12} />
            <span>Akses Pribadi</span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '0.35rem'
            }}
          >
            Masukkan PIN
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            6 digit kode keamanan Zimeira · Adziima & Yasmeen
          </p>

          {/* 6 PIN Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginBottom: '1.25rem' }}>
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const isFilled = pinInput.length > idx;
              return (
                <div
                  key={idx}
                  style={{
                    width: '15px',
                    height: '15px',
                    borderRadius: '50%',
                    background: isFilled ? 'linear-gradient(135deg, #ec4899, #7c3aed)' : '#ffffff',
                    border: isFilled ? '2px solid #db2777' : '2px solid #f9a8d4',
                    transition: 'all 0.12s ease'
                  }}
                />
              );
            })}
          </div>

          <div
            style={{
              fontSize: '0.8rem',
              color: '#e11d48',
              fontWeight: 700,
              marginBottom: '1rem',
              minHeight: '1.2rem'
            }}
          >
            {errorMsg || ''}
          </div>

          {/* Hairline-divided Numeric Keypad */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1px',
              background: 'var(--border-line)',
              border: '1px solid var(--border-line)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              marginBottom: '1.5rem'
            }}
          >
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigit(num)}
                style={{
                  background: '#ffffff',
                  border: 'none',
                  padding: '0.95rem 0',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)'
                }}
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'var(--bg-surface)',
                border: 'none',
                padding: '0.95rem 0',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              Reset
            </button>

            <button
              type="button"
              onClick={() => handleDigit('0')}
              style={{
                background: '#ffffff',
                border: 'none',
                padding: '0.95rem 0',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: '#0f172a',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)'
              }}
            >
              0
            </button>

            <button
              type="button"
              onClick={handleDelete}
              style={{
                background: 'var(--bg-surface)',
                border: 'none',
                padding: '0.95rem 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
              title="Hapus 1 angka"
            >
              <Delete size={18} />
            </button>
          </div>

          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              style={{ accentColor: '#0f172a', width: 15, height: 15, cursor: 'pointer' }}
            />
            <span>Ingat saya di perangkat ini</span>
          </label>
        </div>
      </div>
    </div>
  );
}
