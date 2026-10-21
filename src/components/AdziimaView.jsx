import React, { useState } from 'react';
import { usePocket } from '../context/PocketContext';
import { formatIdr, formatDateIndo } from '../utils/formatters';
import { exportMonthToExcel } from '../utils/exportExcel';
import UserAvatar from './UserAvatar';
import CategoryIcon from './CategoryIcon';
import MonthNavigator, { ALL_MONTH_OPTIONS } from './MonthNavigator';
import {
  ArrowLeft,
  Wallet,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  Coins,
  Check,
  Calendar,
  Settings,
  Search,
  Download,
  Cloud,
  RefreshCw,
  Sliders
} from 'lucide-react';
import ManageCategoriesModal from './ManageCategoriesModal';

export default function AdziimaView({ onOpenAdd, onEditTx, onOpenEditProfile, onOpenCloudModal }) {
  const {
    setActiveView,
    users,
    calculations,
    adziimaCategories,
    deleteTransaction,
    updateCategoryBudget,
    setTotalMoney,
    selectedMonth,
    isCloudConnected,
    isCloudSyncing
  } = usePocket();

  const { adziima } = calculations;
  const user = users.adziima || {};
  const currentMonthTx = adziima.monthTx;

  const [isEditingMoney, setIsEditingMoney] = useState(false);
  const [moneyInput, setMoneyInput] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  const [catBudgetInput, setCatBudgetInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');
  const [isManageCatOpen, setIsManageCatOpen] = useState(false);

  const monthLabel = ALL_MONTH_OPTIONS.find(m => m.value === selectedMonth)?.label || selectedMonth;

  const handleSaveMoney = (e) => {
    e.preventDefault();
    setTotalMoney('adziima', moneyInput);
    setIsEditingMoney(false);
  };

  const handleStartEditBudget = (cat) => {
    setEditingCatId(cat.id);
    setCatBudgetInput((cat.budgetIdr || 0).toString());
  };

  const handleSaveCatBudget = (catId) => {
    updateCategoryBudget('adziima', catId, catBudgetInput);
    setEditingCatId(null);
  };

  // Export to Excel handler
  const handleExportExcel = () => {
    exportMonthToExcel({
      userName: user.name || 'Adziima',
      monthLabel,
      transactions: currentMonthTx,
      categories: adziimaCategories,
      currency: 'IDR',
      isChinaPeriod: false,
      summary: {
        totalInflow: formatIdr(adziima.totalInflowIdr),
        totalOutflow: formatIdr(adziima.totalOutflowIdr),
        netBalance: formatIdr(adziima.totalBalanceIdr),
        reserve: formatIdr(adziima.reserveIdr)
      }
    });
  };

  // Filtered transactions for this month
  const filteredTransactions = currentMonthTx.filter((tx) => {
    if (selectedCatFilter !== 'all' && tx.category !== selectedCatFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (tx.title || '').toLowerCase().includes(q);
      const matchNotes = (tx.notes || '').toLowerCase().includes(q);
      if (!matchTitle && !matchNotes) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Top Header */}
      <div className="top-nav">
        <button className="btn-back-home" onClick={() => setActiveView('landing')}>
          <ArrowLeft size={16} />
          <span>Halaman Utama</span>
        </button>

        <div
          className="nav-user-badge"
          onClick={onOpenEditProfile}
          style={{ cursor: 'pointer' }}
          title="Klik untuk ganti foto & edit profil"
        >
          <UserAvatar user={user} size={42} />
          <div>
            <div className="nav-user-title" style={{ color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>{user.name || 'Muhammad Mulkan Adziima'}</span>
              <Settings size={13} color="var(--text-dim)" />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Indonesia · 100% Rupiah (Rp)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            className="btn-back-home"
            onClick={() => {
              setMoneyInput(adziima.initialIdr.toString());
              setIsEditingMoney(true);
            }}
            style={{ borderColor: 'var(--pastel-blue-border)', color: '#0284c7' }}
          >
            <Coins size={14} />
            <span>Atur Saldo</span>
          </button>

          <button
            className="btn-back-home"
            onClick={onOpenCloudModal}
            style={{
              borderColor: isCloudConnected ? '#a7f3d0' : 'var(--pastel-blue-border)',
              background: isCloudConnected ? '#ecfdf5' : '#ffffff',
              color: isCloudConnected ? '#065f46' : '#0284c7'
            }}
            title="Sinkronisasi Cloud Multi-Device"
          >
            {isCloudSyncing ? (
              <RefreshCw size={14} className="animate-spin" color="#059669" />
            ) : (
              <Cloud size={14} />
            )}
            <span>{isCloudConnected ? 'Cloud' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* Month Navigator with Excel Download */}
      <MonthNavigator
        isYasmeen={false}
        onExportExcel={handleExportExcel}
      />

      {/* If Adziima hasn't entered total money yet */}
      {adziima.initialIdr === 0 && !isEditingMoney && (
        <div
          className="pastel-card"
          style={{
            padding: '1.6rem',
            marginBottom: '1.5rem',
            background: 'var(--pastel-blue-soft)',
            borderColor: 'var(--pastel-blue-border)',
            textAlign: 'center'
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem', color: '#0284c7' }}>
            <Wallet size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0369a1', marginBottom: '0.3rem' }}>
            Berapa Total Uang Pribadi Adziima Saat Ini?
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#0c4a6e', marginBottom: '1.2rem' }}>
            Nominal awal sengaja dikosongkan agar kamu bisa mengisinya sendiri sesuai saldo rekening atau dompetmu.
          </p>
          <button
            onClick={() => {
              setMoneyInput('');
              setIsEditingMoney(true);
            }}
            className="btn-enter-profile btn-enter-blue"
            style={{ maxWidth: '260px', margin: '0 auto' }}
          >
            <Plus size={16} />
            <span>Isi Saldo Awal Saya</span>
          </button>
        </div>
      )}

      {/* Modal Editor for Total Money */}
      {isEditingMoney && (
        <div className="modal-overlay" onClick={() => setIsEditingMoney(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Atur Total Uang Pribadi Adziima</h3>
              <button className="modal-close-btn" onClick={() => setIsEditingMoney(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveMoney}>
              <div className="form-group">
                <label className="form-label">Total Uang / Saldo yang Dipegang Saat Ini (Rp) *</label>
                <input
                  type="number"
                  className="form-input"
                  style={{ fontSize: '1.2rem', fontWeight: 800 }}
                  placeholder="Contoh: 5000000"
                  value={moneyInput}
                  onChange={(e) => setMoneyInput(e.target.value)}
                  autoFocus
                  required
                />
                <div style={{ fontSize: '0.8rem', color: '#0284c7', marginTop: '0.3rem' }}>
                  Terbaca: {formatIdr(parseFloat(moneyInput) || 0)}
                </div>
              </div>
              <button type="submit" className="submit-btn blue">
                <Check size={18} />
                <span>Simpan Total Uang</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Balance Cards for the Month */}
      <div className="balance-grid grid-3">
        <div className="balance-card" style={{ borderColor: 'var(--pastel-blue-border)' }}>
          <div>
            <div className="card-header-small">
              <span style={{ color: '#0284c7' }}>Sisa Saldo ({monthLabel})</span>
              <Wallet size={18} color="#0284c7" />
            </div>
            <div className="amount-main" style={{ color: '#0284c7' }}>
              {formatIdr(adziima.totalBalanceIdr)}
            </div>
            <div className="amount-sub">
              Saldo awal: {formatIdr(adziima.initialIdr)}
            </div>
          </div>
          <div className="card-footer-meta">
            <span>Uang Masuk − Pengeluaran</span>
            <span style={{ color: '#0284c7', fontWeight: 700 }}>Aktif</span>
          </div>
        </div>

        <div className="balance-card">
          <div>
            <div className="card-header-small">
              <span>Pengeluaran Bulan Ini</span>
              <TrendingDown size={18} color="#f43f5e" />
            </div>
            <div className="amount-main" style={{ color: '#f43f5e' }}>
              {formatIdr(adziima.totalOutflowIdr)}
            </div>
            <div className="amount-sub">
              {currentMonthTx.filter(t => t.type !== 'Masuk').length} transaksi
            </div>
          </div>
          <div className="card-footer-meta">
            <span>Bulan {monthLabel}</span>
            <span style={{ color: '#f43f5e', fontWeight: 700 }}>Tercatat</span>
          </div>
        </div>

        <div className="balance-card">
          <div>
            <div className="card-header-small">
              <span>Sisa Uang Tersedia</span>
              <ShieldCheck size={18} color="#10b981" />
            </div>
            <div className="amount-main" style={{ color: '#10b981' }}>
              {formatIdr(adziima.safeToSpendIdr)}
            </div>
            <div className="amount-sub">
              Terkendali & aman
            </div>
          </div>
          <div className="card-footer-meta">
            <span>Bisa dipakai belanja</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>Aman</span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons for Adziima */}
      <div className="action-buttons-grid">
        <button
          className="btn-action-primary blue"
          onClick={() => onOpenAdd('Keluar')}
        >
          <Plus size={18} />
          <span>Catat Pengeluaran</span>
        </button>

        <button
          className="btn-action-primary green"
          onClick={() => onOpenAdd('Masuk')}
        >
          <TrendingUp size={18} />
          <span>Catat Pemasukan</span>
        </button>
      </div>

      {/* Frugal Advice Banner (Prudent & Hemat Berdasarkan Pos Uang Daily) */}
      <div className="frugal-banner">
        <div className="frugal-content">
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', flexShrink: 0 }}>
            <ShieldCheck size={22} />
          </div>
          <div className="frugal-text">
            <h4>
              {adziima.hasDailyBudgetSet ? 'Panduan Jatah Pos Harian (Daily)' : 'Target Belanja Harian (Daily)'} · {monthLabel}
            </h4>
            <p>
              {adziima.hasDailyBudgetSet ? (
                <>
                  Sisa jatah belanja pos daily:{' '}
                  <strong>{formatIdr(adziima.dailySafeIdr)} / hari</strong>{' '}
                  <span style={{ color: '#0369a1' }}>
                    (dari sisa pagu pos {formatIdr(adziima.remainingDailyBudgetIdr)} untuk {adziima.remainingDays} hari tersisa sampai akhir bulan).
                  </span>{' '}
                  Pos terkunci tetap aman sampai gajian lagi!
                </>
              ) : (
                <>
                  Belum ada target di <strong>Pos Harian (Makan/Kebutuhan)</strong>.{' '}
                  <span style={{ color: '#0369a1' }}>
                    Klik tombol <strong>"Atur Pagu"</strong> pada pos Makan Harian di bawah untuk menentukan jatah belanja harianmu!
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Category Budget Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Pos Pengeluaran Adziima ({monthLabel})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Target alokasi bulanan di Indonesia (Rupiah)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsManageCatOpen(true)}
            className="btn-back-home"
            style={{
              borderColor: 'var(--pastel-blue-border)',
              color: '#0284c7',
              background: '#ffffff'
            }}
            title="Tambah atau edit pos pengeluaran"
          >
            <Sliders size={14} />
            <span>Kelola / Tambah Pos</span>
          </button>
        </div>

        <div className="categories-grid">
          {(adziima.categories || adziimaCategories).map((cat) => {
            const spending = adziima.spending[cat.id] || { totalIdr: 0, count: 0 };
            const spent = spending.totalIdr;
            const budget = cat.budgetIdr || 0;
            const percent = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : (spent > 0 ? 100 : 0);
            const isOver = budget > 0 && spent > budget;
            const isWarning = percent >= 50 && !isOver;
            const barColor = isOver ? '#f43f5e' : (isWarning ? '#f59e0b' : '#38bdf8');

            return (
              <div key={cat.id} className="category-card">
                <div>
                  <div className="category-header">
                    <div className="category-title-group">
                      <div className="category-icon">
                        <CategoryIcon name={cat.iconName} size={18} color={cat.color} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span className="category-name">{cat.name}</span>
                          {isOver && (
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#e11d48', background: '#ffe4e6', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                              🚨 Over
                            </span>
                          )}
                          {isWarning && (
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#b45309', background: '#fef3c7', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                              ⚠️ 50%+
                            </span>
                          )}
                        </div>
                        <div className="category-basis">{cat.note}</div>
                      </div>
                    </div>

                    {editingCatId === cat.id ? (
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <input
                          type="number"
                          value={catBudgetInput}
                          onChange={(e) => setCatBudgetInput(e.target.value)}
                          style={{ width: '85px', padding: '0.2rem 0.4rem', fontSize: '0.8rem', border: '1px solid #38bdf8', borderRadius: '4px' }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveCatBudget(cat.id)}
                          style={{ background: '#38bdf8', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEditBudget(cat)}
                        title="Atur target budget pos ini"
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                      >
                        <Edit2 size={13} />
                      </button>
                    )}
                  </div>

                  <div className="progress-bar-bg" style={{ position: 'relative' }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${percent}%`,
                        background: barColor,
                        boxShadow: isWarning ? '0 0 8px rgba(245, 158, 11, 0.4)' : (isOver ? '0 0 8px rgba(244, 63, 94, 0.4)' : 'none'),
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>

                  <div className="progress-meta">
                    <span>
                      Terpakai:{' '}
                      <span className="spent" style={{ color: isOver ? '#f43f5e' : (isWarning ? '#d97706' : 'inherit') }}>
                        {formatIdr(spent)}
                      </span>
                    </span>
                    <span>Budget: {budget > 0 ? formatIdr(budget) : 'Belum diatur'}</span>
                  </div>

                  <div style={{ marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid var(--bg-subtle)', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: isOver ? '#f43f5e' : (isWarning ? '#b45309' : 'var(--text-muted)') }}>
                      {isOver ? `⚠️ Lebih ${formatIdr(spent - budget)}` : `Sisa ${formatIdr(budget - spent)}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Adziima Transaction Diary for Current Month */}
      <div className="pastel-card" style={{ padding: '1.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1.2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              Riwayat Transaksi ({monthLabel})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Catatan harian pengeluaran dan pemasukan bulan {monthLabel}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn-back-home"
              onClick={handleExportExcel}
              style={{ background: 'var(--pastel-green-soft)', borderColor: '#a7f3d0', color: '#047857' }}
            >
              <Download size={14} />
              <span>Unduh XLS</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
            />
          </div>

          <select
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
          >
            <option value="all">Semua Pos</option>
            {adziimaCategories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.6rem', color: 'var(--text-dim)' }}>
              <Wallet size={24} />
            </div>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
              Belum ada transaksi di bulan {monthLabel}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Uangmu masih utuh dan tersimpan rapi! Klik "+ Catat Transaksi" setiap selesai belanja atau jajan.
            </p>
          </div>
        ) : (
          <div>
            {filteredTransactions.map((tx) => {
              const cat = adziimaCategories.find(c => c.id === tx.category) || { name: tx.category, iconName: 'Tag', color: '#64748b' };
              const isIncome = tx.type === 'Masuk';

              return (
                <div key={tx.id} className="tx-item">
                  <div className="tx-left">
                    <div className="tx-category-badge" style={{ background: isIncome ? '#ecfdf5' : 'var(--bg-subtle)' }}>
                      <CategoryIcon name={isIncome ? 'TrendingUp' : cat.iconName} size={18} color={isIncome ? '#059669' : cat.color} />
                    </div>
                    <div className="tx-details">
                      <h4>
                        {tx.title}
                        {isIncome && (
                          <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#059669', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', marginLeft: '0.4rem' }}>
                            Pemasukan
                          </span>
                        )}
                      </h4>
                      <div className="tx-meta">
                        <span>{formatDateIndo(tx.date)}</span>
                        {!isIncome && (
                          <>
                            <span>•</span>
                            <span>{cat.name}</span>
                          </>
                        )}
                        {tx.paymentMethod && (
                          <>
                            <span>•</span>
                            <span style={{ fontWeight: 600, color: isIncome ? '#059669' : 'inherit' }}>
                              {isIncome ? `Masuk ke ${tx.paymentMethod}` : tx.paymentMethod}
                            </span>
                          </>
                        )}
                        {tx.notes && (
                          <>
                            <span>•</span>
                            <span style={{ fontStyle: 'italic' }}>"{tx.notes}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="tx-right">
                    <div className="tx-amount" style={{ color: isIncome ? '#059669' : '#f43f5e' }}>
                      {isIncome ? `+${formatIdr(tx.amountIdr)}` : `-${formatIdr(tx.amountIdr)}`}
                    </div>
                    <div className="tx-actions">
                      <button
                        onClick={() => onEditTx(tx)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.2rem' }}
                        title="Edit Transaksi"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteTransaction('adziima', tx.id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.2rem' }}
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manage Categories Modal */}
      <ManageCategoriesModal
        isOpen={isManageCatOpen}
        onClose={() => setIsManageCatOpen(false)}
        userId="adziima"
      />
    </div>
  );
}
