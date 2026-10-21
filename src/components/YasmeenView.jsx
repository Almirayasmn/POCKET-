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
    isCloudSyncing
  } = usePocket();

  const { yasmeen } = calculations;
  const user = users.yasmeen || {};
  const isChina = yasmeen.isChina; // True if <= 2027-01, False if > 2027-01
  const isViewYuan = isChina && yasmeenCurrencyView !== 'IDR';

  const formatPrimary = (cny, idr) => {
    if (!isChina || !isViewYuan) return formatIdr(idr);
    return formatCny(cny);
  };

  const formatSecondary = (cny, idr) => {
    if (!isChina) return null;
    if (isViewYuan) return `≈ ${formatIdr(idr)}`;
    return `≈ ${formatCny(cny)}`;
  };

  const currentCategories = yasmeen.categories;
  const currentMonthTx = yasmeen.monthTx;

  const [editingCatId, setEditingCatId] = useState(null);
  const [tempBudget, setTempBudget] = useState('');
  const [isEditingModal, setIsEditingModal] = useState(false);
  const [modalInput, setModalInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');
  const [isManageCatOpen, setIsManageCatOpen] = useState(false);

  const monthLabel = ALL_MONTH_OPTIONS.find(m => m.value === selectedMonth)?.label || selectedMonth;

  const handleStartEditBudget = (cat) => {
    setEditingCatId(cat.id);
    if (!isChina || !isViewYuan) {
      setTempBudget((cat.budgetIdr || 0).toString());
    } else {
      setTempBudget((cat.budgetCny || 0).toString());
    }
  };

  const handleSaveBudget = (catId) => {
    const val = parseFloat(tempBudget) || 0;
    if (!isChina || !isViewYuan) {
      // Inputted as IDR, convert to CNY for baseline
      const asCny = Math.round((val / exchangeRate) * 100) / 100;
      updateCategoryBudget('yasmeen', catId, asCny);
    } else {
      updateCategoryBudget('yasmeen', catId, val);
    }
    setEditingCatId(null);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    setTotalMoney('yasmeen', modalInput);
    setIsEditingModal(false);
  };

  // Nongkrong count in this month (checklist & transactions)
  const checkedDays = yasmeen.nongkrongDays || [];
  const nongkrongTx = currentMonthTx.filter(t => (t.category === 'nongkrong' || t.category === 'jajan') && t.type !== 'Masuk');
  const nongkrongCount = checkedDays.length > 0 ? checkedDays.length : nongkrongTx.length;
  const remainingSlots = Math.max(0, 2 - nongkrongCount);

  // Per-session nongkrong budget metrics (Pagu maks. ¥75 / sekali nongkrong, target 2x/minggu)
  const NONGKRONG_MAX_PER_SESSION = 75; // ¥75 per sesi
  const WEEKLY_NONGKRONG_BUDGET = 150; // 2x * ¥75
  const totalNongkrongSpentCny = nongkrongTx.reduce((sum, t) => sum + (t.amountCny || 0), 0);
  const totalNongkrongSpentIdr = nongkrongTx.reduce((sum, t) => sum + (t.amountIdr || 0), 0);
  const overBudgetTxList = nongkrongTx.filter(t => (t.amountCny || 0) > NONGKRONG_MAX_PER_SESSION);
  const isOverBudget = overBudgetTxList.length > 0;

  // Export to Excel handler
  const handleExportExcel = () => {
    exportMonthToExcel({
      userName: user.name || 'Yasmeen',
      monthLabel,
      transactions: currentMonthTx,
      categories: yasmeen.categories || currentCategories,
      categorySpending: yasmeen.spending,
      currency: isViewYuan ? 'CNY' : 'IDR',
      exchangeRate,
      isChinaPeriod: isChina,
      summary: {
        startBalance: formatPrimary(yasmeen.startBalanceCny, yasmeen.startBalanceIdr),
        monthIncome: formatPrimary(yasmeen.monthIncomeCny, yasmeen.monthIncomeIdr),
        totalInflow: formatPrimary(yasmeen.totalInflowCny, yasmeen.totalInflowIdr),
        totalBudget: formatPrimary(yasmeen.totalAllBudgetCny, yasmeen.totalAllBudgetIdr),
        totalOutflow: formatPrimary(yasmeen.totalOutflowCny, yasmeen.totalOutflowIdr),
        remainingBudget: formatPrimary(yasmeen.remainingAllBudgetCny, yasmeen.remainingAllBudgetIdr),
        plannedSavings: formatPrimary(yasmeen.plannedSavingsCny, yasmeen.plannedSavingsIdr),
        netBalance: formatPrimary(yasmeen.totalBalanceCny, yasmeen.totalBalanceIdr)
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
        isChina={isChina}
        onOpenEditProfile={onOpenEditProfile}
        onOpenBalanceModal={() => {
          setModalInput((user.initialFundIdr || 10000000).toString());
          setIsEditingModal(true);
        }}
        onOpenCloudModal={onOpenCloudModal}
        onExportExcel={handleExportExcel}
        transactionCount={currentMonthTx.length}
        currencyToggle={
          isChina && (
            <div
              style={{
                display: 'inline-flex',
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '0.2rem',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid var(--pastel-pink-border)',
                boxShadow: '0 2px 6px rgba(244, 114, 182, 0.12)'
              }}
            >
              <button
                type="button"
                onClick={() => setYasmeenCurrencyView('CNY')}
                style={{
                  border: 'none',
                  background: isViewYuan ? '#ec4899' : 'transparent',
                  color: isViewYuan ? '#ffffff' : '#9d174d',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                ¥ Yuan
              </button>
              <button
                type="button"
                onClick={() => setYasmeenCurrencyView('IDR')}
                style={{
                  border: 'none',
                  background: !isViewYuan ? '#ec4899' : 'transparent',
                  color: !isViewYuan ? '#ffffff' : '#9d174d',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Rp IDR
              </button>
            </div>
          )
        }
      />

      {/* Modal Edit Saldo */}
      {isEditingModal && (
        <div className="modal-overlay" onClick={() => setIsEditingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Atur Modal Awal Yasmeen</h3>
              <button className="modal-close-btn" onClick={() => setIsEditingModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveModal}>
              <div className="form-group">
                <label className="form-label">Modal Awal Yasmeen (Rp IDR) *</label>
                <input
                  type="number"
                  className="form-input"
                  style={{ fontSize: '1.2rem', fontWeight: 800 }}
                  value={modalInput}
                  onChange={(e) => setModalInput(e.target.value)}
                  autoFocus
                  required
                />
                <div style={{ fontSize: '0.8rem', color: '#db2777', marginTop: '0.3rem' }}>
                  Setara: {formatCny((parseFloat(modalInput) || 0) / exchangeRate)}
                </div>
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

        {/* Nongkrong Tracker (Khusus Mulai November 2026) */}
        {selectedMonth >= '2026-11' ? (
          <div className="pastel-card" style={{ padding: '1.25rem' }}>
            {/* Header: Title & Badges */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Coffee size={20} color="#d97706" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Nongkrong Kafe
                  </h4>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Batas Maksimal & Jadwal Mingguan
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#92400e', background: '#fef3c7', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', border: '1px solid #fde68a' }}>
                  ☕ Maks. ¥75 / Sesi
                </span>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#ec4899', background: '#fdf2f8', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', border: '1px solid #fbcfe8' }}>
                  Target: 2x / minggu
                </span>
              </div>
            </div>

            {/* 3 Metric Cards: Pagu Sesi, Pagu Mingguan, Realisasi Terpakai */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.9rem' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '0.6rem 0.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--card-border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 600 }}>Pagu per Sesi</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#d97706', marginTop: '0.15rem' }}>
                  {formatPrimary(NONGKRONG_MAX_PER_SESSION, NONGKRONG_MAX_PER_SESSION * exchangeRate)}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Maksimal</div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '0.6rem 0.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--card-border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 600 }}>Pagu Mingguan</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ec4899', marginTop: '0.15rem' }}>
                  {formatPrimary(WEEKLY_NONGKRONG_BUDGET, WEEKLY_NONGKRONG_BUDGET * exchangeRate)}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>2 sesi × ¥75</div>
              </div>

              <div style={{ background: isOverBudget ? '#fef2f2' : '#f0fdf4', padding: '0.6rem 0.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: `1px solid ${isOverBudget ? '#fecaca' : '#bbf7d0'}` }}>
                <div style={{ fontSize: '0.68rem', color: isOverBudget ? '#991b1b' : '#166534', fontWeight: 600 }}>Total Terpakai</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: isOverBudget ? '#dc2626' : '#15803d', marginTop: '0.15rem' }}>
                  {formatPrimary(totalNongkrongSpentCny, totalNongkrongSpentIdr)}
                </div>
                <div style={{ fontSize: '0.65rem', color: isOverBudget ? '#b91c1c' : '#16a34a' }}>
                  {nongkrongTx.length} transaksi
                </div>
              </div>
            </div>

            {/* Status Alert Banner */}
            {isOverBudget ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff1f2', border: '1px solid #fecdd3', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.85rem' }}>
                <AlertTriangle size={16} color="#e11d48" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.74rem', color: '#9f1239', lineHeight: 1.35 }}>
                  <strong>Perhatian:</strong> Ada sesi nongkrong yang melebihi batas <strong>¥75</strong>. Tetap disiplin yaa agar uang saku cukup!
                </div>
              </div>
            ) : totalNongkrongSpentCny > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.85rem' }}>
                <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.74rem', color: '#166534', lineHeight: 1.35 }}>
                  <strong>Hebat & Disiplin!</strong> Seluruh sesi nongkrong bulan ini masih berada dalam batas aman (≤ ¥75 per sesi).
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fffbeb', border: '1px solid #fde68a', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.85rem' }}>
                <Coffee size={16} color="#d97706" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.74rem', color: '#92400e', lineHeight: 1.35 }}>
                  Tandai hari kamu nongkrong di bawah dan catat nominal pengeluarannya (maksimal ¥75 per sesi).
                </div>
              </div>
            )}

            {/* Days Checklist Strip */}
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.45rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Pilih Hari Nongkrong Minggu Ini:</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {checkedDays.length} diceklis • Sisa: {remainingSlots}x
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.35rem', marginBottom: '0.85rem' }}>
              {DAYS_OF_WEEK.map((day) => {
                const isChecked = checkedDays.includes(day);
                return (
                  <div
                    key={day}
                    onClick={() => toggleNongkrongDay(day, selectedMonth)}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '0.45rem 0.15rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isChecked ? '#fdf2f8' : 'var(--bg-subtle)',
                      border: isChecked ? '1.5px solid #f472b6' : '1px solid var(--card-border-subtle)',
                      cursor: 'pointer',
                      userSelect: 'none',
                      transition: 'all 0.15s ease'
                    }}
                    title={`Klik untuk ceklis / unceklis hari ${day}`}
                  >
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: isChecked ? '#db2777' : 'var(--text-dim)', marginBottom: '0.25rem' }}>
                      {day}
                    </div>
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        margin: '0 auto',
                        borderRadius: '6px',
                        background: isChecked ? '#f472b6' : '#ffffff',
                        border: isChecked ? 'none' : '1.5px solid #cbd5e1',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.82rem',
                        fontWeight: 900,
                        boxShadow: isChecked ? '0 2px 6px rgba(244, 114, 182, 0.35)' : 'none'
                      }}
                    >
                      {isChecked ? '✓' : ''}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Action Button: Catat Pengeluaran Kafe */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: nongkrongTx.length > 0 ? '0.75rem' : 0 }}>
              <button
                type="button"
                onClick={() => onOpenAdd('Keluar', {
                  title: 'Nongkrong Kafe',
                  category: 'jajan',
                  amount: 75,
                  notes: 'Sesi kafe (Pagu maks. ¥75)'
                })}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 0.8rem',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(236, 72, 153, 0.25)'
                }}
              >
                <Plus size={15} />
                <span>+ Catat Nongkrong (Pagu Maks. ¥75)</span>
              </button>
            </div>

            {/* Riwayat Transaksi Nongkrong Terkait */}
            {nongkrongTx.length > 0 && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--card-border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Riwayat Pengeluaran Kafe ({nongkrongTx.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {nongkrongTx.slice(0, 3).map((tx) => {
                    const isTxOver = (tx.amountCny || 0) > NONGKRONG_MAX_PER_SESSION;
                    return (
                      <div
                        key={tx.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'var(--bg-subtle)',
                          padding: '0.4rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.85rem' }}>☕</span>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{tx.title || 'Nongkrong Kafe'}</div>
                            <div style={{ fontSize: '0.66rem', color: 'var(--text-dim)' }}>{formatDateIndo(tx.date)}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, color: isTxOver ? '#dc2626' : 'var(--text-main)' }}>
                            {formatPrimary(tx.amountCny, tx.amountIdr)}
                          </div>
                          <span
                            style={{
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              padding: '0.1rem 0.35rem',
                              borderRadius: '4px',
                              background: isTxOver ? '#fee2e2' : '#dcfce7',
                              color: isTxOver ? '#b91c1c' : '#15803d'
                            }}
                          >
                            {isTxOver ? `Over +¥${(tx.amountCny || 0) - NONGKRONG_MAX_PER_SESSION}` : `Aman (≤ ¥75)`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="pastel-card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#fffbeb', border: '1px solid #fde68a' }}>
            <Coffee size={24} color="#d97706" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#92400e', margin: 0 }}>
                  Nongkrong Kafe (Mulai November 2026)
                </h4>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b45309', background: '#fef3c7', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                  Pagu: Maks. ¥75 / Sesi
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#b45309', margin: 0, lineHeight: 1.4 }}>
                Target nongkrong kafe 2x/minggu dengan pagu maksimal <strong>75 Yuan per sekali nongkrong</strong> (total ¥150/minggu) akan aktif otomatis mulai November 2026 saat tiba di kampus Nanning.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Prinsip Keuangan Yasmeen: Hidup Mandiri Sesuai Stipend */}
      {isChina && (
        <div
          className="pastel-card"
          style={{
            padding: '1.1rem 1.3rem',
            background: '#ffffff',
            border: '1.5px solid #fbcfe8',
            marginBottom: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 4px 16px -2px rgba(244, 114, 182, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#db2777', flexShrink: 0, border: '1px solid #fbcfe8' }}>
              <Sparkles size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#9d174d' }}>
                  Prinsip Keuangan: Pengeluaran Mandiri Sesuai Stipend (¥1.500 / bln)
                </h4>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9d174d', background: '#fdf2f8', border: '1px solid #fbcfe8', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)' }}>
                  {selectedMonth === '2026-11' ? 'Nov: + Kebutuhan Awal Rp 500rb' : 'Rutin: 100% Sesuai Stipend'}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#831843', lineHeight: 1.55 }}>
                Meskipun modal awal ada <strong>Rp 10.000.000</strong> (¥3.636,36), uang ini dijaga utuh sebagai tabungan aman. Pengeluaran bulanan dialokasikan pas dari stipend kampus <strong>¥1.500 / bulan</strong> (total alokasi pos rutin: <strong>¥1.470</strong>).
                {selectedMonth === '2026-11'
                  ? ' Khusus November terdapat pos Kebutuhan Awal sebesar Rp 500.000 (¥182) untuk persiapan tiba di China.'
                  : ' Untuk bulan ini dan selanjutnya, pos Kebutuhan Awal otomatis Rp 0 (sudah tidak diperlukan).'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Budget Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {isChina ? `Budget Kategori Kampus Nanning (${isViewYuan ? 'Yuan ¥' : 'Rupiah Rp'})` : 'Budget Kategori Harian (Indonesia)'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {isChina ? 'Alokasi Yuan & Rupiah periode kuliah' : 'Alokasi pengeluaran Rupiah di Indonesia'}
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

        <div className="categories-grid">
          {currentCategories.map((cat) => {
            const spending = yasmeen.spending[cat.id] || { totalCny: 0, totalIdr: 0, count: 0 };
            const spentCny = spending.totalCny;
            const spentIdr = spending.totalIdr;
            const budgetCny = cat.budgetCny || 0;
            const budgetIdr = cat.budgetIdr || 0;
            const remainingCny = budgetCny - spentCny;
            const remainingIdr = budgetIdr - spentIdr;
            const effectiveBudget = isChina ? budgetCny : (budgetIdr || budgetCny);
            const effectiveSpent = isChina ? spentCny : (spentIdr || spentCny);
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
                          placeholder={isViewYuan ? '¥' : 'Rp'}
                          style={{ width: isViewYuan ? '70px' : '95px', padding: '0.2rem 0.4rem', fontSize: '0.8rem', border: '1px solid #f472b6', borderRadius: '4px' }}
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
                        {formatPrimary(spentCny, spentIdr)}
                      </span>
                    </span>
                    <span>
                      Budget: {budgetCny > 0 || budgetIdr > 0 ? formatPrimary(budgetCny, budgetIdr) : 'Belum diatur'}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid var(--bg-subtle)', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: spentCny > budgetCny && budgetCny > 0 ? '#f43f5e' : 'var(--text-muted)' }}>
                    {spentCny > budgetCny && budgetCny > 0
                      ? `⚠️ Lebih ${formatPrimary(spentCny - budgetCny, spentIdr - budgetIdr)}`
                      : `Sisa ${formatPrimary(remainingCny, remainingIdr)}`}
                  </span>
                  {formatSecondary(remainingCny, remainingIdr) && (
                    <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      {formatSecondary(remainingCny, remainingIdr)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
                      {isIncome
                        ? (isChina ? `+${formatCny(tx.amountCny)}` : `+${formatIdr(tx.amountIdr)}`)
                        : (isChina ? `-${formatCny(tx.amountCny)}` : `-${formatIdr(tx.amountIdr)}`)}
                      {isChina && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                          ≈ {formatIdr(tx.amountIdr)}
                        </div>
                      )}
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
