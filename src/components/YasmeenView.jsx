import React, { useState } from 'react';
import { usePocket } from '../context/PocketContext';
import { formatCny, formatIdr, formatDateIndo } from '../utils/formatters';
import { exportMonthToExcel } from '../utils/exportExcel';
import UserAvatar from './UserAvatar';
import CategoryIcon from './CategoryIcon';
import UnifiedDashboardHeader from './UnifiedDashboardHeader';
import MonthNavigator, { ALL_MONTH_OPTIONS } from './MonthNavigator';
import {
  ArrowLeft,
  Wallet,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Edit2,
  Coffee,
  Coins,
  Settings,
  Download,
  Cloud,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  PieChart,
  PiggyBank,
  Lock
} from 'lucide-react';
import ManageCategoriesModal from './ManageCategoriesModal';

const DAYS_OF_WEEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function YasmeenView({ onOpenAdd, onEditTx, onOpenEditProfile, onOpenCloudModal }) {
  const {
    setActiveView,
    calculations,
    deleteTransaction,
    toggleStipend,
    updateCategoryBudget,
    setTotalMoney,
    toggleNongkrongDay,
    exchangeRate,
    users,
    selectedMonth,
    setSelectedMonth,
    yasmeenCurrencyView,
    setYasmeenCurrencyView,
    isCloudConnected,
    isCloudSyncing,
    yasmeenTransactions
  } = usePocket();

  const { yasmeen } = calculations;
  const user = users.yasmeen || {};
  const isChina = yasmeen.isChina; // True if <= 2027-01, False if > 2027-01
  const isViewYuan = false;

  const formatPrimary = (cny, idr) => {
    return formatIdr(idr);
  };

  const formatSecondary = () => null;

  const currentCategories = yasmeen.categories;
  const currentMonthTx = yasmeen.monthTx;

  const [editingCatId, setEditingCatId] = useState(null);
  const [tempBudget, setTempBudget] = useState('');
  const [isEditingModal, setIsEditingModal] = useState(false);
  const [modalInput, setModalInput] = useState('');
  const [balanceMode, setBalanceMode] = useState('current_balance');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');
  const [isManageCatOpen, setIsManageCatOpen] = useState(false);

  const monthLabel = ALL_MONTH_OPTIONS.find(m => m.value === selectedMonth)?.label || selectedMonth;

  const handleStartEditBudget = (cat) => {
    setEditingCatId(cat.id);
    if (isViewYuan) {
      setTempBudget((cat.budgetCny || 0).toString());
    } else {
      setTempBudget((cat.budgetIdr || 0).toString());
    }
  };

  const handleSaveBudget = (catId) => {
    const val = parseFloat(tempBudget) || 0;
    if (isViewYuan) {
      // Inputted as CNY, convert to IDR
      const asIdr = Math.round(val * exchangeRate);
      updateCategoryBudget('yasmeen', catId, asIdr, selectedMonth);
    } else {
      updateCategoryBudget('yasmeen', catId, val, selectedMonth);
    }
    setEditingCatId(null);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    setTotalMoney('yasmeen', modalInput, balanceMode);
    setIsEditingModal(false);
  };


  // Export to Excel handler
  const handleExportExcel = () => {
    // Collect all transactions up to current selectedMonth so October and previous months are fully preserved
    const allTxUpToMonth = (yasmeenTransactions || []).filter(tx => {
      const txMonth = (tx?.date || '').slice(0, 7);
      return txMonth && txMonth <= selectedMonth;
    });

    exportMonthToExcel({
      userName: user.name || 'Yasmeen',
      monthLabel,
      selectedMonth,
      transactions: currentMonthTx,
      allTransactions: allTxUpToMonth,
      categories: yasmeen.categories || currentCategories,
      categorySpending: yasmeen.spending,
      currency: 'IDR',
      summary: {
        startBalance: formatIdr(yasmeen.startBalanceIdr),
        monthIncome: formatIdr(yasmeen.monthIncomeIdr),
        totalInflow: formatIdr(yasmeen.totalInflowIdr),
        totalBudget: formatIdr(yasmeen.totalAllBudgetIdr),
        totalOutflow: formatIdr(yasmeen.totalOutflowIdr),
        remainingBudget: formatIdr(yasmeen.remainingAllBudgetIdr),
        plannedSavings: formatIdr(yasmeen.plannedSavingsIdr),
        netBalance: formatIdr(yasmeen.totalBalanceIdr)
      }
    });
  };

  // Filtered transactions for the view
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
      {/* Unified App Header (Profile, Currency Switcher, Actions, and Integrated Month Navigator) */}
      <UnifiedDashboardHeader
        user={user}
        isYasmeen={true}
        isChina={false}
        onOpenEditProfile={onOpenEditProfile}
        onOpenBalanceModal={() => {
          setModalInput(Math.round(yasmeen.totalBalanceIdr).toString());
          setBalanceMode('current_balance');
          setIsEditingModal(true);
        }}
        onOpenCloudModal={onOpenCloudModal}
        onExportExcel={handleExportExcel}
        transactionCount={currentMonthTx.length}
      />

      {/* Modal Edit Saldo */}
      {isEditingModal && (
        <div className="modal-overlay" onClick={() => setIsEditingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>Atur Saldo & Uang Yasmeen</h3>
              <button className="modal-close-btn" onClick={() => setIsEditingModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveModal}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Pilih yang Ingin Kamu Atur:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setBalanceMode('current_balance')}
                    style={{
                      padding: '0.55rem 0.5rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: balanceMode === 'current_balance' ? '2px solid #db2777' : '1px solid #cbd5e1',
                      background: balanceMode === 'current_balance' ? '#fdf2f8' : '#f8fafc',
                      color: balanceMode === 'current_balance' ? '#9d174d' : '#64748b',
                      cursor: 'pointer',
                      textAlign: 'center',
                      lineHeight: 1.25
                    }}
                  >
                    <div>Saldo Kas Sekarang</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 500, opacity: 0.8 }}>(Uang Riil Saat Ini)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBalanceMode('initial_fund')}
                    style={{
                      padding: '0.55rem 0.5rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: balanceMode === 'initial_fund' ? '2px solid #db2777' : '1px solid #cbd5e1',
                      background: balanceMode === 'initial_fund' ? '#fdf2f8' : '#f8fafc',
                      color: balanceMode === 'initial_fund' ? '#9d174d' : '#64748b',
                      cursor: 'pointer',
                      textAlign: 'center',
                      lineHeight: 1.25
                    }}
                  >
                    <div>Modal Awal Bulan</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 500, opacity: 0.8 }}>(Sebelum Belanja)</div>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {balanceMode === 'current_balance' ? 'Uang Kas / Rekening Yasmeen Saat Ini (Rp IDR) *' : 'Modal Awal Yasmeen di Awal Bulan (Rp IDR) *'}
                </label>
                <input
                  type="number"
                  className="form-input"
                  style={{ fontSize: '1.2rem', fontWeight: 800 }}
                  value={modalInput}
                  onChange={(e) => setModalInput(e.target.value)}
                  autoFocus
                  required
                />
                <div style={{ fontSize: '0.8rem', color: '#db2777', marginTop: '0.35rem', fontWeight: 600 }}>
                  Terbaca: {formatIdr(parseFloat(modalInput) || 0)}
                </div>
              </div>

              {/* Informational preview note */}
              <div style={{ padding: '0.75rem', background: '#fdf2f8', borderRadius: '8px', border: '1px solid #fbcfe8', fontSize: '0.78rem', color: '#9d174d', marginBottom: '1.2rem', lineHeight: 1.4 }}>
                {balanceMode === 'current_balance' ? (
                  <>
                    💡 <strong>Sisa Saldo Kas</strong> kamu akan langsung menjadi <strong>{formatPrimary((parseFloat(modalInput) || 0) / exchangeRate, parseFloat(modalInput) || 0)}</strong>. Seluruh riwayat {currentMonthTx.length} transaksi bulan {monthLabel} tetap aman tersimpan tanpa hilang!
                  </>
                ) : (
                  <>
                    💡 Nominal ini dijadikan patokan modal awal bulan. Saldo kas saat ini akan dihitung dari modal ini dikurangi pengeluaran bulan {monthLabel}.
                  </>
                )}
              </div>

              <button type="submit" className="submit-btn pink">
                Simpan Saldo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Unified Balance & Allocation Cards for Yasmeen */}
      <div className="balance-grid grid-4">
        {/* Card 1: Sisa Saldo Kas */}
        <div className="balance-card" style={{ borderColor: 'var(--pastel-pink-border)' }}>
          <div>
            <div className="card-header-small">
              <span style={{ color: '#db2777' }}>Sisa Saldo Kas</span>
              <Wallet size={18} color="#db2777" />
            </div>
            <div className="amount-main" style={{ color: '#db2777' }}>
              {formatPrimary(yasmeen.totalBalanceCny, yasmeen.totalBalanceIdr)}
            </div>
            {formatSecondary(yasmeen.totalBalanceCny, yasmeen.totalBalanceIdr) && (
              <div className="amount-sub">
                {formatSecondary(yasmeen.totalBalanceCny, yasmeen.totalBalanceIdr)}
              </div>
            )}
          </div>
          <div className="card-footer-meta">
            <span>Total dana: {formatPrimary(yasmeen.totalInflowCny, yasmeen.totalInflowIdr)}</span>
            <span style={{ color: '#db2777', fontWeight: 700 }}>Aktif</span>
          </div>
        </div>

        {/* Card 2: Pengeluaran Bulan Ini */}
        <div className="balance-card">
          <div>
            <div className="card-header-small">
              <span>Pengeluaran Bulan Ini</span>
              <TrendingDown size={18} color="#f43f5e" />
            </div>
            <div className="amount-main" style={{ color: '#f43f5e' }}>
              {formatPrimary(yasmeen.totalOutflowCny, yasmeen.totalOutflowIdr)}
            </div>
            <div className="amount-sub">
              {currentMonthTx.filter(t => t.type !== 'Masuk').length} transaksi tercatat
            </div>
          </div>
          <div className="card-footer-meta">
            <span>Bulan {monthLabel}</span>
            <span style={{ color: '#f43f5e', fontWeight: 700 }}>Terpakai</span>
          </div>
        </div>

        {/* Card 3: Disisihkan ke Pos Belanja (Pagu Pos) */}
        <div className="balance-card">
          <div>
            <div className="card-header-small">
              <span>Disisihkan ke Pos</span>
              <Sliders size={18} color="#ea580c" />
            </div>
            <div className="amount-main" style={{ color: '#ea580c' }}>
              {formatPrimary(yasmeen.totalAllBudgetCny, yasmeen.totalAllBudgetIdr)}
            </div>
            <div className="amount-sub">
              Sisa pagu: {formatPrimary(yasmeen.remainingAllBudgetCny, yasmeen.remainingAllBudgetIdr)}
            </div>
          </div>
          <div className="card-footer-meta">
            <span>Target seluruh pos</span>
            <span style={{ color: '#ea580c', fontWeight: 700 }}>Pagu</span>
          </div>
        </div>

        {/* Card 4: Simpanan Bersih (Tabungan) */}
        <div className="balance-card">
          <div>
            <div className="card-header-small">
              <span>Simpanan Bersih</span>
              <PiggyBank size={18} color="#10b981" />
            </div>
            <div className="amount-main" style={{ color: '#10b981' }}>
              {formatPrimary(yasmeen.plannedSavingsCny, yasmeen.plannedSavingsIdr)}
            </div>
            <div className="amount-sub">
              {yasmeen.isOverAllocated ? 'Pagu pos melebihi saldo' : 'Di luar seluruh pos belanja'}
            </div>
          </div>
          <div className="card-footer-meta">
            <span>Murni ditabung</span>
            <span style={{ color: yasmeen.isOverAllocated ? '#ef4444' : '#10b981', fontWeight: 700 }}>
              {yasmeen.isOverAllocated ? 'Defisit Pagu' : 'Aman'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons for Yasmeen */}
      <div className="action-buttons-grid">
        <button
          className="btn-action-primary pink"
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

      {/* Alert if Total Category Budgets exceed Total Available Funds */}
      {yasmeen.isOverAllocated && (
        <div style={{ marginBottom: '1.2rem', padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', color: '#b91c1c', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>
            <strong>Perhatian:</strong> Total pagu pos belanja ({formatPrimary(yasmeen.totalAllBudgetCny, yasmeen.totalAllBudgetIdr)}) melebihi dana yang kamu miliki ({formatPrimary(yasmeen.totalInflowCny, yasmeen.totalInflowIdr)}) sebesar <strong>{formatPrimary(yasmeen.overAllocatedAmountCny, yasmeen.overAllocatedAmountIdr)}</strong>. Sesuaikan target pagu pos agar simpanan tabungan bisa terbentuk.
          </span>
        </div>
      )}

      {/* Guide Banner & Nongkrong Tracker */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="pastel-card" style={{ padding: '1.2rem', background: '#fdf2f8', borderColor: '#fbcfe8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <Sparkles size={18} color="#db2777" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#9d174d' }}>
              Panduan Jatah Belanja & Makan {monthLabel}
            </h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#831843', lineHeight: 1.5, margin: 0 }}>
            {yasmeen.hasDailyBudgetSet ? (
              <>
                Sisa jatah pos daily:{' '}
                <strong>
                  {formatPrimary(yasmeen.dailySafeCny, yasmeen.dailySafeIdr)} / hari
                </strong>{' '}
                {formatSecondary(yasmeen.dailySafeCny, yasmeen.dailySafeIdr) && (
                  <span>({formatSecondary(yasmeen.dailySafeCny, yasmeen.dailySafeIdr)})</span>
                )}{' '}
                <span style={{ fontSize: '0.78rem', color: '#9d174d' }}>
                  (untuk {yasmeen.remainingDays} hari tersisa dari pos Makan, Jajan & Kebutuhan).
                </span>
              </>
            ) : (
              <>
                Belum ada target pada pos Makan / Kebutuhan Harian. Tentukan pagu di pos bawah agar jatah harianmu terkontrol!
              </>
            )}
          </p>
        </div>
      </div>

      {/* Category Budget Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              Budget Kategori Pos Bulanan
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Alokasi dan batas pengeluaran bulanan (Rupiah Rp)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsManageCatOpen(true)}
            className="btn-back-home"
            style={{
              borderColor: 'var(--pastel-pink-border)',
              color: '#db2777',
              background: '#ffffff'
            }}
            title="Tambah atau edit pos pengeluaran"
          >
            <Sliders size={14} />
            <span>Kelola / Tambah Pos</span>
          </button>
        </div>

        {currentCategories.length === 0 ? (
          <div className="pastel-card" style={{ textAlign: 'center', padding: '2.5rem 1.2rem', background: '#ffffff', border: '1.5px dashed var(--pastel-pink-border)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '0.6rem' }}>📋</div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Belum Ada Pos Pengeluaran di Bulan Ini
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.2rem auto', lineHeight: 1.5 }}>
              Bulan baru dimulai dengan pos kosong agar kamu bisa merancang anggaran belanja sesuai kebutuhan.
            </p>
            <button
              type="button"
              onClick={() => setIsManageCatOpen(true)}
              className="submit-btn pink"
              style={{ display: 'inline-flex', width: 'auto', padding: '0.6rem 1.4rem', fontSize: '0.85rem', margin: '0 auto' }}
            >
              <Plus size={16} />
              <span>+ Buat Pos Pengeluaran Baru</span>
            </button>
          </div>
        ) : (
          <div className="categories-grid">
          {currentCategories.map((cat) => {
            const spending = yasmeen.spending[cat.id] || { totalCny: 0, totalIdr: 0, count: 0 };
            const spentIdr = spending.totalIdr || 0;
            const budgetIdr = cat.budgetIdr || 0;
            const remainingIdr = budgetIdr - spentIdr;
            const effectiveBudget = budgetIdr;
            const effectiveSpent = spentIdr;
            const percent = effectiveBudget > 0 ? Math.min(100, Math.round((effectiveSpent / effectiveBudget) * 100)) : (effectiveSpent > 0 ? 100 : 0);
            const isOver = effectiveBudget > 0 && effectiveSpent > effectiveBudget;
            const isWarning = percent >= 50 && !isOver;
            const barColor = isOver ? '#f43f5e' : (isWarning ? '#f59e0b' : '#f472b6');

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
                          value={tempBudget}
                          onChange={(e) => setTempBudget(e.target.value)}
                          placeholder="Rp"
                          style={{ width: '95px', padding: '0.2rem 0.4rem', fontSize: '0.8rem', border: '1px solid #f472b6', borderRadius: '4px' }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveBudget(cat.id)}
                          style={{ background: '#f472b6', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEditBudget(cat)}
                        title="Atur target budget"
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
                        {formatIdr(spentIdr)}
                      </span>
                    </span>
                    <span>
                      Budget: {budgetIdr > 0 ? formatIdr(budgetIdr) : 'Belum diatur'}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid var(--bg-subtle)', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: isOver ? '#f43f5e' : 'var(--text-muted)' }}>
                    {isOver
                      ? `⚠️ Lebih ${formatIdr(spentIdr - budgetIdr)}`
                      : `Sisa ${formatIdr(remainingIdr)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

      {/* Yasmeen Transaction Diary for Current Month */}
      <div className="pastel-card" style={{ padding: '1.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1.2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              Riwayat Transaksi ({monthLabel})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Catatan jajan dan pengeluaran bulan {monthLabel}
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
            <option value="all">Semua Kategori</option>
            {currentCategories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.6rem', color: 'var(--text-dim)' }}>
              <Wallet size={24} />
            </div>
            <p style={{ fontWeight: 700, fontSize: '1rem' }}>Belum ada transaksi di bulan {monthLabel}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Klik "+ Catat Transaksi" untuk memasukkan catatan belanja bulan ini.
            </p>
          </div>
        ) : (
          <div>
            {filteredTransactions.map((tx) => {
              const cat = currentCategories.find(c => c.id === tx.category) || { name: tx.category, iconName: 'Tag', color: '#64748b' };
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
                    <div className="tx-amount" style={{ color: isIncome ? '#059669' : '#db2777' }}>
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
                        onClick={() => deleteTransaction('yasmeen', tx.id)}
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
        userId="yasmeen"
      />
    </div>
  );
}
