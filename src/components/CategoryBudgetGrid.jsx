import React, { useState } from 'react';
import { usePocket } from '../context/PocketContext';
import { formatCny, formatIdr } from '../utils/formatters';
import { Edit2, PieChart, Sparkles } from 'lucide-react';

export default function CategoryBudgetGrid() {
  const {
    activeUserView,
    yasmeenCategories,
    cowokuCategories,
    calculations,
    exchangeRate,
    updateCategoryBudget
  } = usePocket();

  const isCowoku = activeUserView === 'cowoku';
  const categories = isCowoku ? cowokuCategories : yasmeenCategories;
  const spendingMap = isCowoku ? calculations.cowokuSpending : calculations.yasmeenSpending;

  const [editingCatId, setEditingCatId] = useState(null);
  const [tempBudget, setTempBudget] = useState('');

  const handleStartEdit = (cat) => {
    setEditingCatId(cat.id);
    const val = isCowoku ? cat.budgetIdr : cat.budgetCny;
    setTempBudget((val || 0).toString());
  };

  const handleSaveEdit = (catId) => {
    updateCategoryBudget(isCowoku ? 'cowoku' : 'yasmeen', catId, tempBudget);
    setEditingCatId(null);
  };

  // Total budget & spending calculation
  const totalBudget = categories.reduce((sum, c) => sum + (isCowoku ? (c.budgetIdr || 0) : (c.budgetCny || 0)), 0);
  const totalSpent = Object.values(spendingMap).reduce((sum, s) => sum + (isCowoku ? (s.totalIdr || 0) : (s.totalCny || 0)), 0);
  const overallPercent = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  return (
    <section style={{ marginBottom: '2rem' }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <PieChart size={20} color={isCowoku ? '#3b82f6' : '#ec4899'} />
            {isCowoku ? 'Budget & Pos Pengeluaran Cowoku (Indonesia · Rp)' : 'Budget Kategori Yasmeen (Nanning · ¥)'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Total Terpakai:{' '}
            <strong style={{ color: isCowoku ? '#60a5fa' : '#ec4899' }}>
              {isCowoku ? formatIdr(totalSpent) : formatCny(totalSpent)}
            </strong>{' '}
            dari total alokasi{' '}
            <strong>
              {isCowoku ? formatIdr(totalBudget) : `${formatCny(totalBudget)} (≈ ${formatIdr(totalBudget * exchangeRate)})`}
            </strong>
          </p>
        </div>

        {/* Global Progress pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--card-border)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Bulan Ini:</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: overallPercent > 90 ? '#ef4444' : '#10b981' }}>
            {overallPercent}%
          </span>
        </div>
      </div>

      <div className="categories-grid">
        {categories.map((cat) => {
          const spending = spendingMap[cat.id] || { totalCny: 0, totalIdr: 0, count: 0 };
          const spent = isCowoku ? (spending.totalIdr || 0) : (spending.totalCny || 0);
          const budget = isCowoku ? (cat.budgetIdr || 0) : (cat.budgetCny || 0);
          const remaining = budget - spent;
          const percent = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : (spent > 0 ? 100 : 0);
          const isOver = spent > budget && budget > 0;
          const isNear = percent >= 80 && !isOver;

          let barColor = cat.color || (isCowoku ? '#3b82f6' : '#ec4899');
          if (isOver) barColor = '#ef4444';
          else if (isNear) barColor = '#f59e0b';

          return (
            <div key={cat.id} className="glass-panel category-card">
              <div>
                <div className="category-header">
                  <div className="category-title-group">
                    <div className="category-icon" style={{ borderColor: cat.color }}>
                      {cat.icon}
                    </div>
                    <div>
                      <div className="category-name">{cat.name}</div>
                      <div className="category-basis">{cat.note || 'Bulanan'}</div>
                    </div>
                  </div>

                  {/* Edit Budget Button */}
                  {editingCatId === cat.id ? (
                    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                      <input
                        type="number"
                        value={tempBudget}
                        onChange={(e) => setTempBudget(e.target.value)}
                        style={{
                          width: isCowoku ? '90px' : '65px',
                          padding: '0.2rem 0.4rem',
                          fontSize: '0.8rem',
                          background: 'rgba(0,0,0,0.4)',
                          border: `1px solid ${isCowoku ? '#3b82f6' : '#ec4899'}`,
                          borderRadius: '4px',
                          color: '#fff'
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(cat.id)}
                        style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.2rem 0.4rem', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(cat)}
                      title="Ubah alokasi budget pos ini"
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.2rem' }}
                    >
                      <Edit2 size={13} />
                    </button>
                  )}
                </div>

                {/* Progress bar */}
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${percent}%`,
                      background: barColor,
                    }}
                  />
                </div>

                <div className="progress-meta">
                  <span>
                    Terpakai:{' '}
                    <span className="spent" style={{ color: isOver ? '#ef4444' : 'inherit' }}>
                      {isCowoku ? formatIdr(spent) : formatCny(spent)}
                    </span>
                  </span>
                  <span>Budget: {isCowoku ? formatIdr(budget) : formatCny(budget)}</span>
                </div>
              </div>

              {/* Sisa & Alert badge */}
              <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                <span style={{ color: isOver ? '#ef4444' : 'var(--text-muted)' }}>
                  {isOver
                    ? '⚠️ Lebih ' + (isCowoku ? formatIdr(spent - budget) : formatCny(spent - budget))
                    : 'Sisa ' + (isCowoku ? formatIdr(remaining) : formatCny(remaining))
                  }
                </span>
                {!isCowoku && (
                  <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    ≈ {formatIdr(remaining * exchangeRate)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
