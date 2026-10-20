import React from 'react';
import { usePocket } from '../context/PocketContext';
import { formatCny, formatIdr } from '../utils/formatters';
import { Coffee, Sparkles, Plus } from 'lucide-react';

const DAYS_OF_WEEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function NongkrongTracker({ onQuickAddNongkrong }) {
  const { calculations, exchangeRate } = usePocket();
  const { nongkrongCount } = calculations;

  // Yasmeen target: 2x per week (around 8-9x per month, ¥50 / visit)
  const monthlyTarget = 8;
  const remainingSlots = Math.max(0, 2 - (nongkrongCount % 2));

  return (
    <div className="glass-panel nongkrong-card">
      <div className="card-header-small" style={{ marginBottom: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Coffee size={18} color="#f59e0b" />
          <span style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
            Nongkrong & Kafe Tracker
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
          Target: 2x / minggu ☕
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bulan ini sudah nongkrong:</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>
            {nongkrongCount} kali{' '}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 500 }}>
              / target {monthlyTarget} kali
            </span>
          </div>
        </div>

        <button
          onClick={onQuickAddNongkrong}
          className="btn-control"
          style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#fbbf24',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            padding: '0.4rem 0.8rem'
          }}
          title="Catat sesi nongkrong baru"
        >
          <Plus size={14} />
          <span>+ Sesi Ngopi</span>
        </button>
      </div>

      {/* Week Stamps / Visual check */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.3rem', marginTop: '0.6rem' }}>
        {DAYS_OF_WEEK.map((day, idx) => (
          <div
            key={day}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '0.5rem 0.2rem',
              borderRadius: 'var(--radius-sm)',
              background: idx === 5 || idx === 6 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>{day}</div>
            <div style={{ fontSize: '0.9rem' }}>
              {idx < nongkrongCount ? '☕' : '⚪'}
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.6rem', textAlign: 'center' }}>
        Budget: ¥50 (≈ {formatIdr(50 * exchangeRate)}) / sesi. Sisa slot minggu ini: {remainingSlots} kali.
      </div>
    </div>
  );
}
