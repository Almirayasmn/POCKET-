import React from 'react';
import { usePocket } from '../context/PocketContext';
import { MONTH_OPTIONS } from '../utils/formatters';
import { Moon, Sun, ArrowRightLeft, Settings, Download, RotateCcw, Heart } from 'lucide-react';

export default function Navbar({ onOpenSettings, onOpenAdd }) {
  const {
    users,
    activeUserView,
    setActiveUserView,
    currencyMode,
    setCurrencyMode,
    theme,
    toggleTheme,
    selectedMonth,
    setSelectedMonth,
    exchangeRate,
    exportCSV,
    resetAllData
  } = usePocket();

  const nextCurrencyMode = () => {
    if (currencyMode === 'dual') setCurrencyMode('cny');
    else if (currencyMode === 'cny') setCurrencyMode('idr');
    else setCurrencyMode('dual');
  };

  const currencyLabel = {
    dual: '¥ CNY + Rp IDR',
    cny: '¥ Yuan Only',
    idr: 'Rp Rupiah Only'
  }[currencyMode];

  return (
    <header className="navbar glass-panel">
      {/* Brand & Couple Info */}
      <div className="navbar-brand">
        <div className="brand-icon">
          <Heart size={24} color="#fff" fill="#fff" />
        </div>
        <div className="brand-info">
          <h1>
            Pocket Duo <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>🌸 & 🦊</span>
          </h1>
          <p>{users.yasmeen?.name || 'Yasmeen'} & {users.cowoku?.name || 'Cowoku'} · Money & Jajan Tracker</p>
        </div>
      </div>

      {/* Middle: Couple View Selector */}
      <div className="user-pills" role="tablist" aria-label="Pilih Tampilan Pengguna">
        <button
          className={`user-pill ${activeUserView === 'all' ? 'active' : ''}`}
          onClick={() => setActiveUserView('all')}
        >
          <span>👥 Berdua</span>
        </button>
        <button
          className={`user-pill yasmeen ${activeUserView === 'yasmeen' ? 'active' : ''}`}
          onClick={() => setActiveUserView('yasmeen')}
        >
          <span>🌸 {users.yasmeen?.name || 'Yasmeen'}</span>
        </button>
        <button
          className={`user-pill cowoku ${activeUserView === 'cowoku' ? 'active' : ''}`}
          onClick={() => setActiveUserView('cowoku')}
        >
          <span>🦊 {users.cowoku?.name || 'Cowoku'}</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="navbar-controls">
        {/* Month Selector */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="btn-control"
          style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--card-border)' }}
        >
          {MONTH_OPTIONS.map(m => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {/* Currency Switcher */}
        <button
          className="btn-control currency-badge"
          onClick={nextCurrencyMode}
          title="Klik untuk ganti mode mata uang (Dual / CNY / IDR)"
        >
          <ArrowRightLeft size={13} />
          <span>{currencyLabel}</span>
        </button>

        {/* Exchange Rate Indicator */}
        <button
          className="btn-control"
          onClick={onOpenSettings}
          title="Klik untuk ubah kurs atau saldo awal"
          style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
        >
          1¥ = Rp {exchangeRate.toLocaleString('id-ID')}
        </button>

        {/* Export Button */}
        <button
          className="btn-control"
          onClick={exportCSV}
          title="Download CSV (format Google Sheet)"
        >
          <Download size={15} />
        </button>

        {/* Theme Toggle */}
        <button
          className="btn-control"
          onClick={toggleTheme}
          title="Ganti Tema Gelap / Terang"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Settings Modal Button */}
        <button
          className="btn-control"
          onClick={onOpenSettings}
          title="Pengaturan Saldo & Budget"
        >
          <Settings size={15} />
        </button>
      </div>
    </header>
  );
}
