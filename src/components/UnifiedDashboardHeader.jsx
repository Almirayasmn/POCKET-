import React from 'react';
import { usePocket } from '../context/PocketContext';
import UserAvatar from './UserAvatar';
import { ALL_MONTH_OPTIONS } from './MonthNavigator';
import {
  ArrowLeft,
  Settings,
  Coins,
  Cloud,
  RefreshCw,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function UnifiedDashboardHeader({
  user = {},
  isYasmeen = false,
  isChina = false,
  onOpenEditProfile,
  onOpenBalanceModal,
  onOpenCloudModal,
  onExportExcel,
  currencyToggle = null,
  transactionCount = 0
}) {
  const {
    setActiveView,
    selectedMonth,
    setSelectedMonth,
    isCloudConnected,
    isCloudSyncing
  } = usePocket();

  const currentIndex = ALL_MONTH_OPTIONS.findIndex(m => m.value === selectedMonth);
  const monthLabel = ALL_MONTH_OPTIONS.find(m => m.value === selectedMonth)?.label || selectedMonth;

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

  const themeClass = isYasmeen ? 'theme-yasmeen' : 'theme-adziima';
  const accentColor = isYasmeen ? '#db2777' : '#0284c7';
  const tagBg = isYasmeen ? '#fce7f3' : '#e0f2fe';
  const tagText = isYasmeen ? '#9d174d' : '#0369a1';

  return (
    <header className={`unified-header-card ${themeClass}`}>
      {/* 1. TOP ROW: Identity, Navigation, and Action Buttons */}
      <div className="udh-top-row">
        {/* Left: Back button + User Identity */}
        <div className="udh-left-cluster">
          <button
            type="button"
            className="udh-btn-back"
            onClick={() => setActiveView('landing')}
            title="Kembali ke Halaman Beranda"
          >
            <ArrowLeft size={16} />
            <span>Halaman Utama</span>
          </button>

          <div className="udh-divider-v" />

          <div
            className="udh-user-badge"
            onClick={onOpenEditProfile}
            title="Klik untuk ubah foto atau data profil"
          >
            <div className="udh-avatar-ring">
              <UserAvatar user={user} size={44} />
            </div>

            <div className="udh-user-info">
              <div className="udh-user-name-row">
                <span className="udh-user-name">
                  {user.name || (isYasmeen ? 'Yasmeen Almira' : 'Adziima')}{' '}
                  <span className="handwriting-accent" style={{ color: isYasmeen ? '#db2777' : '#0284c7', fontSize: '1.15rem', marginLeft: '0.2rem' }}>
                    {isYasmeen ? 'di China' : 'di Indo'}
                  </span>
                </span>
                <span className="udh-country-pill" style={{ background: tagBg, color: tagText }}>
                  {isYasmeen ? (isChina ? '🇨🇳 Nanning' : '🇮🇩 Indo') : '🇮🇩 Indonesia'}
                </span>
                <span className="udh-settings-btn" title="Pengaturan Profil">
                  <Settings size={13} />
                </span>
              </div>

              <div className="udh-user-subtitle">
                {isYasmeen
                  ? (isChina ? 'China · Yuan (¥) & Rupiah (Rp)' : 'Indonesia · 100% Rupiah (Rp)')
                  : 'Indonesia · 100% Rupiah (Rp)'}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="udh-right-cluster">
          {/* Optional Currency Switcher for Yasmeen */}
          {currencyToggle}

          {/* Atur Saldo Button */}
          {onOpenBalanceModal && (
            <button
              type="button"
              className="udh-btn-action udh-btn-balance"
              onClick={onOpenBalanceModal}
              title="Atur Saldo Kas Awal / Modal"
            >
              <Coins size={15} />
              <span>Atur Saldo</span>
            </button>
          )}

          {/* Cloud Sync Button */}
          {onOpenCloudModal && (
            <button
              type="button"
              className={`udh-btn-action udh-btn-cloud ${isCloudConnected ? 'connected' : ''}`}
              onClick={onOpenCloudModal}
              title="Sinkronisasi Cloud Supabase Multi-Device"
            >
              {isCloudSyncing ? (
                <RefreshCw size={15} className="animate-spin text-emerald-600" />
              ) : (
                <Cloud size={15} />
              )}
              <span>{isCloudConnected ? 'Cloud Aktif' : 'Sync Cloud'}</span>
            </button>
          )}

          {/* Unduh Excel Button */}
          {onExportExcel && (
            <button
              type="button"
              className="udh-btn-action udh-btn-excel"
              onClick={onExportExcel}
              title={`Unduh Laporan Keuangan Bulan ${monthLabel} (.xls)`}
            >
              <Download size={15} />
              <span>Unduh XLS</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. BOTTOM TOOLBAR: Seamless Integrated Month Navigator & Summary Stats */}
      <div className="udh-bottom-toolbar">
        {/* Left: Modern Month Navigator Pill */}
        <div className="udh-month-navigator">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={currentIndex <= 0}
            className="udh-month-btn"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="udh-month-picker-label">
            <Calendar size={15} color={accentColor} />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="udh-month-select"
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
            className="udh-month-btn"
            title="Bulan Berikutnya"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Right: Period Status & Transaction Count Badges */}
        <div className="udh-stats-badges">
          <div className="udh-badge udh-badge-period">
            <span className="udh-pulse-dot" />
            <span>Periode Aktif: <strong>{monthLabel}</strong></span>
          </div>

          <div className="udh-badge udh-badge-count">
            <span>📝 <strong>{transactionCount}</strong> Transaksi</span>
          </div>
        </div>
      </div>
    </header>
  );
}
