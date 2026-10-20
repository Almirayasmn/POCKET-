import React, { useState } from 'react';
import { usePocket } from '../context/PocketContext';
import { formatIdr, formatDateIndo } from '../utils/formatters';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Coins,
  Plus,
  Trash2,
  TrendingUp,
  Target,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Building
} from 'lucide-react';

export default function GoldSavingsView() {
  const {
    setActiveView,
    goldSavings,
    calculations,
    addGoldDeposit,
    deleteGoldDeposit,
    updateGoldPrice,
    updateGoldTarget
  } = usePocket();

  const { gold } = calculations;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Form states
  const [contributor, setContributor] = useState('berdua');
  const [grams, setGrams] = useState('');
  const [amountIdr, setAmountIdr] = useState('');
  const [place, setPlace] = useState('Antam');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Settings states
  const [targetInput, setTargetInput] = useState(gold.targetGrams.toString());
  const [priceInput, setPriceInput] = useState(gold.pricePerGram.toString());

  const handleSubmitDeposit = (e) => {
    e.preventDefault();
    if (!grams || parseFloat(grams) <= 0) {
      alert('Masukkan jumlah gram emas yang valid!');
      return;
    }

    addGoldDeposit({
      contributor,
      grams: parseFloat(grams),
      amountIdr: parseFloat(amountIdr) || (parseFloat(grams) * gold.pricePerGram),
      place,
      date,
      notes
    });

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#fbbf24', '#f59e0b', '#fef08a']
      });
    } catch (e) {
      // ignore
    }

    setGrams('');
    setAmountIdr('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateGoldTarget(targetInput);
    updateGoldPrice(priceInput);
    setIsSettingsModalOpen(false);
  };

  return (
    <div>
      {/* Top Header */}
      <div className="top-nav">
        <button className="btn-back-home" onClick={() => setActiveView('landing')}>
          <ArrowLeft size={16} />
          <span>Halaman Utama</span>
        </button>

        <div className="nav-user-badge">
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--pastel-gold-soft)', border: '1.5px solid var(--pastel-gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
            <Coins size={20} />
          </div>
          <div>
            <div className="nav-user-title" style={{ color: '#b45309' }}>
              Tabungan Emas Berdua
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Yasmeen & Adziima · Aset Logam Mulia Masa Depan
            </div>
          </div>
        </div>

        <button
          className="btn-back-home"
          onClick={() => setIsSettingsModalOpen(true)}
          style={{ borderColor: 'var(--pastel-gold-border)', color: '#b45309' }}
        >
          <Target size={14} />
          <span>Atur Target</span>
        </button>
      </div>

      {/* Gold Hero Card */}
      <div className="gold-banner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Emas Batangan Terkumpul
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: '#92400e', lineHeight: 1.1 }}>
              {gold.totalGrams.toFixed(2)}{' '}
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>gram</span>
            </div>
            <div style={{ fontSize: '0.88rem', color: '#78350f', marginTop: '0.3rem' }}>
              Estimasi Nilai Aset: <strong>{formatIdr(gold.currentAssetValueIdr)}</strong>{' '}
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(@ {formatIdr(gold.pricePerGram)}/gr)</span>
            </div>
          </div>

          <button
            className="btn-enter-profile btn-enter-gold"
            onClick={() => setIsAddModalOpen(true)}
            style={{ width: 'auto', padding: '0.75rem 1.4rem' }}
          >
            <Plus size={18} />
            <span>+ Catat Setor Emas</span>
          </button>
        </div>

        {/* Progress bar towards target */}
        <div style={{ marginTop: '1.4rem', paddingTop: '1rem', borderTop: '1px solid rgba(251, 191, 36, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#92400e', marginBottom: '0.4rem' }}>
            <span>Target Emas Bersama: {gold.targetGrams} gram</span>
            <span>{gold.progressPercent}% Tercapai</span>
          </div>
          <div className="progress-bar-bg" style={{ height: '10px', background: 'rgba(255,255,255,0.7)' }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${gold.progressPercent}%`,
                background: '#f59e0b'
              }}
            />
          </div>
        </div>

        {/* Contribution breakdown */}
        <div className="gold-stats-grid">
          <div className="gold-stat-item">
            <div className="gold-stat-label">Disetor Yasmeen</div>
            <div className="gold-stat-value">{gold.yasmeenContributedGrams.toFixed(2)} gr</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              ≈ {formatIdr(gold.yasmeenContributedGrams * gold.pricePerGram)}
            </div>
          </div>

          <div className="gold-stat-item">
            <div className="gold-stat-label">Disetor Adziima</div>
            <div className="gold-stat-value">{gold.adziimaContributedGrams.toFixed(2)} gr</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              ≈ {formatIdr(gold.adziimaContributedGrams * gold.pricePerGram)}
            </div>
          </div>

          <div className="gold-stat-item">
            <div className="gold-stat-label">Total Modal Pembelian</div>
            <div className="gold-stat-value" style={{ fontSize: '1.3rem' }}>
              {formatIdr(gold.totalGoldSpentIdr)}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, marginTop: '0.2rem' }}>
              {gold.profitLossIdr >= 0
                ? `Potensi Kenaikan: +${formatIdr(gold.profitLossIdr)}`
                : `Selisih Modal: ${formatIdr(gold.profitLossIdr)}`}
            </div>
          </div>
        </div>
      </div>

      {/* Gold Transaction History */}
      <div className="pastel-card" style={{ padding: '1.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              Riwayat Pembelian & Setoran Emas
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Catatan fisik logam mulia dan tabungan emas digital berdua
            </p>
          </div>

          <button
            className="btn-enter-profile btn-enter-gold"
            onClick={() => setIsAddModalOpen(true)}
            style={{ width: 'auto', padding: '0.45rem 1rem' }}
          >
            <Plus size={14} />
            <span>+ Setor Baru</span>
          </button>
        </div>

        {(goldSavings.transactions || []).length === 0 ? (
          <div className="empty-state">
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--pastel-gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.6rem', color: '#b45309' }}>
              <Coins size={24} />
            </div>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
              Belum ada riwayat setoran emas
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Mulai catat setiap kali kalian membeli atau menabung emas bareng!
            </p>
          </div>
        ) : (
          <div>
            {(goldSavings.transactions || []).map((entry) => {
              const contributorLabel = entry.contributor === 'yasmeen'
                ? 'Disetor Yasmeen'
                : entry.contributor === 'adziima'
                ? 'Disetor Adziima'
                : 'Patungan Berdua (50:50)';

              return (
                <div key={entry.id} className="tx-item">
                  <div className="tx-left">
                    <div className="tx-category-badge" style={{ background: 'var(--pastel-gold-soft)' }}>
                      <Coins size={18} color="#b45309" />
                    </div>
                    <div className="tx-details">
                      <h4>
                        +{entry.grams} gram Emas{' '}
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)' }}>
                          ({entry.place || 'Antam'})
                        </span>
                      </h4>
                      <div className="tx-meta">
                        <span>{formatDateIndo(entry.date)}</span>
                        <span>•</span>
                        <span style={{ color: '#b45309', fontWeight: 700 }}>{contributorLabel}</span>
                        {entry.notes && (
                          <>
                            <span>•</span>
                            <span style={{ fontStyle: 'italic' }}>"{entry.notes}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div className="tx-amount" style={{ color: '#b45309' }}>
                      {formatIdr(entry.amountIdr)}
                    </div>
                    <button
                      onClick={() => deleteGoldDeposit(entry.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                      title="Hapus"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Add Gold Deposit */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Coins size={20} color="#b45309" />
                <h3>Catat Setor Emas Berdua</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitDeposit}>
              <div className="form-group">
                <label className="form-label">Siapa yang Setor / Beli?</label>
                <select
                  className="form-select"
                  value={contributor}
                  onChange={(e) => setContributor(e.target.value)}
                >
                  <option value="berdua">Patungan Berdua (50:50)</option>
                  <option value="yasmeen">Yasmeen</option>
                  <option value="adziima">Adziima</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Jumlah Gram Emas *</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    placeholder="Contoh: 1 atau 0.5"
                    value={grams}
                    onChange={(e) => setGrams(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total Harga Beli (Rp)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder={`Contoh: ${formatIdr((parseFloat(grams) || 1) * gold.pricePerGram)}`}
                    value={amountIdr}
                    onChange={(e) => setAmountIdr(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tempat Beli / Simpan</label>
                  <select
                    className="form-select"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                  >
                    <option value="Antam / Butik Logam Mulia">Antam / Butik Logam Mulia</option>
                    <option value="Pegadaian (Tabungan Emas)">Pegadaian (Tabungan Emas)</option>
                    <option value="Pluang / Tokopedia Emas">Pluang / Tokopedia Emas</option>
                    <option value="Toko Emas Lokal">Toko Emas Lokal</option>
                    <option value="UBS / Lotus Archi">UBS / Lotus Archi</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tanggal Beli</label>
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Catatan Tambahan</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Certi-eye kado ulang tahun / tabungan gajian..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button type="submit" className="submit-btn gold">
                <Check size={18} />
                <span>Simpan Setoran Emas</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Settings Gold Price & Target */}
      {isSettingsModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSettingsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Atur Target & Harga Acuan Emas</h3>
              <button className="modal-close-btn" onClick={() => setIsSettingsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSettings}>
              <div className="form-group">
                <label className="form-label">Target Emas Bersama (Gram)</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="Contoh: 25"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Harga Emas Acuan per Gram (Rp)</label>
                <input
                  type="number"
                  className="form-input"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="Contoh: 1500000"
                  required
                />
                <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '0.3rem' }}>
                  Terbaca: {formatIdr(parseFloat(priceInput) || 0)} / gram
                </div>
              </div>

              <button type="submit" className="submit-btn gold">
                <Check size={18} />
                <span>Simpan Pengaturan</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fab-container">
        <button className="fab-btn gold" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={20} strokeWidth={3} />
          <span>+ Setor Emas</span>
        </button>
      </div>
    </div>
  );
}
