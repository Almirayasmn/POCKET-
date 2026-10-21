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
  Compass
} from 'lucide-react';

export default function LandingPage({ onOpenEditProfile, onOpenCloudModal }) {
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

  const goldGrams = gold?.totalGrams || 0;
  const goldKeping = gold?.totalKeping || 0;
  const goldPricePerGram = gold?.pricePerGram || 2510000;
  const goldBuybackPerGram = gold?.buybackPerGram || 2363000;

  return (
    <div style={{ padding: '0.5rem 0 3.5rem', position: 'relative' }}>
      {/* Decorative Subtle Ambient Glows */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          left: '10%',
          width: '280px',
          height: '280px',
          background: 'radial-gradient(circle, rgba(244, 114, 182, 0.15) 0%, rgba(244, 114, 182, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '10%',
          width: '280px',
          height: '280px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(56, 189, 248, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Hero Header */}
      <div className="landing-hero" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#ffffff',
              padding: '0.35rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid #fbcfe8',
              boxShadow: '0 2px 8px rgba(244, 114, 182, 0.12)'
            }}
          >
            <Heart size={14} color="#f472b6" fill="#f472b6" />
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#db2777', letterSpacing: '0.02em' }}>
              Pocket Duo · Yasmeen Almira & Muhammad Mulkan Adziima
            </span>
          </div>

          <button
            onClick={onOpenCloudModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: isCloudConnected ? '#ecfdf5' : '#ffffff',
              border: isCloudConnected ? '1.5px solid #a7f3d0' : '1.5px dashed #cbd5e1',
              color: isCloudConnected ? '#065f46' : '#64748b',
              padding: '0.35rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease'
            }}
            title="Klik untuk melihat status sinkronisasi antar HP"
          >
            {isCloudSyncing ? (
              <RefreshCw size={13} className="animate-spin" color="#059669" />
            ) : (
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isCloudConnected ? '#10b981' : '#f59e0b',
                  display: 'inline-block',
                  boxShadow: isCloudConnected ? '0 0 6px rgba(16, 185, 129, 0.6)' : 'none'
                }}
              />
            )}
            <span>{isCloudConnected ? 'Cloud Aktif (HP Berdua Sinkron)' : '⚡ Sinkronkan HP Berdua'}</span>
          </button>
        </div>

        <h1 className="landing-title">
          Kelola Keuangan & Tabungan Bersama
        </h1>
      </div>

      {/* Hero Joint Wealth Dashboard (Akumulasi Aset Berdua) */}
      <div className="joint-wealth-banner">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#ffffff', padding: '0.22rem 0.8rem', borderRadius: 'var(--radius-full)', border: '1px solid #fbcfe8', marginBottom: '0.55rem' }}>
            <Sparkles size={14} color="#d97706" />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#9d174d', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Akumulasi Aset & Tabungan Berdua
            </span>
          </div>

          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.3rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.02em', textAlign: 'center' }}>
            {formatIdr(totalJointWealthIdr)}
          </div>
          <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.35rem', textAlign: 'center', maxWidth: '640px' }}>
            Gabungan tabungan mandiri Yasmeen & Adziima serta aset fisik emas batangan Galeri 24
          </div>
        </div>

        {/* Breakdown chips */}
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
          <div
            onClick={() => setActiveView('yasmeen')}
            style={{
              background: '#ffffff',
              padding: '0.55rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #fbcfe8',
              cursor: 'pointer',
              textAlign: 'center',
              minWidth: '160px',
              transition: 'all 0.15s ease'
            }}
            title="Klik untuk buka catatan Yasmeen"
          >
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#db2777', textTransform: 'uppercase' }}>
              🌸 Yasmeen Almira
            </div>
            <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#9d174d', marginTop: '0.1rem' }}>
              {formatIdr(yasmeenBalanceIdr)}
            </div>
          </div>

          <div
            onClick={() => setActiveView('adziima')}
            style={{
              background: '#ffffff',
              padding: '0.55rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #bae6fd',
              cursor: 'pointer',
              textAlign: 'center',
              minWidth: '160px',
              transition: 'all 0.15s ease'
            }}
            title="Klik untuk buka catatan Adziima"
          >
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
              🌊 Muhammad Mulkan Adziima
            </div>
            <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0369a1', marginTop: '0.1rem' }}>
              {formatIdr(adziimaBalanceIdr)}
            </div>
          </div>

          <div
            onClick={() => setActiveView('gold')}
            style={{
              background: '#ffffff',
              padding: '0.55rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #fde047',
              cursor: 'pointer',
              textAlign: 'center',
              minWidth: '160px',
              transition: 'all 0.15s ease'
            }}
            title="Klik untuk buka portofolio emas"
          >
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>
              🪙 Emas Batangan
            </div>
            <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#92400e', marginTop: '0.1rem' }}>
              {formatIdr(goldAssetValueIdr)}
            </div>
          </div>
        </div>
      </div>

      {/* 3 Interactive Cards: Yasmeen, Adziima, & Aset Emas Berdua */}
      <div className="profile-select-grid">
        {/* Card 1: Yasmeen */}
        <div className="profile-select-card pink">
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}>
              <div style={{ position: 'relative' }}>
                <UserAvatar
                  user={users.yasmeen}
                  size={88}
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
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '2px solid #fbcfe8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                  }}
                >
                  🌸
                </span>
              </div>
            </div>

            <div className="profile-name">{users.yasmeen?.name || 'Yasmeen Almira'}</div>

            <p className="profile-desc">
              {users.yasmeen?.bio || 'Pengeluaran kuliah mandiri pas sesuai stipend bulanan kampus ¥1.500.'}
            </p>
          </div>

          <div>
            <div className="profile-amount-box" style={{ border: '1.5px solid #fbcfe8' }}>
              <div style={{ fontSize: '0.72rem', color: '#9d174d', fontWeight: 800, letterSpacing: '0.04em' }}>
                TOTAL UANG AKTIF
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.38rem', fontWeight: 900, color: '#be185d', marginTop: '0.15rem' }}>
                {isYasmeenIdr ? formatIdr(yasmeen.totalBalanceIdr) : formatCny(yasmeen.totalBalanceCny)}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#db2777', marginTop: '0.2rem', fontWeight: 700 }}>
                ≈ {isYasmeenIdr ? formatCny(yasmeen.totalBalanceCny) : formatIdr(yasmeen.totalBalanceIdr)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
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
          </div>
        </div>

        {/* Card 2: Adziima */}
        <div className="profile-select-card blue">
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}>
              <div style={{ position: 'relative' }}>
                <UserAvatar
                  user={users.adziima}
                  size={88}
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
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '2px solid #bae6fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                  }}
                >
                  🛡️
                </span>
              </div>
            </div>

            <div className="profile-name">{users.adziima?.name || 'Muhammad Mulkan Adziima'}</div>

            <p className="profile-desc">
              {users.adziima?.bio || 'Pencatatan harian disiplin dengan pembagian pagu pos terencana.'}
            </p>
          </div>

          <div>
            <div className="profile-amount-box" style={{ border: '1.5px solid #bae6fd' }}>
              <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 800, letterSpacing: '0.04em' }}>
                TOTAL UANG AKTIF
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.38rem', fontWeight: 900, color: '#0284c7', marginTop: '0.15rem' }}>
                {adziima.initialIdr > 0 ? formatIdr(adziima.totalBalanceIdr) : 'Atur Duit Sendiri'}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#0284c7', marginTop: '0.2rem', fontWeight: 700 }}>
                {adziima.initialIdr > 0 ? 'Tersedia & Terkendali' : 'Klik untuk mulai'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
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
          </div>
        </div>

        {/* Card 3: Aset Emas Berdua */}
        <div className="profile-select-card gold">
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #fef08a 0%, #fde047 100%)',
                    border: '2.5px solid #f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#b45309',
                    boxShadow: '0 6px 18px rgba(245, 158, 11, 0.25)'
                  }}
                >
                  <Coins size={44} />
                </div>
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '2px solid #fde047',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
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

            <p className="profile-desc">
              Investasi fisik logam mulia Galeri 24 dengan nilai bergerak mengikuti harga pasar live.
            </p>
          </div>

          <div>
            <div className="profile-amount-box" style={{ border: '1.5px solid #fde047' }}>
              <div style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 800, letterSpacing: '0.04em' }}>
                NILAI ASET PASAR KINI
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.38rem', fontWeight: 900, color: '#b45309', marginTop: '0.15rem' }}>
                {goldAssetValueIdr > 0 ? formatIdr(goldAssetValueIdr) : 'Rp 0'}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#b45309', marginTop: '0.2rem', fontWeight: 700 }}>
                {goldGrams > 0 ? `${goldGrams} gr (${goldKeping} keping batangan)` : 'Belum ada keping tersimpan'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn-enter-profile btn-enter-gold"
                onClick={() => setActiveView('gold')}
                style={{ flex: 1 }}
              >
                <span>Buka Portofolio Emas</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Market & System Ticker Bar */}
      <div className="landing-ticker-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '1rem' }}>🇨🇳</span>
          <span>Kurs Acuan: <strong>1 CNY = Rp {exchangeRate?.toLocaleString('id-ID') || '2.750'}</strong></span>
        </div>
        <span style={{ opacity: 0.3 }}>•</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '1rem' }}>🏆</span>
          <span>Emas Galeri 24 Jual: <strong>{formatIdr(goldPricePerGram)} / gr</strong></span>
        </div>
        <span style={{ opacity: 0.3 }}>•</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '1rem' }}>🔄</span>
          <span>Buyback: <strong>{formatIdr(goldBuybackPerGram)} / gr</strong></span>
        </div>
        <span style={{ opacity: 0.3 }}>•</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '1rem' }}>☁️</span>
          <span>Multi-Device Cloud Sync: <strong>{isCloudConnected ? 'Tersambung' : 'Siap'}</strong></span>
        </div>
      </div>
    </div>
  );
}
