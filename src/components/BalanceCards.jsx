import React from 'react';
import { usePocket } from '../context/PocketContext';
import { formatCny, formatIdr } from '../utils/formatters';
import { Wallet, ShieldCheck, Sparkles, TrendingUp, CheckCircle, Clock, PlusCircle, CreditCard, Coins } from 'lucide-react';

export default function BalanceCards({ onOpenSettings, onOpenAdd, onOpenSetMoney }) {
  const {
    activeUserView,
    users,
    calculations,
    currencyMode,
    exchangeRate,
    toggleStipend
  } = usePocket();

  const { yasmeenStats, cowokuStats, combined, dailySafeYasmeenCny, dailySafeCowokuIdr } = calculations;

  // Format currency helpers based on mode
  const renderAmount = (cnyVal, idrVal) => {
    if (activeUserView === 'cowoku') {
      // Cowoku is in Indonesia, always show Rupiah clearly
      return (
        <div className="amount-main" style={{ fontSize: '1.65rem' }}>
          {formatIdr(idrVal)}
        </div>
      );
    }

    if (currencyMode === 'cny') {
      return <div className="amount-main">{formatCny(cnyVal)}</div>;
    }
    if (currencyMode === 'idr') {
      return <div className="amount-main" style={{ fontSize: '1.5rem' }}>{formatIdr(idrVal)}</div>;
    }
    return (
      <>
        <div className="amount-main">{formatCny(cnyVal)}</div>
        <div className="amount-sub">≈ {formatIdr(idrVal)}</div>
      </>
    );
  };

  // 1. COWOKU VIEW (INDONESIA · RUPIAH)
  if (activeUserView === 'cowoku') {
    return (
      <section className="balance-section">
        <div className="balance-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {/* Card 1: Total Saldo Tersisa */}
          <div className="glass-panel balance-card primary-balance" style={{ borderColor: 'rgba(59, 130, 246, 0.4)' }}>
            <div>
              <div className="card-header-small">
                <span>🦊 Total Uang Pribadi Cowoku</span>
                <Wallet size={20} color="#3b82f6" />
              </div>
              <div className="amount-main" style={{ fontSize: '1.75rem', color: '#60a5fa' }}>
                {formatIdr(cowokuStats.totalBalanceIdr)}
              </div>
              <div className="amount-sub" style={{ marginTop: '0.2rem' }}>
                Modal Awal: {formatIdr(cowokuStats.initialIdr)}
              </div>
            </div>
            <div className="card-footer-meta">
              <span>Total Uang − Semua Pengeluaran</span>
              <button
                onClick={onOpenSetMoney}
                style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}
              >
                ✏️ Ubah Total Uang
              </button>
            </div>
          </div>

          {/* Card 2: Saldo Yang Bisa Dipakai */}
          <div className="glass-panel balance-card safe-spend">
            <div>
              <div className="card-header-small">
                <span>Bisa Dipakai (Aman Jajan)</span>
                <Sparkles size={20} color="#10b981" />
              </div>
              <div className="amount-main" style={{ fontSize: '1.75rem', color: '#34d399' }}>
                {formatIdr(cowokuStats.safeToSpendIdr)}
              </div>
              <div className="amount-sub" style={{ marginTop: '0.2rem' }}>
                Di luar tabungan cadangan
              </div>
            </div>
            <div className="card-footer-meta">
              <span>Uang bebas dipakai bulan ini</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>Aman ✨</span>
            </div>
          </div>

          {/* Card 3: Total Pengeluaran Tercatat */}
          <div className="glass-panel balance-card" style={{ '--card-accent': '#f43f5e' }}>
            <div>
              <div className="card-header-small">
                <span>Total Pengeluaran Bulan Ini</span>
                <CreditCard size={20} color="#f43f5e" />
              </div>
              <div className="amount-main" style={{ fontSize: '1.75rem', color: '#f43f5e' }}>
                {formatIdr(cowokuStats.totalOutflowIdr)}
              </div>
            </div>
            <div className="card-footer-meta">
              <span>Makan, nongkrong, bensin, dll.</span>
              <button
                onClick={onOpenAdd}
                style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}
              >
                + Catat Pengeluaran
              </button>
            </div>
          </div>

          {/* Card 4: Tabungan / Cadangan */}
          <div className="glass-panel balance-card reserve">
            <div>
              <div className="card-header-small">
                <span>Tabungan / Dana Cadangan</span>
                <ShieldCheck size={20} color="#f59e0b" />
              </div>
              <div className="amount-main" style={{ fontSize: '1.75rem', color: '#fbbf24' }}>
                {formatIdr(cowokuStats.reserveIdr)}
              </div>
            </div>
            <div className="card-footer-meta">
              <span>Tersimpan aman; tidak terpotong</span>
              <span style={{ color: '#f59e0b' }}>🔒 Terkunci</span>
            </div>
          </div>
        </div>

        {/* Daily Safe Limit Guide Banner */}
        <div
          className="glass-panel"
          style={{
            padding: '0.85rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.8rem',
            background: 'linear-gradient(90deg, rgba(59,130,246,0.12), rgba(16,185,129,0.1))',
            borderColor: 'rgba(59,130,246,0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.4rem' }}>💡</span>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                Panduan Jajan Harian Cowoku di Indonesia:{' '}
                <span style={{ color: '#60a5fa' }}>
                  {formatIdr(dailySafeCowokuIdr)} / hari
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Rata-rata aman untuk makan & jajan harian tanpa mengganggu uang cadangan.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn-control"
              onClick={onOpenSetMoney}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <Coins size={14} />
              <span>Update Total Duit</span>
            </button>
            <button
              className="btn-control"
              onClick={onOpenAdd}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-full)'
              }}
            >
              <PlusCircle size={16} />
              <span>+ Catat Jajan Baru</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // 2. YASMEEN VIEW (CHINA · NANNING) & BERDUA VIEW
  const isYasmeen = activeUserView === 'yasmeen';
  const currentStats = isYasmeen ? yasmeenStats : combined;
  const activeTitle = isYasmeen ? `Saldo ${users.yasmeen?.name || 'Yasmeen'}` : 'Saldo Total Berdua';
  const activeAvatar = isYasmeen ? '🌸' : '👥';
  const yasmeenStipendReceived = users.yasmeen?.stipendReceived;

  return (
    <section className="balance-section">
      <div className="balance-grid">
        {/* Card 1: Total Saldo Tersisa */}
        <div className="glass-panel balance-card primary-balance">
          <div>
            <div className="card-header-small">
              <span>{activeAvatar} {activeTitle}</span>
              <Wallet size={20} color="#ec4899" />
            </div>
            {renderAmount(currentStats.totalBalanceCny, currentStats.totalBalanceIdr)}
          </div>
          <div className="card-footer-meta">
            <span>Modal Awal + Masuk − Keluar</span>
            <button
              onClick={onOpenSetMoney}
              style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
            >
              Ubah Modal
            </button>
          </div>
        </div>

        {/* Card 2: Saldo Yang Bisa Dipakai */}
        <div className="glass-panel balance-card safe-spend">
          <div>
            <div className="card-header-small">
              <span>Bisa Dipakai (Aman Jajan)</span>
              <Sparkles size={20} color="#10b981" />
            </div>
            {renderAmount(currentStats.safeToSpendCny, currentStats.safeToSpendIdr)}
          </div>
          <div className="card-footer-meta">
            <span>Di luar dana cadangan</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>Aman ✨</span>
          </div>
        </div>

        {/* Card 3: Dana Cadangan */}
        <div className="glass-panel balance-card reserve">
          <div>
            <div className="card-header-small">
              <span>Dana Cadangan</span>
              <ShieldCheck size={20} color="#f59e0b" />
            </div>
            {renderAmount(
              isYasmeen ? yasmeenStats.reserveCny : (yasmeenStats.reserveCny + cowokuStats.reserveCny),
              isYasmeen ? yasmeenStats.reserveIdr : (yasmeenStats.reserveIdr + cowokuStats.reserveIdr)
            )}
          </div>
          <div className="card-footer-meta">
            <span>Disimpan aman; bukan pengeluaran</span>
            <span style={{ color: '#f59e0b' }}>🔒 Terkunci</span>
          </div>
        </div>

        {/* Card 4: Stipend / Pemasukan China */}
        <div className="glass-panel balance-card stipend">
          <div>
            <div className="card-header-small">
              <span>Stipend Kampus China</span>
              <TrendingUp size={20} color="#8b5cf6" />
            </div>
            {renderAmount(
              users.yasmeen?.stipendCny || 1500,
              (users.yasmeen?.stipendCny || 1500) * exchangeRate
            )}
          </div>
          <div className="card-footer-meta">
            <span>Status Bulan Ini:</span>
            <button
              className={`stipend-toggle-btn ${yasmeenStipendReceived ? 'received' : ''}`}
              onClick={() => toggleStipend('yasmeen')}
              title="Klik untuk toggle status cair stipend"
            >
              {yasmeenStipendReceived ? (
                <>
                  <CheckCircle size={13} />
                  <span>Sudah Cair (+¥1.500)</span>
                </>
              ) : (
                <>
                  <Clock size={13} />
                  <span>Belum Cair (Klik jika cair)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Daily Safe Limit Guide Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.8rem',
          background: 'linear-gradient(90deg, rgba(236,72,153,0.1), rgba(59,130,246,0.1))',
          borderColor: 'rgba(236,72,153,0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.4rem' }}>💡</span>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
              Panduan Jajan Aman Harian:{' '}
              <span style={{ color: '#ec4899' }}>
                {formatCny(dailySafeYasmeenCny)}
              </span>{' '}
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                (≈ {formatIdr(dailySafeYasmeenCny * exchangeRate)} / hari)
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Estimasi agar saldo aman sampai akhir bulan tanpa menyentuh dana cadangan.
            </div>
          </div>
        </div>

        <button
          className="btn-control"
          onClick={onOpenAdd}
          style={{
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-full)'
          }}
        >
          <PlusCircle size={16} />
          <span>+ Catat Jajan Baru</span>
        </button>
      </div>
    </section>
  );
}
