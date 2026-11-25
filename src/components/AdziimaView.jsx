import React, { useState } from 'react';
import { usePocket } from '../context/PocketContext';
import { formatIdr, formatDateIndo } from '../utils/formatters';
import { exportMonthToExcel } from '../utils/exportExcel';
import CategoryIcon from './CategoryIcon';
import UnifiedDashboardHeader from './UnifiedDashboardHeader';
import { ALL_MONTH_OPTIONS } from './MonthNavigator';
import ManageCategoriesModal from './ManageCategoriesModal';
import {
  Wallet,
  TrendingDown,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  Download,
  Sliders,
  FolderUp,
  X
} from 'lucide-react';

export default function AdziimaView({ onOpenAdd, onEditTx, onOpenEditProfile, onOpenCloudModal }) {
  const {
    users,
    calculations,
    adziimaCategories,
    deleteTransaction,
    updateCategoryBudget,
    setTotalMoney,
    selectedMonth,
    adziimaTransactions,
    getCategoriesForMonth,
    googleDriveUrl,
    exchangeRate
  } = usePocket();

  const { adziima } = calculations;
  const user = users.adziima || {};
  const currentMonthTx = adziima.monthTx;
  const currentCategories = adziima.categories || adziimaCategories;

  const [isEditingMoney, setIsEditingMoney] = useState(false);
  const [moneyInput, setMoneyInput] = useState('');
  const [balanceMode, setBalanceMode] = useState('current_balance');
  const [editingCatId, setEditingCatId] = useState(null);
  const [catBudgetInput, setCatBudgetInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');
  const [isManageCatOpen, setIsManageCatOpen] = useState(false);

  const monthLabel = ALL_MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label || selectedMonth;

  const handleSaveMoney = (e) => {
    e.preventDefault();
    setTotalMoney('adziima', moneyInput, balanceMode);
    setIsEditingMoney(false);
  };

  const handleStartEditBudget = (cat) => {
    setEditingCatId(cat.id);
    setCatBudgetInput((cat.budgetIdr || 0).toString());
  };

  const handleSaveCatBudget = (catId) => {
    updateCategoryBudget('adziima', catId, catBudgetInput, selectedMonth);
    setEditingCatId(null);
  };

  const handleExportExcel = (targetMonth = selectedMonth) => {
    const label = ALL_MONTH_OPTIONS.find((opt) => opt.value === targetMonth)?.label || targetMonth;
    const mTx = (adziimaTransactions || []).filter((tx) => (tx?.date || '').startsWith(targetMonth));
    const mCats = getCategoriesForMonth
      ? getCategoriesForMonth('adziima', targetMonth)
      : targetMonth === selectedMonth
      ? currentCategories
      : [];

    const mSpending = {};
    mCats.forEach((c) => {
      mSpending[c.id] = { totalIdr: 0, count: 0 };
    });
    mTx.forEach((tx) => {
      if (tx?.type !== 'Masuk' && mSpending[tx?.category]) {
        mSpending[tx.category].totalIdr += tx.amountIdr || 0;
        mSpending[tx.category].count += 1;
      }
    });

    let mIncome = 0;
    let mOutflow = 0;
    mTx.forEach((tx) => {
      if (tx?.type === 'Masuk') mIncome += tx.amountIdr || 0;
      else mOutflow += tx.amountIdr || 0;
    });

    const totalBudget = mCats.reduce((sum, c) => {
      const b = c.budgetIdr !== undefined && c.budgetIdr !== null ? c.budgetIdr : c.budget;
      return sum + (Number(b) || 0);
    }, 0);
    const remainingBudget = Math.max(0, totalBudget - mOutflow);

    const isCur = targetMonth === selectedMonth;
    const startBalance = isCur ? adziima.startBalanceIdr || adziima.initialIdr || 0 : 0;
    const totalInflow = startBalance + mIncome;
    const netBalance = isCur ? adziima.totalBalanceIdr : mIncome - mOutflow;
    const plannedSavings = Math.max(0, totalInflow - totalBudget);

    exportMonthToExcel({
      userName: user.name || 'Adziima',
      monthLabel: label,
      selectedMonth: targetMonth,
      transactions: mTx,
      categories: mCats,
      categorySpending: mSpending,
      exchangeRate,
      summary: {
        startBalance: formatIdr(startBalance),
        monthIncome: formatIdr(mIncome),
        totalInflow: formatIdr(totalInflow),
        totalBudget: formatIdr(totalBudget),
        totalOutflow: formatIdr(mOutflow),
        remainingBudget: formatIdr(remainingBudget),
        plannedSavings: formatIdr(plannedSavings),
        netBalance: formatIdr(netBalance)
      }
    });
  };

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

  const expenseCount = currentMonthTx.filter((t) => t.type !== 'Masuk').length;

  return (
    <div style={{ width: '100%' }}>
      {/* BAND 1: Full-Width Context Header + Month Navigator + Quick Actions */}
      <UnifiedDashboardHeader
        user={user}
        isYasmeen={false}
        onOpenEditProfile={onOpenEditProfile}
        onOpenBalanceModal={() => {
          setMoneyInput(Math.round(adziima.totalBalanceIdr).toString());
          setBalanceMode('current_balance');
          setIsEditingMoney(true);
        }}
        onOpenCloudModal={onOpenCloudModal}
        onExportExcel={handleExportExcel}
        onOpenAdd={onOpenAdd}
        transactionCount={currentMonthTx.length}
      />

      {/* Flat Onboarding Strip if initial balance is 0 */}
      {adziima.initialIdr === 0 && !isEditingMoney && (
        <div className="hq-alert-strip info">
          <span>
            Nominal saldo awal Adziima belum diatur. Isi sesuai saldo rekening atau dompetmu saat ini.
          </span>
          <button
            type="button"
            onClick={() => {
              setMoneyInput('');
              setBalanceMode('current_balance');
              setIsEditingMoney(true);
            }}
            className="hq-btn hq-btn-blue"
          >
            <Plus size={14} />
            <span>Isi Saldo Sekarang</span>
          </button>
        </div>
      )}

      {/* BAND 2: Edge-to-Edge 3-Column KPI Metric Strip (Hairline Divided) */}
      <section className="hq-kpi-strip cols-3">
        <div className="hq-kpi-cell tint-blue">
          <div className="hq-kpi-label">
            <span style={{ color: '#0284c7' }}>Sisa Saldo Kas</span>
            <Wallet size={15} color="#0284c7" />
          </div>
          <div className="hq-kpi-value" style={{ color: '#0284c7' }}>
            {formatIdr(adziima.totalBalanceIdr)}
          </div>
          <div className="hq-kpi-meta">
            <span>Total modal: {formatIdr(adziima.totalInflowIdr)}</span>
            <span className="hq-badge hq-badge-blue">Aktif</span>
          </div>
        </div>

        <div className="hq-kpi-cell tint-rose">
          <div className="hq-kpi-label">
            <span style={{ color: '#e11d48' }}>Pengeluaran Bulan Ini</span>
            <TrendingDown size={15} color="#e11d48" />
          </div>
          <div className="hq-kpi-value" style={{ color: '#e11d48' }}>
            {formatIdr(adziima.totalOutflowIdr)}
          </div>
          <div className="hq-kpi-meta">
            <span>{expenseCount} transaksi tercatat</span>
            <span className="hq-badge hq-badge-red">{monthLabel}</span>
          </div>
        </div>

        <div className="hq-kpi-cell tint-orange">
          <div className="hq-kpi-label">
            <span style={{ color: '#ea580c' }}>Disisihkan ke Pos</span>
            <Sliders size={15} color="#ea580c" />
          </div>
          <div className="hq-kpi-value" style={{ color: '#ea580c' }}>
            {formatIdr(adziima.totalAllBudgetIdr)}
          </div>
          <div className="hq-kpi-meta">
            <span>Sisa pagu: {formatIdr(adziima.remainingAllBudgetIdr)}</span>
            <span className="hq-badge hq-badge-amber">Target Pos</span>
          </div>
        </div>
      </section>

      {/* BAND 3: Pos Pengeluaran (Hairline Matrix - Zero Floating Cards) */}
      <section>
        <div className="hq-section-header">
          <div>
            <h2 className="hq-section-title">Pos Pengeluaran Adziima ({monthLabel})</h2>
            <p className="hq-section-subtitle">
              Target alokasi bulanan dalam Rupiah ({currentCategories.length} pos aktif)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsManageCatOpen(true)}
            className="hq-btn"
            title="Tambah atau edit pos pengeluaran"
          >
            <Sliders size={14} color="#0284c7" />
            <span>Kelola / Tambah Pos</span>
          </button>
        </div>

        <div className="hq-matrix-grid">
          {currentCategories.map((cat) => {
            const spending = adziima.spending[cat.id] || { totalIdr: 0, count: 0 };
            const spent = spending.totalIdr;
            const budget = cat.budgetIdr || 0;
            const percent =
              budget > 0
                ? Math.min(100, Math.round((spent / budget) * 100))
                : spent > 0
                ? 100
                : 0;
            const isOver = budget > 0 && spent > budget;
            const isWarning = percent >= 50 && !isOver;
            const barColor = isOver ? '#e11d48' : isWarning ? '#f59e0b' : '#0284c7';

            return (
              <div key={cat.id} className="hq-matrix-cell">
                <div className="hq-cat-head">
                  <div className="hq-cat-title-wrap">
                    <div
                      className="hq-cat-icon"
                      style={{
                        background: `${cat.color || '#0284c7'}18`,
                        borderColor: `${cat.color || '#0284c7'}40`
                      }}
                    >
                      <CategoryIcon name={cat.iconName} size={16} color={cat.color || '#0284c7'} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span className="hq-cat-name">{cat.name}</span>
                        {isOver && <span className="hq-badge hq-badge-red">Over</span>}
                        {isWarning && <span className="hq-badge hq-badge-amber">50%+</span>}
                      </div>
                      {cat.note && <div className="hq-cat-note">{cat.note}</div>}
                    </div>
                  </div>

                  {editingCatId === cat.id ? (
                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                      <input
                        type="number"
                        value={catBudgetInput}
                        onChange={(e) => setCatBudgetInput(e.target.value)}
                        className="hq-input-inline"
                        style={{ width: '96px', padding: '0.25rem 0.45rem', fontSize: '0.78rem' }}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveCatBudget(cat.id)}
                        className="hq-btn hq-btn-blue"
                        style={{ padding: '0.28rem 0.5rem' }}
                      >
                        <Check size={13} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartEditBudget(cat)}
                      className="hq-btn-icon"
                      title="Atur target budget pos ini"
                    >
                      <Edit2 size={13} />
                    </button>
                  )}
                </div>

                <div>
                  <div className="hq-progress-track">
                    <div
                      className="hq-progress-fill"
                      style={{ width: `${percent}%`, background: barColor }}
                    />
                  </div>

                  <div className="hq-cat-nums" style={{ marginTop: '0.45rem' }}>
                    <span>
                      Terpakai:{' '}
                      <strong style={{ color: isOver ? '#e11d48' : 'var(--text-main)' }}>
                        {formatIdr(spent)}
                      </strong>
                    </span>
                    <span>Pagu: {budget > 0 ? formatIdr(budget) : 'Belum diatur'}</span>
                  </div>
                </div>

                <div className="hq-cat-foot">
                  <span style={{ color: isOver ? '#e11d48' : 'var(--text-muted)', fontWeight: isOver ? 700 : 500 }}>
                    {isOver ? `Lebih ${formatIdr(spent - budget)}` : `Sisa ${formatIdr(budget - spent)}`}
                  </span>
                  <span style={{ color: 'var(--text-dim)' }}>{percent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* BAND 4: Full-Width Transaction Ledger */}
      <section>
        <div className="hq-section-header">
          <div>
            <h2 className="hq-section-title">Riwayat Transaksi ({monthLabel})</h2>
            <p className="hq-section-subtitle">
              {filteredTransactions.length} dari {currentMonthTx.length} catatan ditampilkan
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="hq-btn"
              onClick={() => handleExportExcel(selectedMonth)}
              title={`Unduh Rekapan Excel Bulan ${monthLabel}`}
            >
              <Download size={14} />
              <span>Unduh XLS</span>
            </button>

            <a
              href={
                googleDriveUrl ||
                'https://drive.google.com/drive/folders/1G5Mm3lnpdx_4T3QYqODurGBZdK1Kv5CX?usp=sharing'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="hq-btn"
              title="Buka Folder Google Drive"
            >
              <FolderUp size={14} color="#059669" />
              <span>Buka Drive</span>
            </a>
          </div>
        </div>

        {/* Inline Edge-to-Edge Filter Bar */}
        <div className="hq-filter-bar">
          <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: '420px' }}>
            <Search
              size={14}
              color="var(--text-dim)"
              style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Cari transaksi atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hq-input-inline"
              style={{ width: '100%', paddingLeft: '2.1rem' }}
            />
          </div>

          <select
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
            className="hq-input-inline"
            style={{ minWidth: '170px', cursor: 'pointer' }}
          >
            <option value="all">Semua Pos</option>
            {currentCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Flat Ledger Rows */}
        {filteredTransactions.length === 0 ? (
          <div className="hq-empty">
            <p style={{ fontWeight: 700, color: 'var(--text-main)' }}>
              Belum ada transaksi di bulan {monthLabel}
            </p>
            <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
              Klik tombol &quot;Catat Pengeluaran&quot; atau &quot;Pemasukan&quot; di atas untuk mencatat transaksi.
            </p>
          </div>
        ) : (
          <div className="hq-ledger">
            {filteredTransactions.map((tx) => {
              const cat = currentCategories.find((c) => c.id === tx.category) || {
                name: tx.category,
                iconName: 'Tag',
                color: '#64748b'
              };
              const isIncome = tx.type === 'Masuk';

              return (
                <div key={tx.id} className="hq-ledger-row">
                  <div className="hq-ledger-left">
                    <div
                      className="hq-ledger-icon"
                      style={{
                        background: isIncome ? '#ecfdf5' : 'var(--bg-surface)',
                        borderColor: isIncome ? '#a7f3d0' : 'var(--border-subtle)'
                      }}
                    >
                      <CategoryIcon
                        name={isIncome ? 'TrendingUp' : cat.iconName}
                        size={16}
                        color={isIncome ? '#059669' : cat.color}
                      />
                    </div>

                    <div className="hq-ledger-body">
                      <div className="hq-ledger-title">
                        <span>{tx.title}</span>
                        {isIncome && <span className="hq-badge hq-badge-green">Pemasukan</span>}
                      </div>

                      <div className="hq-ledger-meta">
                        <span>{formatDateIndo(tx.date)}</span>
                        {!isIncome && (
                          <>
                            <span>·</span>
                            <span>{cat.name}</span>
                          </>
                        )}
                        {tx.paymentMethod && (
                          <>
                            <span>·</span>
                            <span style={{ fontWeight: 600, color: isIncome ? '#059669' : 'var(--text-secondary)' }}>
                              {isIncome ? `Masuk ke ${tx.paymentMethod}` : tx.paymentMethod}
                            </span>
                          </>
                        )}
                        {tx.notes && (
                          <>
                            <span>·</span>
                            <span style={{ fontStyle: 'italic' }}>&quot;{tx.notes}&quot;</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="hq-ledger-right">
                    <div
                      className="hq-ledger-amount"
                      style={{ color: isIncome ? '#059669' : '#e11d48' }}
                    >
                      {isIncome ? `+${formatIdr(tx.amountIdr)}` : `-${formatIdr(tx.amountIdr)}`}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                      <button
                        type="button"
                        onClick={() => onEditTx(tx)}
                        className="hq-btn-icon"
                        title="Edit Transaksi"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTransaction('adziima', tx.id)}
                        className="hq-btn-icon danger"
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
      </section>

      {/* Modal Editor for Total Money */}
      {isEditingMoney && (
        <div className="modal-overlay" onClick={() => setIsEditingMoney(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>Atur Saldo Adziima</h3>
              <button className="modal-close-btn" onClick={() => setIsEditingMoney(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveMoney}>
              <div className="form-group">
                <label className="form-label">Pilih Mode Pengaturan</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setBalanceMode('current_balance')}
                    className={`hq-btn ${balanceMode === 'current_balance' ? 'hq-btn-blue' : ''}`}
                    style={{ flexDirection: 'column', gap: '0.1rem', padding: '0.6rem 0.5rem' }}
                  >
                    <span>Saldo Kas Sekarang</span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.85, fontWeight: 500 }}>Uang Riil Saat Ini</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBalanceMode('initial_fund')}
                    className={`hq-btn ${balanceMode === 'initial_fund' ? 'hq-btn-blue' : ''}`}
                    style={{ flexDirection: 'column', gap: '0.1rem', padding: '0.6rem 0.5rem' }}
                  >
                    <span>Modal Awal Bulan</span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.85, fontWeight: 500 }}>Sebelum Belanja</span>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {balanceMode === 'current_balance'
                    ? 'Uang Kas / Rekening Saat Ini (Rp) *'
                    : 'Modal Awal Adziima di Awal Bulan (Rp) *'}
                </label>
                <input
                  type="number"
                  className="form-input"
                  style={{ fontSize: '1.15rem', fontWeight: 800 }}
                  placeholder="Contoh: 2700000"
                  value={moneyInput}
                  onChange={(e) => setMoneyInput(e.target.value)}
                  autoFocus
                  required
                />
                <div style={{ fontSize: '0.78rem', color: '#0284c7', marginTop: '0.3rem', fontWeight: 700 }}>
                  Terbaca: {formatIdr(parseFloat(moneyInput) || 0)}
                </div>
              </div>

              <div
                style={{
                  padding: '0.7rem 0.85rem',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-line)',
                  fontSize: '0.76rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem',
                  lineHeight: 1.45
                }}
              >
                {balanceMode === 'current_balance' ? (
                  <>
                    <strong>Sisa Saldo Kas</strong> akan langsung menjadi{' '}
                    <strong>{formatIdr(parseFloat(moneyInput) || 0)}</strong>. Seluruh riwayat{' '}
                    {currentMonthTx.length} transaksi bulan {monthLabel} tetap tersimpan aman.
                  </>
                ) : (
                  <>
                    Nominal ini dijadikan patokan modal awal bulan {monthLabel}, lalu dikurangi pengeluaran bulan ini.
                  </>
                )}
              </div>

              <button type="submit" className="submit-btn blue">
                <Check size={16} />
                <span>Simpan Saldo</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manage Categories Modal */}
      <ManageCategoriesModal
        isOpen={isManageCatOpen}
        onClose={() => setIsManageCatOpen(false)}
        userId="adziima"
      />
    </div>
  );
}
