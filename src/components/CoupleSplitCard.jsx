import React from 'react';
import { usePocket } from '../context/PocketContext';
import { formatCny, formatIdr } from '../utils/formatters';
import { Users, ArrowRightLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export default function CoupleSplitCard() {
  const { calculations, users, exchangeRate, currencyMode } = usePocket();
  const { settlement } = calculations;
  const { yasmeenPaidJoint, cowokuPaidJoint, totalJoint, netDebtCny, netDebtIdr, debtor } = settlement;

  const yasmeenName = users.yasmeen?.name || 'Yasmeen';
  const cowokuName = users.cowoku?.name || 'Cowoku';

  const yasmeenPct = totalJoint > 0 ? Math.round((yasmeenPaidJoint / totalJoint) * 100) : 50;
  const cowokuPct = 100 - yasmeenPct;

  return (
    <div className="glass-panel couple-split-card">
      <div>
        <div className="card-header-small" style={{ marginBottom: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} color="#a855f7" />
            <span style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
              Split Pengeluaran Bersama (50:50)
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', background: 'rgba(168,85,247,0.15)', color: '#c084fc', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
            Transparan & Adil 💕
          </span>
        </div>

        {/* Total Joint Amount */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Belanja Bareng:</span>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem' }}>
              {formatCny(totalJoint)}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginLeft: '0.4rem' }}>
              (≈ {formatIdr(totalJoint * exchangeRate)})
            </span>
          </div>
        </div>

        {/* Visual Contribution Bar */}
        <div style={{ marginBottom: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
            <span style={{ color: '#ec4899', fontWeight: 600 }}>🌸 {yasmeenName}: {formatCny(yasmeenPaidJoint)} ({yasmeenPct}%)</span>
            <span style={{ color: '#3b82f6', fontWeight: 600 }}>🦊 {cowokuName}: {formatCny(cowokuPaidJoint)} ({cowokuPct}%)</span>
          </div>
          <div style={{ height: '8px', width: '100%', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${yasmeenPct}%`, background: 'linear-gradient(90deg, #ec4899, #f472b6)', transition: 'width 0.4s ease' }} />
            <div style={{ width: `${cowokuPct}%`, background: 'linear-gradient(90deg, #60a5fa, #3b82f6)', transition: 'width 0.4s ease' }} />
          </div>
        </div>
      </div>

      {/* Net Debt / Settlement Outcome */}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: debtor === 'settled'
            ? 'rgba(16, 185, 129, 0.12)'
            : 'rgba(236, 72, 153, 0.1)',
          border: `1px solid ${debtor === 'settled' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(236, 72, 153, 0.25)'}`,
          marginTop: '0.5rem'
        }}
      >
        {debtor === 'settled' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
            <CheckCircle2 size={16} />
            <span>Pengeluaran bersama impas sempurna! Tidak ada hutang piutang.</span>
          </div>
        ) : debtor === 'cowoku' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ArrowRightLeft size={16} color="#f472b6" />
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700, color: '#60a5fa' }}>🦊 {cowokuName}</span>{' '}
              perlu transfer ke{' '}
              <span style={{ fontWeight: 700, color: '#f472b6' }}>🌸 {yasmeenName}</span>:
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#ec4899', marginTop: '0.15rem' }}>
                {formatCny(Math.abs(netDebtCny))} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>(≈ {formatIdr(Math.abs(netDebtIdr))})</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ArrowRightLeft size={16} color="#60a5fa" />
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700, color: '#f472b6' }}>🌸 {yasmeenName}</span>{' '}
              perlu transfer ke{' '}
              <span style={{ fontWeight: 700, color: '#60a5fa' }}>🦊 {cowokuName}</span>:
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#60a5fa', marginTop: '0.15rem' }}>
                {formatCny(Math.abs(netDebtCny))} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>(≈ {formatIdr(Math.abs(netDebtIdr))})</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
