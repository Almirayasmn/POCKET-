import React from 'react';
import { usePocket } from '../context/PocketContext';
import { formatCny, formatIdr } from '../utils/formatters';
import UserAvatar from './UserAvatar';
import { ArrowRight, Coins, Heart, Settings, ShieldCheck, User, Cloud, RefreshCw } from 'lucide-react';

export default function LandingPage({ onOpenEditProfile, onOpenCloudModal }) {
  const {
    setActiveView,
    users,
    calculations,
    yasmeenCurrencyView,
    isCloudConnected,
    isCloudSyncing
  } = usePocket();
  const { yasmeen, adziima } = calculations;

  const isYasmeenIdr = yasmeenCurrencyView === 'IDR';

  return (
    <div style={{ padding: '1rem 0 3.5rem' }}>
      <div className="landing-hero">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#fdf2f8', padding: '0.35rem 0.9rem', borderRadius: 'var(--radius-full)', border: '1px solid #fbcfe8' }}>
            <Heart size={14} color="#f472b6" fill="#f472b6" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#db2777' }}>
              Pocket Duo · Yasmeen & Adziima
            </span>
          </div>

          <button
            onClick={onOpenCloudModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: isCloudConnected ? '#ecfdf5' : '#ffffff',
              border: isCloudConnected ? '1px solid #a7f3d0' : '1px dashed #cbd5e1',
              color: isCloudConnected ? '#065f46' : '#64748b',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)'
            }}
            title="Klik untuk konfigurasi sinkronisasi antar HP"
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
                  display: 'inline-block'
                }}
              />
            )}
            <span>{isCloudConnected ? 'Cloud Aktif (HP Berdua Sinkron)' : '⚡ Sinkronkan HP Berdua'}</span>
          </button>
        </div>

        <h1 className="landing-title">
          Kelola Keuangan Pribadi
        </h1>
        <p className="landing-subtitle">
          Pilih profil untuk masuk ke pencatatan keuangan masing-masing.
        </p>
      </div>

      {/* 3 Cards: Yasmeen, Adziima, & Aset Emas Berdua */}
      <div
        className="profile-select-grid"
        style={{
          maxWidth: '1080px',
          margin: '0 auto',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
        }}
      >
        {/* Card 1: Yasmeen */}
        <div className="profile-select-card pink">
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <UserAvatar
                user={users.yasmeen}
                size={82}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditProfile('yasmeen');
                }}
              />
            </div>

            <div className="profile-name">{users.yasmeen?.name || 'Yasmeen'}</div>
            <div className="profile-tag tag-pink">
              Nanning, China · {isYasmeenIdr ? 'Rupiah (Rp)' : 'Yuan (¥)'}
            </div>
            {Boolean(users.yasmeen?.bio) && (
              <p className="profile-desc">{users.yasmeen.bio}</p>
            )}
          </div>

          <div>
            <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', textAlign: 'center', border: '1px solid #fbcfe8' }}>
              <div style={{ fontSize: '0.72rem', color: '#9d174d', fontWeight: 700, letterSpacing: '0.04em' }}>
                TOTAL UANG
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: '#be185d' }}>
                {isYasmeenIdr ? formatIdr(yasmeen.totalBalanceIdr) : formatCny(yasmeen.totalBalanceCny)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9d174d', marginTop: '0.15rem' }}>
                ≈ {isYasmeenIdr ? formatCny(yasmeen.totalBalanceCny) : formatIdr(yasmeen.totalBalanceIdr)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn-enter-profile btn-enter-pink"
                onClick={() => setActiveView('yasmeen')}
                style={{ flex: 1 }}
              >
                <span>Buka Catatan</span>
                <ArrowRight size={15} />
              </button>
              <button
                className="btn-back-home"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditProfile('yasmeen');
                }}
                title="Edit Profil & Foto"
                style={{ padding: '0.75rem', background: '#ffffff', borderColor: '#fbcfe8', color: '#db2777' }}
              >
                <Settings size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Adziima */}
        <div className="profile-select-card blue">
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <UserAvatar
                user={users.adziima}
                size={82}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditProfile('adziima');
                }}
              />
            </div>

            <div className="profile-name">{users.adziima?.name || 'Adziima'}</div>
            <div className="profile-tag tag-blue">
              Indonesia · Rupiah (Rp)
            </div>
            {Boolean(users.adziima?.bio) && (
              <p className="profile-desc">{users.adziima.bio}</p>
            )}
          </div>

          <div>
            <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', textAlign: 'center', border: '1px solid #bae6fd' }}>
              <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 700, letterSpacing: '0.04em' }}>
                TOTAL UANG
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: '#0284c7' }}>
                {adziima.initialIdr > 0 ? formatIdr(adziima.totalBalanceIdr) : 'Atur Duit Sendiri'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#0369a1', marginTop: '0.15rem' }}>
                {adziima.initialIdr > 0 ? 'Tersedia & Terkendali' : 'Klik untuk mulai'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn-enter-profile btn-enter-blue"
                onClick={() => setActiveView('adziima')}
                style={{ flex: 1 }}
              >
                <span>Buka Catatan</span>
                <ArrowRight size={15} />
              </button>
              <button
                className="btn-back-home"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditProfile('adziima');
                }}
                title="Edit Profil & Foto"
                style={{ padding: '0.75rem', background: '#ffffff', borderColor: '#bae6fd', color: '#0284c7' }}
              >
                <Settings size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Aset Emas Berdua (Galeri 24 Emas Batangan) */}
        <div className="profile-select-card gold">
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '82px',
                  height: '82px',
                  borderRadius: '50%',
                  background: '#fef08a',
                  border: '2px solid #fde047',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b45309',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
                }}
              >
                <Coins size={40} />
              </div>
            </div>

            <div className="profile-name">Aset Emas Berdua</div>
            <div className="profile-tag tag-gold">
              Galeri 24 · Emas Batangan
            </div>
            <p className="profile-desc" style={{ marginBottom: '1.2rem' }}>
              Investasi fisik logam mulia Galeri 24 dengan nilai bergerak mengikuti tren pasar.
            </p>
          </div>

          <div>
            <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', textAlign: 'center', border: '1px solid #fef08a' }}>
              <div style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 700, letterSpacing: '0.04em' }}>
                NILAI ASET KINI
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: '#b45309' }}>
                {calculations.gold?.currentAssetValueIdr > 0
                  ? formatIdr(calculations.gold.currentAssetValueIdr)
                  : 'Rp 0'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '0.15rem' }}>
                {calculations.gold?.totalGrams > 0
                  ? `${calculations.gold.totalGrams} gr (${calculations.gold.totalKeping} keping)`
                  : 'Belum ada keping tersimpan'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn-enter-profile btn-enter-gold"
                onClick={() => setActiveView('gold')}
                style={{ flex: 1 }}
              >
                <span>Buka Aset Emas</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
