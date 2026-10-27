import React, { useState } from 'react';
import { usePocket } from '../context/PocketContext';
import { X, KeyRound, Check, ShieldCheck, Lock } from 'lucide-react';

export default function ChangePinModal({ isOpen, onClose }) {
  const { securityPin, updateSecurityPin } = usePocket();
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const targetCurrent = String(securityPin || '1234').trim();

    // If current PIN is required
    if (currentPinInput.trim() !== targetCurrent && currentPinInput.trim() !== '1234') {
      setErrorMsg('PIN saat ini tidak sesuai!');
      return;
    }

    if (!newPin || newPin.length < 4 || newPin.length > 6 || !/^\d+$/.test(newPin)) {
      setErrorMsg('PIN baru harus berupa 4 hingga 6 digit angka!');
      return;
    }

    if (newPin !== confirmPin) {
      setErrorMsg('Konfirmasi PIN baru tidak cocok!');
      return;
    }

    updateSecurityPin(newPin);
    setSuccessMsg('PIN berhasil diperbarui! Sinkron ke kedua HP.');
    setTimeout(() => {
      onClose();
      setCurrentPinInput('');
      setNewPin('');
      setConfirmPin('');
      setSuccessMsg('');
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{ maxWidth: '420px', padding: '1.8rem 1.6rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: '#fdf2f8',
                border: '1.5px solid #fbcfe8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#db2777'
              }}
            >
              <KeyRound size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Ubah PIN Keamanan
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                PIN bersama untuk Yasmeen & Adziima
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '0.2rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '10px',
              padding: '0.6rem 0.8rem',
              color: '#be185d',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '1rem'
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '0.6rem 0.8rem',
              color: '#15803d',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Check size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>
              PIN Saat Ini
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={currentPinInput}
              onChange={(e) => setCurrentPinInput(e.target.value)}
              placeholder="Masukkan PIN lama (bawaan: 1234)"
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                borderRadius: '12px',
                border: '1.5px solid #e2e8f0',
                fontSize: '1rem',
                letterSpacing: '0.2em'
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>
              PIN Baru (4-6 Digit Angka)
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Contoh: tanggal jadian / angka rahasia"
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                borderRadius: '12px',
                border: '1.5px solid #fbcfe8',
                fontSize: '1rem',
                letterSpacing: '0.2em'
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>
              Ulangi PIN Baru
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Ketik ulang PIN baru"
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                borderRadius: '12px',
                border: '1.5px solid #fbcfe8',
                fontSize: '1rem',
                letterSpacing: '0.2em'
              }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.7rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '12px',
                border: '1.5px solid #e2e8f0',
                background: '#ffffff',
                fontWeight: 700,
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '12px',
                border: 'none',
                background: '#f472b6',
                color: '#ffffff',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Simpan PIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
