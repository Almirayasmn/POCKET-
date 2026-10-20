import React, { useState } from 'react';
import { usePocket } from '../context/PocketContext';
import { formatCny, formatIdr } from '../utils/formatters';
import { X, Check, RotateCcw, DollarSign } from 'lucide-react';

export default function EditBalanceModal({ isOpen, onClose }) {
  const { users, exchangeRate, setExchangeRate, updateUser, resetAllData } = usePocket();

  const [rate, setRate] = useState(exchangeRate.toString());

  // Yasmeen Form
  const [yasmeenName, setYasmeenName] = useState(users.yasmeen?.name || 'Yasmeen');
  const [yasmeenInitialFundIdr, setYasmeenInitialFundIdr] = useState((users.yasmeen?.initialFundIdr || 10000000).toString());
  const [yasmeenStipendCny, setYasmeenStipendCny] = useState((users.yasmeen?.stipendCny || 1500).toString());
  const [yasmeenReserveCny, setYasmeenReserveCny] = useState((users.yasmeen?.emergencyReserveCny || 1000).toString());

  // Cowoku Form
  const [cowokuName, setCowokuName] = useState(users.cowoku?.name || 'Cowoku');
  const [cowokuInitialFundIdr, setCowokuInitialFundIdr] = useState((users.cowoku?.initialFundIdr || 10000000).toString());
  const [cowokuReserveCny, setCowokuReserveCny] = useState((users.cowoku?.emergencyReserveCny || 1000).toString());

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();

    const parsedRate = parseFloat(rate) || 2750;
    setExchangeRate(parsedRate);

    // Update Yasmeen
    const yIdr = parseFloat(yasmeenInitialFundIdr) || 0;
    updateUser('yasmeen', {
      name: yasmeenName,
      initialFundIdr: yIdr,
      initialFundCny: Math.round((yIdr / parsedRate) * 100) / 100,
      stipendCny: parseFloat(yasmeenStipendCny) || 0,
      emergencyReserveCny: parseFloat(yasmeenReserveCny) || 0,
    });

    // Update Cowoku
    const cIdr = parseFloat(cowokuInitialFundIdr) || 0;
    updateUser('cowoku', {
      name: cowokuName,
      initialFundIdr: cIdr,
      initialFundCny: Math.round((cIdr / parsedRate) * 100) / 100,
      emergencyReserveCny: parseFloat(cowokuReserveCny) || 0,
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={22} color="#ec4899" />
            <h3>Pengaturan Modal & Kurs Uang</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          {/* Kurs Section */}
          <div className="form-group" style={{ padding: '0.85rem', background: 'rgba(236,72,153,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(236,72,153,0.2)' }}>
            <label className="form-label" style={{ color: '#f472b6', fontWeight: 700 }}>
              Kurs IDR per Yuan (¥)
            </label>
            <div className="currency-input-group">
              <input
                type="number"
                className="form-input"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="2750"
                required
              />
              <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Rp / 1¥
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
              Kurs acuan rencana Nanning: Rp2.750 per 1 Yuan CNY.
            </div>
          </div>

          {/* Section: Yasmeen */}
          <div style={{ margin: '1.25rem 0 0.5rem', fontWeight: 800, fontSize: '0.95rem', color: '#f472b6', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>🌸 Akun Yasmeen</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nama Panggilan</label>
              <input
                type="text"
                className="form-input"
                value={yasmeenName}
                onChange={(e) => setYasmeenName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Modal Awal (IDR)</label>
              <input
                type="number"
                className="form-input"
                value={yasmeenInitialFundIdr}
                onChange={(e) => setYasmeenInitialFundIdr(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Stipend Bulanan (¥)</label>
              <input
                type="number"
                className="form-input"
                value={yasmeenStipendCny}
                onChange={(e) => setYasmeenStipendCny(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dana Cadangan (¥)</label>
              <input
                type="number"
                className="form-input"
                value={yasmeenReserveCny}
                onChange={(e) => setYasmeenReserveCny(e.target.value)}
              />
            </div>
          </div>

          {/* Section: Cowoku */}
          <div style={{ margin: '1.25rem 0 0.5rem', fontWeight: 800, fontSize: '0.95rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>🦊 Akun Cowoku</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nama Pasangan</label>
              <input
                type="text"
                className="form-input"
                value={cowokuName}
                onChange={(e) => setCowokuName(e.target.value)}
                placeholder="Contoh: Cowoku / Nama Dia"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Modal Awal Cowoku (IDR)</label>
              <input
                type="number"
                className="form-input"
                value={cowokuInitialFundIdr}
                onChange={(e) => setCowokuInitialFundIdr(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Dana Cadangan Cowoku (¥)</label>
            <input
              type="number"
              className="form-input"
              value={cowokuReserveCny}
              onChange={(e) => setCowokuReserveCny(e.target.value)}
            />
          </div>

          <button type="submit" className="submit-btn">
            <Check size={18} />
            <span>Simpan Pengaturan</span>
          </button>

          <button
            type="button"
            onClick={resetAllData}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem',
              marginTop: '0.75rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <RotateCcw size={14} />
            <span>Reset Data ke Awal Spreadsheet</span>
          </button>
        </form>
      </div>
    </div>
  );
}
