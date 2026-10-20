import React from 'react';
import { usePocket } from '../context/PocketContext';
import { formatCny, formatIdr } from '../utils/formatters';
import UserAvatar from './UserAvatar';
import { ArrowRight, Coins, Heart, Settings, ShieldCheck, User } from 'lucide-react';

export default function LandingPage({ onOpenEditProfile }) {
  const { setActiveView, users, calculations, yasmeenCurrencyView } = usePocket();
  const { yasmeen, adziima } = calculations;

  const isYasmeenIdr = yasmeenCurrencyView === 'IDR';

  return (
    <div style={{ padding: '1rem 0 3.5rem' }}>
      <div className="landing-hero">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#fdf2f8', padding: '0.35rem 0.9rem', borderRadius: 'var(--radius-full)', marginBottom: '1rem', border: '1px solid #fbcfe8' }}>
          <Heart size={14} color="#f472b6" fill="#f472b6" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#db2777' }}>
            Pocket Duo · Yasmeen & Adziima
          </span>
        </div>
        <h1 className="landing-title">
          Kelola Keuangan Pribadi
        </h1>
        <p className="landing-subtitle">
          Pilih profil untuk masuk ke pencatatan keuangan masing-masing.
        </p>
      </div>

      {/* 2 Selectable Profile Cards: Yasmeen & Adziima */}
      <div
        className="profile-select-grid"
        style={{
          maxWidth: '780px',
          margin: '0 auto',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
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
                style={{ padding: '0.75rem', background: '#f0f9ff', borderColor: '#bae6fd', color: '#0284c7' }}
              >
                <Settings size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
