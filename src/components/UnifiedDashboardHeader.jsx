import React from 'react';
import { usePocket } from '../context/PocketContext';
import UserAvatar from './UserAvatar';
import { ALL_MONTH_OPTIONS } from './MonthNavigator';
import {
  Settings,
  Coins,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingUp
} from 'lucide-react';

export default function UnifiedDashboardHeader({
  user = {},
  isYasmeen = false,
  onOpenEditProfile,
  onOpenBalanceModal,
  onExportExcel,
  onOpenAdd,
  transactionCount = 0
}) {
  const { selectedMonth, setSelectedMonth } = usePocket();

  const currentIndex = ALL_MONTH_OPTIONS.findIndex((m) => m.value === selectedMonth);
  const monthLabel =
    ALL_MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label || selectedMonth;

  const handlePrevMonth = () => {
    if (currentIndex > 0) {
      setSelectedMonth(ALL_MONTH_OPTIONS[currentIndex - 1].value);
    }
  };

  const handleNextMonth = () => {
    if (currentIndex < ALL_MONTH_OPTIONS.length - 1) {
      setSelectedMonth(ALL_MONTH_OPTIONS[currentIndex + 1].value);
    }
  };

  const accentColor = isYasmeen ? '#db2777' : '#0284c7';

  return (
    <header className="hq-context-bar">
      {/* Left: User Profile Trigger + Month Navigator */}
      <div className="hq-context-left">
        <div
          className="hq-user-trigger"
          onClick={onOpenEditProfile}
          title="Klik untuk ubah foto atau data profil"
        >
          <UserAvatar user={user} size={40} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: 'var(--text-main)'
                }}
              >
                {user.name || (isYasmeen ? 'Yasmeen Almira' : 'Muhammad Mulkan Adziima')}
              </span>
              <Settings size={13} color="var(--text-dim)" />
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {user.bio || user.status || 'Catatan Keuangan Pribadi'} · {transactionCount} transaksi
            </div>
          </div>
        </div>

        <div className="hq-month-nav">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={currentIndex <= 0}
            className="hq-month-nav-btn"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft size={15} />
          </button>

          <div className="hq-month-select-wrap">
            <Calendar size={14} color={accentColor} />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="hq-month-select"
              aria-label="Pilih bulan"
            >
              {ALL_MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            disabled={currentIndex >= ALL_MONTH_OPTIONS.length - 1}
            className="hq-month-nav-btn"
            title="Bulan Berikutnya"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Right: Clean SaaS Actions */}
      <div className="hq-context-actions">
        {onOpenBalanceModal && (
          <button
            type="button"
            className="hq-btn"
            onClick={onOpenBalanceModal}
            title="Atur Saldo Kas / Modal Awal"
          >
            <Coins size={14} color={accentColor} />
            <span>Atur Saldo</span>
          </button>
        )}

        {onExportExcel && (
          <button
            type="button"
            className="hq-btn"
            onClick={() => onExportExcel(selectedMonth)}
            title={`Unduh Laporan Keuangan Bulan ${monthLabel} (.xls)`}
          >
            <Download size={14} />
            <span>Unduh XLS</span>
          </button>
        )}

        {onOpenAdd && (
          <>
            <button
              type="button"
              className="hq-btn hq-btn-green-soft"
              onClick={() => onOpenAdd('Masuk')}
            >
              <TrendingUp size={14} />
              <span>Pemasukan</span>
            </button>

            <button
              type="button"
              className={`hq-btn ${isYasmeen ? 'hq-btn-pink' : 'hq-btn-blue'}`}
              onClick={() => onOpenAdd('Keluar')}
            >
              <Plus size={15} />
              <span>Catat Pengeluaran</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
