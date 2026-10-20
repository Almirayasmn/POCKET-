import React from 'react';
import { usePocket } from '../context/PocketContext';
import { formatCny, formatIdr } from '../utils/formatters';
import { Sparkles, Wallet, Coins } from 'lucide-react';

export default function UserSelectorBanner({ onOpenSetMoney }) {
  const { activeUserView, setActiveUserView, users, calculations } = usePocket();
  const { yasmeenStats, cowokuStats, combined } = calculations;

  return (
    <div className="glass-panel" style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem' }}>👋</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Pilih Profil Pelacak:
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            (Yasmeen di China · Cowoku di Indonesia)
          </span>
        </div>

        <button
          className="btn-control"
          onClick={onOpenSetMoney}
          style={{
            background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(59,130,246,0.15))',
            borderColor: 'rgba(255,255,255,0.15)',
            fontSize: '0.78rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)'
          }}
        >
          <Coins size={14} color="#f59e0b" />
          <span>💰 Input / Update Total Uang Saya</span>
        </button>
      </div>

      {/* 3 Large Persona Selection Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
        {/* Yasmeen Card */}
        <div
          onClick={() => setActiveUserView('yasmeen')}
          style={{
            padding: '0.75rem 0.9rem',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: activeUserView === 'yasmeen' ? '2px solid #ec4899' : '1px solid var(--card-border)',
            background: activeUserView === 'yasmeen' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255,255,255,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.6rem' }}>🌸</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: activeUserView === 'yasmeen' ? '#f472b6' : 'var(--text-main)' }}>
                {users.yasmeen?.name || 'Yasmeen'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                🇨🇳 Nanning, China · Yuan (¥)
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem' }}>
              {formatCny(yasmeenStats.totalBalanceCny)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Sisa Saldo
            </div>
          </div>
        </div>

        {/* Cowoku Card */}
        <div
          onClick={() => setActiveUserView('cowoku')}
          style={{
            padding: '0.75rem 0.9rem',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: activeUserView === 'cowoku' ? '2px solid #3b82f6' : '1px solid var(--card-border)',
            background: activeUserView === 'cowoku' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.6rem' }}>🦊</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: activeUserView === 'cowoku' ? '#60a5fa' : 'var(--text-main)' }}>
                {users.cowoku?.name || 'Cowoku'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                🇮🇩 Indonesia · Rupiah (Rp)
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem' }}>
              {formatIdr(cowokuStats.totalBalanceIdr)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Sisa Saldo
            </div>
          </div>
        </div>

        {/* Berdua Card */}
        <div
          onClick={() => setActiveUserView('all')}
          style={{
            padding: '0.75rem 0.9rem',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: activeUserView === 'all' ? '2px solid #a855f7' : '1px solid var(--card-border)',
            background: activeUserView === 'all' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.6rem' }}>👥</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: activeUserView === 'all' ? '#c084fc' : 'var(--text-main)' }}>
                Gabungan Berdua
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Total Kekayaan & Split
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem' }}>
              {formatIdr(combined.totalBalanceIdr)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Total Gabungan
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
