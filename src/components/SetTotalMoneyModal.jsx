import React, { useState, useEffect } from 'react';
import { usePocket } from '../context/PocketContext';
import { formatCny, formatIdr } from '../utils/formatters';
import { X, Check, Wallet, Coins } from 'lucide-react';

export default function SetTotalMoneyModal({ isOpen, onClose }) {
  const { activeUserView, users, setTotalMoney, updateUser, exchangeRate } = usePocket();

  const isCowoku = activeUserView === 'cowoku';
  const targetUserKey = isCowoku ? 'cowoku' : 'yasmeen';
  const targetUser = users[targetUserKey] || {};

  const [inputVal, setInputVal] = useState('');
  const [reserveVal, setReserveVal] = useState('');

  // Sync state when modal opens or active user changes
  useEffect(() => {
    if (isOpen) {
      if (isCowoku) {
        setInputVal((targetUser.initialFundIdr || 5000000).toString());
        setReserveVal((targetUser.emergencyReserveIdr || 1000000).toString());
      } else {
        setInputVal((targetUser.initialFundIdr || 10000000).toString());
        setReserveVal((targetUser.emergencyReserveCny || 1000).toString());
      }
    }
  }, [isOpen, activeUserView, targetUser]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(inputVal) || 0;
    const numReserve = parseFloat(reserveVal) || 0;

    if (isCowoku) {
      setTotalMoney('cowoku', num, 'IDR');
      updateUser('cowoku', {
        emergencyReserveIdr: numReserve,
        emergencyReserveCny: Math.round((numReserve / exchangeRate) * 100) / 100
      });
    } else {
      setTotalMoney('yasmeen', num, 'IDR');
      updateUser('yasmeen', {
        emergencyReserveCny: numReserve,
        emergencyReserveIdr: Math.round(numReserve * exchangeRate)
      });
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Coins size={22} color={isCowoku ? '#3b82f6' : '#ec4899'} />
            <h3>
              {isCowoku ? '🦊 Masukkan Total Duit Cowoku' : '🌸 Masukkan Total Duit Yasmeen'}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            {isCowoku ? (
              <span>
                Masukkan <strong>total saldo / uang pribadi yang kamu pegang saat ini</strong> di Indonesia (Rupiah). Setiap kali kamu jajan atau bayar sesuatu, saldo ini akan langsung terpotong.
              </span>
            ) : (
              <span>
                Masukkan <strong>total modal uang awalmu</strong> untuk di Nanning, China. Nilai Rupiah akan otomatis dikonversi ke Yuan (¥) sesuai kurs acuan.
              </span>
            )}
          </div>

          {/* Main Total Fund Input */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
              {isCowoku ? 'Total Uang Pribadi Saat Ini (Rp) *' : 'Modal Awal Yasmeen (Rp IDR) *'}
            </label>
            <input
              type="number"
              step="any"
              className="form-input"
              style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
              placeholder={isCowoku ? 'Contoh: 5000000' : 'Contoh: 10000000'}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              autoFocus
              required
            />
            <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.35rem' }}>
              {isCowoku
                ? `Terbaca: ${formatIdr(parseFloat(inputVal) || 0)}`
                : `Terbaca: ${formatIdr(parseFloat(inputVal) || 0)} (≈ ${formatCny((parseFloat(inputVal) || 0) / exchangeRate)})`
              }
            </div>
          </div>

          {/* Reserve / Cadangan */}
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">
              {isCowoku ? 'Alokasi Tabungan / Cadangan yang Jangan Dipakai (Rp)' : 'Dana Cadangan Tersimpan di Nanning (¥ Yuan)'}
            </label>
            <input
              type="number"
              step="any"
              className="form-input"
              value={reserveVal}
              onChange={(e) => setReserveVal(e.target.value)}
              placeholder={isCowoku ? 'Contoh: 1000000' : 'Contoh: 1000'}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              Dana cadangan ini akan dipisahkan agar tidak terpakai untuk jajan harian.
            </div>
          </div>

          <button
            type="submit"
            className="submit-btn"
            style={{
              background: isCowoku
                ? 'linear-gradient(135deg, #3b82f6, #06b6d4)'
                : 'linear-gradient(135deg, #ec4899, #8b5cf6)'
            }}
          >
            <Check size={18} />
            <span>Simpan & Perbarui Saldo</span>
          </button>
        </form>
      </div>
    </div>
  );
}
