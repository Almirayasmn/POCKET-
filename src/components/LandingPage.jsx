import React from 'react';
import { usePocket } from '../context/PocketContext';
import { formatCny, formatIdr } from '../utils/formatters';
import UserAvatar from './UserAvatar';
import {
  ArrowRight,
  Coins,
  Heart,
  Settings,
  ShieldCheck,
  Cloud,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Wallet,
  Compass,
  Plus,
  Lock,
  KeyRound
} from 'lucide-react';

export default function LandingPage({
  onOpenEditProfile,
  onOpenCloudModal,
  onOpenAdd,
  onOpenChangePin,
  onLockApp
}) {
  const {
    setActiveView,
    users,
    calculations,
    yasmeenCurrencyView,
    exchangeRate,
    isCloudConnected,
    isCloudSyncing
  } = usePocket();

  const { yasmeen, adziima, gold } = calculations;
  const isYasmeenIdr = yasmeenCurrencyView === 'IDR';

  // Calculate combined total net worth (Duit Yasmeen + Duit Adziima + Nilai Aset Emas)
  const yasmeenBalanceIdr = yasmeen?.totalBalanceIdr || 0;
  const adziimaBalanceIdr = adziima?.totalBalanceIdr || 0;
  const goldAssetValueIdr = gold?.currentAssetValueIdr || 0;
  const totalJointWealthIdr = yasmeenBalanceIdr + adziimaBalanceIdr + goldAssetValueIdr;

  // Percentage distribution calculations
  const safeTotal = totalJointWealthIdr > 0 ? totalJointWealthIdr : 1;
  const yasmeenPercent = totalJointWealthIdr > 0 ? Math.round((yasmeenBalanceIdr / safeTotal) * 100) : 33;
  const adziimaPercent = totalJointWealthIdr > 0 ? Math.round((adziimaBalanceIdr / safeTotal) * 100) : 33;
  const goldPercent = totalJointWealthIdr > 0 ? Math.max(0, 100 - yasmeenPercent - adziimaPercent) : 34;

  const goldGrams = gold?.totalGrams || 0;
  const goldKeping = gold?.totalKeping || 0;
  const targetGrams = gold?.targetGrams || 25;
  const goldProgress = targetGrams > 0 ? Math.min(100, Math.round((goldGrams / targetGrams) * 100)) : 0;
  const goldPricePerGram = gold?.pricePerGram || 2510000;
  const goldBuybackPerGram = gold?.buybackPerGram || 2363000;

  return (
    <div style={{ padding: '0.5rem 0 3.5rem', position: 'relative' }}>
      {/* Hero Header */}
      <div className="landing-hero" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '1.15rem' }}>
          <div className="landing-couple-pill">
            <Heart size={15} color="#ec4899" fill="#ec4899" style={{ animation: 'pulseHeart 2.5s infinite' }} />
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#be185d', letterSpacing: '0.01em' }}>
              Pocket Duo · Yasmeen Almira & Muhammad Mulkan Adziima
            </span>
          </div>

          <button
            onClick={onOpenCloudModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: isCloudConnected ? '#f0fdf4' : '#ffffff',
              border: isCloudConnected ? '1.5px solid #86efac' : '1.5px dashed #cbd5e1',
              color: isCloudConnected ? '#166534' : '#64748b',
              padding: '0.42rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease'
            }}
            title="Status sinkronisasi cloud antar HP"
          >
            {isCloudSyncing ? (
              <RefreshCw size={13} className="animate-spin" color="#16a34a" />
            ) : (
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: isCloudConnected ? '#22c55e' : '#f59e0b',
                  display: 'inline-block'
                }}
              />
            )}
            <span>{isCloudConnected ? 'Cloud Terhubung' : 'Sinkronkan HP'}</span>
          </button>

          {/* Quick PIN Security Buttons */}
          <button
            onClick={onOpenChangePin}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#ffffff',
              border: '1.5px solid #fbcfe8',
              color: '#be185d',
              padding: '0.42rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease'
            }}
            title="Ubah PIN keamanan bersama"
          >
            <KeyRound size={13} color="#db2777" />
            <span>PIN Rahasia</span>
          </button>

          <button
            onClick={onLockApp}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              color: '#64748b',
              padding: '0.42rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease'
            }}
            title="Kunci catatan keuangan sekarang"
          >
            <Lock size={13} color="#64748b" />
            <span>Kunci</span>
          </button>
        </div>

        <h1 className="landing-title">
          Kelola Keuangan & Tabungan Bersama
        </h1>

        <p className="landing-subtitle">
          Satu dompet dua hati, mencatat pengeluaran harian, tabungan mandiri, dan investasi emas fisik Galeri 24 secara transparan.
        </p>
      </div>

      {/* Hero Joint Wealth Dashboard (Akumulasi Aset Berdua) */}
      <div className="joint-wealth-banner">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              background: '#fdf2f8',
              padding: '0.3rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid #fbcfe8',
              marginBottom: '0.65rem'
            }}
          >
            <Sparkles size={14} color="#d97706" />
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#be185d', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Akumulasi Aset & Tabungan Berdua
            </span>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.65rem',
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
              textAlign: 'center'
            }}
          >
            {formatIdr(totalJointWealthIdr)}
          </div>
          <div style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '0.35rem', textAlign: 'center', maxWidth: '640px', fontWeight: 500 }}>
            Gabungan tabungan aktif Yasmeen, Adziima, serta nilai pasar emas batangan Galeri 24
          </div>
        </div>

        {/* Visual Asset Allocation Distribution Bar - Solid Pastel */}
        <div className="wealth-distribution-container">
          <div className="wealth-distribution-bar">
            <div
              className="wealth-bar-segment pink"
              style={{ width: `${Math.max(5, yasmeenPercent)}%` }}
              title={`Yasmeen Almira: ${formatIdr(yasmeenBalanceIdr)} (${yasmeenPercent}%)`}
            />
            <div
              className="wealth-bar-segment blue"
              style={{ width: `${Math.max(5, adziimaPercent)}%` }}
              title={`Muhammad Mulkan Adziima: ${formatIdr(adziimaBalanceIdr)} (${adziimaPercent}%)`}
            />
            <div
              className="wealth-bar-segment gold"
              style={{ width: `${Math.max(5, goldPercent)}%` }}
              title={`Aset Emas Galeri 24: ${formatIdr(goldAssetValueIdr)} (${goldPercent}%)`}
            />
          </div>

          <div className="wealth-legend-row">
            <div className="wealth-legend-item" style={{ color: '#be185d' }}>
              <span className="wealth-legend-dot" style={{ background: '#f472b6' }} />
              <span>🌸 Yasmeen ({yasmeenPercent}%)</span>
            </div>
            <div className="wealth-legend-item" style={{ color: '#0369a1' }}>
              <span className="wealth-legend-dot" style={{ background: '#38bdf8' }} />
              <span>🌊 Adziima ({adziimaPercent}%)</span>
            </div>
            <div className="wealth-legend-item" style={{ color: '#92400e' }}>
              <span className="wealth-legend-dot" style={{ background: '#facc15' }} />
              <span>🪙 Emas 24K ({goldPercent}%)</span>
            </div>
          </div>
        </div>

        {/* Breakdown chips with solid pastel borders */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <div
            onClick={() => setActiveView('yasmeen')}
            style={{
              background: '#fdf2f8',
              padding: '0.75rem 1.15rem',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid #fbcfe8',
              cursor: 'pointer',
              textAlign: 'center',
              flex: '1 1 180px',
              maxWidth: '240px',
              transition: 'all 0.15s ease'
            }}
            title="Klik untuk buka catatan Yasmeen"
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#db2777', textTransform: 'uppercase' }}>
              🌸 Yasmeen Almira
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#9d174d', marginTop: '0.15rem' }}>
              {formatIdr(yasmeenBalanceIdr)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#db2777', fontWeight: 700, marginTop: '0.1rem' }}>
              ≈ {formatCny(yasmeen?.totalBalanceCny || 0)}
            </div>
          </div>

          <div
            onClick={() => setActiveView('adziima')}
            style={{
              background: '#f0f9ff',
              padding: '0.75rem 1.15rem',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid #bae6fd',
              cursor: 'pointer',
              textAlign: 'center',
              flex: '1 1 180px',
              maxWidth: '240px',
              transition: 'all 0.15s ease'
            }}
            title="Klik untuk buka catatan Adziima"
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
              🌊 Mulkan Adziima
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0369a1', marginTop: '0.15rem' }}>
              {formatIdr(adziimaBalanceIdr)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700, marginTop: '0.1rem' }}>
              Dana Kas Mandiri
            </div>
          </div>

          <div
            onClick={() => setActiveView('gold')}
            style={{
              background: '#fefce8',
              padding: '0.75rem 1.15rem',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid #fde047',
              cursor: 'pointer',
              textAlign: 'center',
              flex: '1 1 180px',
              maxWidth: '240px',
              transition: 'all 0.15s ease'
            }}
            title="Klik untuk buka portofolio emas"
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>
              🪙 Emas Batangan 24K
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#92400e', marginTop: '0.15rem' }}>
              {formatIdr(goldAssetValueIdr)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 700, marginTop: '0.1rem' }}>
              {goldGrams > 0 ? `${goldGrams} gr (${goldKeping} kpg)` : '0 gr tersimpan'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Strip */}
      <div className="quick-action-strip">
        <button
          className="btn-quick-pill pink"
          onClick={() => onOpenAdd && onOpenAdd('Keluar', { user: 'yasmeen' })}
          title="Catat pengeluaran Yasmeen langsung"
        >
          <Plus size={15} color="#db2777" />
          <span>Catat Yasmeen (¥)</span>
        </button>

        <button
          className="btn-quick-pill blue"
          onClick={() => onOpenAdd && onOpenAdd('Keluar', { user: 'adziima' })}
          title="Catat pengeluaran Adziima langsung"
        >
          <Plus size={15} color="#0284c7" />
          <span>Catat Adziima (Rp)</span>
        </button>

        <button
          className="btn-quick-pill gold"
          onClick={() => setActiveView('gold')}
          title="Buka atau tambah keping emas"
        >
          <Coins size={15} color="#b45309" />
          <span>Tabungan Emas ({goldGrams} gr)</span>
        </button>
      </div>

      {/* 3 Interactive Cards: Yasmeen, Adziima, & Aset Emas Berdua */}
      <div className="profile-select-grid" style={{ marginTop: '2rem' }}>
        {/* Card 1: Yasmeen */}
        <div className="profile-select-card pink">
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}>
              <div style={{ position: 'relative' }}>
                <UserAvatar
                  user={users.yasmeen}
                  size={92}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEditProfile('yasmeen');
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '2px solid #fbcfe8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                  }}
                >
                  🌸
                </span>
              </div>
            </div>

            <div className="profile-name">{users.yasmeen?.name || 'Yasmeen Almira'}</div>
            {users.yasmeen?.bio && (
              <p className="profile-desc" style={{ marginBottom: '1rem' }}>
                {users.yasmeen.bio}
              </p>
            )}
          </div>

          <div>
            <div className="profile-amount-box" style={{ border: '1.5px solid #fbcfe8' }}>
              <div style={{ fontSize: '0.72rem', color: '#9d174d', fontWeight: 800, letterSpacing: '0.04em' }}>
                TOTAL UANG AKTIF
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 900, color: '#be185d', marginTop: '0.15rem' }}>
                {isYasmeenIdr ? formatIdr(yasmeen.totalBalanceIdr) : formatCny(yasmeen.totalBalanceCny)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#db2777', marginTop: '0.2rem', fontWeight: 700 }}>
                ≈ {isYasmeenIdr ? formatCny(yasmeen.totalBalanceCny) : formatIdr(yasmeen.totalBalanceIdr)}
              </div>

              {yasmeen?.dailyAverageSafeCny !== undefined && (
                <div
                  style={{
                    marginTop: '0.65rem',
                    paddingTop: '0.55rem',
                    borderTop: '1px dashed #fbcfe8',
                    fontSize: '0.74rem',
                    color: '#9d174d',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <span>🛡️ Jatah aman belanja:</span>
                  <span style={{ fontWeight: 800 }}>
                    {formatCny(yasmeen.dailyAverageSafeCny)} / hari
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.45rem' }}>
              <button
                className="btn-enter-profile btn-enter-pink"
                onClick={() => setActiveView('yasmeen')}
                style={{ flex: 1 }}
              >
                <span>Buka Catatan Yasmeen</span>
                <ArrowRight size={16} />
              </button>
              <button
                className="btn-back-home"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditProfile('yasmeen');
                }}
                title="Edit Profil & Foto"
                style={{ padding: '0.8rem', background: '#ffffff', borderColor: '#fbcfe8', color: '#db2777' }}
              >
                <Settings size={16} />
              </button>
            </div>

            <button
              className="btn-card-quick-add pink"
              onClick={() => onOpenAdd && onOpenAdd('Keluar', { user: 'yasmeen' })}
            >
              <Plus size={14} />
              <span>+ Catat Pengeluaran Yasmeen</span>
            </button>
          </div>
        </div>

        {/* Card 2: Adziima */}
        <div className="profile-select-card blue">
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}>
              <div style={{ position: 'relative' }}>
                <UserAvatar
                  user={users.adziima}
                  size={92}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEditProfile('adziima');
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '2px solid #bae6fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                  }}
                >
                  🌊
                </span>
              </div>
            </div>

            <div className="profile-name">{users.adziima?.name || 'Muhammad Mulkan Adziima'}</div>
            {users.adziima?.bio && (
              <p className="profile-desc" style={{ marginBottom: '1rem' }}>
                {users.adziima.bio}
              </p>
            )}
          </div>

          <div>
            <div className="profile-amount-box" style={{ border: '1.5px solid #bae6fd' }}>
              <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 800, letterSpacing: '0.04em' }}>
                TOTAL UANG AKTIF
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 900, color: '#0284c7', marginTop: '0.15rem' }}>
                {(users.adziima?.initialFundIdr > 0 || (adziima.monthTx && adziima.monthTx.length > 0)) ? formatIdr(adziima.totalBalanceIdr) : 'Atur Duit Sendiri'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#0369a1', marginTop: '0.2rem', fontWeight: 700 }}>
                {(users.adziima?.initialFundIdr > 0 || (adziima.monthTx && adziima.monthTx.length > 0)) ? 'Tersedia & Terkendali' : 'Klik untuk mulai'}
              </div>

              {adziima?.dailyAverageSafeIdr !== undefined && (
                <div
                  style={{
                    marginTop: '0.65rem',
                    paddingTop: '0.55rem',
                    borderTop: '1px dashed #bae6fd',
                    fontSize: '0.74rem',
                    color: '#0369a1',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <span>🛡️ Jatah aman belanja:</span>
                  <span style={{ fontWeight: 800 }}>
                    {formatIdr(adziima.dailyAverageSafeIdr)} / hari
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.45rem' }}>
              <button
                className="btn-enter-profile btn-enter-blue"
                onClick={() => setActiveView('adziima')}
                style={{ flex: 1 }}
              >
                <span>Buka Catatan Adziima</span>
                <ArrowRight size={16} />
              </button>
              <button
                className="btn-back-home"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditProfile('adziima');
                }}
                title="Edit Profil & Foto"
                style={{ padding: '0.8rem', background: '#ffffff', borderColor: '#bae6fd', color: '#0284c7' }}
              >
                <Settings size={16} />
              </button>
            </div>

            <button
              className="btn-card-quick-add blue"
              onClick={() => onOpenAdd && onOpenAdd('Keluar', { user: 'adziima' })}
            >
              <Plus size={14} />
              <span>+ Catat Pengeluaran Adziima</span>
            </button>
          </div>
        </div>

        {/* Card 3: Aset Emas Berdua */}
        <div className="profile-select-card gold">
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '92px',
                    height: '92px',
                    borderRadius: '50%',
                    background: '#fef08a',
                    border: '2.5px solid #f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#b45309',
                    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.2)'
                  }}
                >
                  <Coins size={46} />
                </div>
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '2px solid #fde047',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                  }}
                >
                  ✨
                </span>
              </div>
            </div>

            <div className="profile-name">Aset Emas Berdua</div>
            <div className="profile-tag tag-gold">
              <span>Galeri 24 · Emas Batangan 24K</span>
            </div>
          </div>

          <div>
            <div className="profile-amount-box" style={{ border: '1.5px solid #fde047' }}>
              <div style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 800, letterSpacing: '0.04em' }}>
                NILAI ASET PASAR KINI
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 900, color: '#b45309', marginTop: '0.15rem' }}>
                {goldAssetValueIdr > 0 ? formatIdr(goldAssetValueIdr) : 'Rp 0'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#b45309', marginTop: '0.2rem', fontWeight: 700 }}>
                {goldGrams > 0 ? `${goldGrams} gr (${goldKeping} keping batangan)` : 'Belum ada keping tersimpan'}
              </div>

              {/* Mini Target Progress Bar */}
              <div style={{ marginTop: '0.65rem', paddingTop: '0.55rem', borderTop: '1px dashed #fde047' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 800, color: '#92400e', marginBottom: '0.3rem' }}>
                  <span>Target 25 Gram</span>
                  <span>{goldGrams} / {targetGrams} gr ({goldProgress}%)</span>
                </div>
                <div style={{ width: '100%', height: 7, background: '#fef3c7', borderRadius: 99, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${goldProgress}%`,
                      background: '#f59e0b',
                      borderRadius: 99,
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.45rem' }}>
              <button
                className="btn-enter-profile btn-enter-gold"
                onClick={() => setActiveView('gold')}
                style={{ flex: 1 }}
              >
                <span>Buka Portofolio Emas</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <button
              className="btn-card-quick-add gold"
              onClick={() => setActiveView('gold')}
            >
              <Coins size={14} />
              <span>+ Beli / Catat Keping Emas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Market & System Ticker Bar */}
      <div className="landing-ticker-bar">
        <div className="ticker-pill-item">
          <span style={{ fontSize: '1.1rem' }}>💱</span>
          <span>Kurs Acuan: <strong style={{ color: '#be185d' }}>1 CNY = Rp {exchangeRate?.toLocaleString('id-ID') || '2.750'}</strong></span>
        </div>
        <span style={{ opacity: 0.3 }}>•</span>
        <div className="ticker-pill-item">
          <span style={{ fontSize: '1.1rem' }}>🏆</span>
          <span>Emas Galeri 24 Jual: <strong style={{ color: '#b45309' }}>{formatIdr(goldPricePerGram)} / gr</strong></span>
        </div>
        <span style={{ opacity: 0.3 }}>•</span>
        <div className="ticker-pill-item">
          <span style={{ fontSize: '1.1rem' }}>🔄</span>
          <span>Buyback: <strong style={{ color: '#0369a1' }}>{formatIdr(goldBuybackPerGram)} / gr</strong></span>
        </div>
        <span style={{ opacity: 0.3 }}>•</span>
        <div
          className="ticker-pill-item"
          onClick={onOpenCloudModal}
          style={{ cursor: 'pointer' }}
          title="Klik untuk cek status cloud"
        >
          <span style={{ fontSize: '1.1rem' }}>☁️</span>
          <span>Cloud Sync: <strong style={{ color: isCloudConnected ? '#15803d' : '#d97706' }}>{isCloudConnected ? 'Tersambung (Aktif)' : 'Siap'}</strong></span>
        </div>
      </div>
    </div>
  );
}
