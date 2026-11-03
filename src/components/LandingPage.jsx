import React, { useState } from 'react';
import { usePocket } from '../context/PocketContext';
import { formatIdr, formatCny } from '../utils/formatters';
import UserAvatar from './UserAvatar';
import {
  DEFAULT_BUSINESS_DATA,
  BUSINESS_TYPES
} from '../data/initialData';
import {
  Heart,
  TrendingUp,
  Coins,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Lock,
  KeyRound,
  Cloud,
  FolderUp,
  ShoppingBag,
  Sparkles,
  Settings
} from 'lucide-react';

export default function LandingPage({
  onOpenEditProfile,
  onOpenCloudModal,
  onOpenAdd,
  onOpenChangePin,
  onLockApp
}) {
  const {
    activeView,
    setActiveView,
    users,
    calculations,
    yasmeenCurrencyView,
    exchangeRate,
    isCloudConnected,
    isCloudSyncing,
    selectedMonth,
    setSelectedMonth,
    yasmeenTransactions,
    adziimaTransactions,
    googleDriveUrl,
    businessCalculations
  } = usePocket();

  const bizCalc = businessCalculations || {};
  const { yasmeen, adziima, gold, actualBalances = {} } = calculations;
  const isYasmeenIdr = yasmeenCurrencyView === 'IDR';

  // Live actual balances per hari ini
  const yasmeenBalanceIdr = actualBalances.yasmeenBalanceIdr ?? (yasmeen?.totalBalanceIdr || 0);
  const yasmeenBalanceCny = actualBalances.yasmeenBalanceCny ?? (yasmeen?.totalBalanceCny || 0);
  const adziimaBalanceIdr = actualBalances.adziimaBalanceIdr ?? (adziima?.totalBalanceIdr || 0);
  const goldAssetValueIdr = actualBalances.goldAssetValueIdr ?? (gold?.currentAssetValueIdr || 0);
  const totalJointWealthIdr = actualBalances.totalJointWealthIdr ?? (yasmeenBalanceIdr + adziimaBalanceIdr + goldAssetValueIdr);

  const yasmeenPercent = actualBalances.yasmeenPercent ?? 33;
  const adziimaPercent = actualBalances.adziimaPercent ?? 33;
  const goldPercent = actualBalances.goldPercent ?? 34;

  const goldGrams = gold?.totalGrams || 0;
  const goldKeping = gold?.totalKeping || 0;
  const targetGrams = gold?.targetGrams || 25;
  const goldProgress = targetGrams > 0 ? Math.min(100, Math.round((goldGrams / targetGrams) * 100)) : 0;
  const goldPricePerGram = gold?.pricePerGram || 2510000;
  const goldBuybackPerGram = gold?.buybackPerGram || 2363000;

  return (
    <div style={{ padding: '0.4rem 0.6rem 0.6rem', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
      {/* 1. TOP CONTROLS & BRAND ROW */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div className="landing-couple-pill">
          <Heart size={14} color="#ec4899" fill="#ec4899" style={{ animation: 'pulseHeart 2.5s infinite' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#be185d', letterSpacing: '0.01em' }}>
            Pocket Duo · Yasmeen & Adziima
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <button
            onClick={onOpenCloudModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: isCloudConnected ? '#f0fdf4' : '#ffffff',
              border: isCloudConnected ? '1.5px solid #86efac' : '1.5px dashed #cbd5e1',
              color: isCloudConnected ? '#166534' : '#64748b',
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
            title="Status sinkronisasi cloud antar HP"
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: isCloudConnected ? '#22c55e' : '#f59e0b', display: 'inline-block' }} />
            <span>{isCloudConnected ? 'Cloud' : 'Sync'}</span>
          </button>

          <button
            onClick={onOpenChangePin}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: '#ffffff',
              border: '1.5px solid #fbcfe8',
              color: '#be185d',
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
            title="Ubah PIN keamanan bersama"
          >
            <KeyRound size={12} color="#db2777" />
            <span>PIN</span>
          </button>

          <a
            href={googleDriveUrl || 'https://drive.google.com/drive/folders/1G5Mm3lnpdx_4T3QYqODurGBZdK1Kv5CX?usp=sharing'}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: '#ecfdf5',
              border: '1.5px solid #a7f3d0',
              color: '#047857',
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              textDecoration: 'none'
            }}
            title="Buka Folder Google Drive Rekapan Bulanan"
          >
            <FolderUp size={12} color="#059669" />
            <span>Drive</span>
          </a>

          <button
            onClick={onLockApp}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              color: '#64748b',
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
            title="Kunci catatan keuangan sekarang"
          >
            <Lock size={12} color="#64748b" />
            <span>Kunci</span>
          </button>
        </div>
      </div>

      {/* 2. COMPACT JOINT WEALTH BANNER & 4 WEALTH CHIPS */}
      <div className="joint-wealth-banner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.65rem' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={13} color="#d97706" />
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#be185d', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Akumulasi Aset & Tabungan Berdua
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.15, marginTop: '0.1rem' }}>
              {formatIdr(totalJointWealthIdr)}
            </div>
          </div>

          {/* Visual Distribution Bar */}
          <div style={{ flex: '1 1 260px', maxWidth: '440px' }}>
            <div className="wealth-distribution-bar" style={{ height: '9px' }}>
              <div
                className="wealth-bar-segment pink"
                style={{ width: `${Math.max(5, yasmeenPercent)}%` }}
                title={`Yasmeen Almira: ${formatIdr(yasmeenBalanceIdr)} (${yasmeenPercent}%)`}
              />
              <div
                className="wealth-bar-segment blue"
                style={{ width: `${Math.max(5, adziimaPercent)}%` }}
                title={`Muhammad Mulkan Adziima: ${formatIdr(adziimaBalanceIdr)} (${adziimaPercent}%)`}
              />
              <div
                className="wealth-bar-segment gold"
                style={{ width: `${Math.max(5, goldPercent)}%` }}
                title={`Aset Emas Galeri 24: ${formatIdr(goldAssetValueIdr)} (${goldPercent}%)`}
              />
            </div>
            <div className="wealth-legend-row" style={{ marginTop: '0.25rem', fontSize: '0.7rem', gap: '0.75rem' }}>
              <span style={{ color: '#be185d' }}>🌸 Yasmeen ({yasmeenPercent}%)</span>
              <span style={{ color: '#0369a1' }}>🌊 Adziima ({adziimaPercent}%)</span>
              <span style={{ color: '#92400e' }}>🪙 Emas ({goldPercent}%)</span>
            </div>
          </div>
        </div>

        {/* 3 Symmetrical Wealth Chips (Yasmeen, Adziima, Emas 24K) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.45rem',
            width: '100%',
            marginTop: '0.35rem'
          }}
        >
          <div
            onClick={() => setActiveView('yasmeen')}
            style={{
              background: '#fdf2f8',
              padding: '0.45rem 0.35rem',
              borderRadius: '12px',
              border: '1.5px solid #fbcfe8',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.15s ease'
            }}
            title="Klik untuk buka catatan Yasmeen"
          >
            <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#db2777', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              🌸 Yasmeen
            </div>
            <div style={{ fontSize: 'clamp(0.72rem, 3.3vw, 0.95rem)', fontWeight: 900, color: '#9d174d', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {formatIdr(yasmeenBalanceIdr)}
            </div>
          </div>

          <div
            onClick={() => setActiveView('adziima')}
            style={{
              background: '#f0f9ff',
              padding: '0.45rem 0.35rem',
              borderRadius: '12px',
              border: '1.5px solid #bae6fd',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.15s ease'
            }}
            title="Klik untuk buka catatan Adziima"
          >
            <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              🌊 Adziima
            </div>
            <div style={{ fontSize: 'clamp(0.72rem, 3.3vw, 0.95rem)', fontWeight: 900, color: '#0369a1', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {formatIdr(adziimaBalanceIdr)}
            </div>
          </div>

          <div
            onClick={() => setActiveView('gold')}
            style={{
              background: '#fefce8',
              padding: '0.45rem 0.35rem',
              borderRadius: '12px',
              border: '1.5px solid #fde047',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.15s ease'
            }}
            title="Klik untuk buka portofolio emas"
          >
            <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              🪙 Emas 24K
            </div>
            <div style={{ fontSize: 'clamp(0.72rem, 3.3vw, 0.95rem)', fontWeight: 900, color: '#92400e', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {formatIdr(goldAssetValueIdr)}
            </div>
          </div>
        </div>
      </div>

      {/* 3. FOUR FIT-SCREEN INTERACTIVE CARDS */}
      <div className="profile-select-grid">
        {/* Card 1: Yasmeen */}
        <div className="profile-select-card pink">
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.45rem' }}>
              <div style={{ position: 'relative' }}>
                <UserAvatar
                  user={users.yasmeen}
                  size={64}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEditProfile('yasmeen');
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '1.5px solid #fbcfe8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.06)'
                  }}
                >
                  🌸
                </span>
              </div>
            </div>

            <div className="profile-name" style={{ fontSize: '1.05rem', fontWeight: 900, color: '#831843' }}>
              {users.yasmeen?.name || 'Yasmeen Almira'}
            </div>
            <div className="profile-desc" style={{ fontSize: '0.74rem', minHeight: '18px', color: '#9d174d' }}>
              {users.yasmeen?.bio || 'Catatan Keuangan Pribadi'}
            </div>
          </div>

          <div>
            <div className="profile-amount-box" style={{ border: '1.5px solid #fbcfe8' }}>
              <div style={{ fontSize: '0.66rem', color: '#9d174d', fontWeight: 800, letterSpacing: '0.04em' }}>
                TOTAL UANG AKTIF (AKTUAL HARI INI)
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: '#be185d', marginTop: '0.1rem' }}>
                {isYasmeenIdr ? formatIdr(yasmeenBalanceIdr) : formatCny(yasmeenBalanceCny)}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#db2777', marginTop: '0.15rem', fontWeight: 700 }}>
                ≈ {isYasmeenIdr ? formatCny(yasmeenBalanceCny) : formatIdr(yasmeenBalanceIdr)}
              </div>

              {yasmeen?.dailyAverageSafeCny !== undefined && (
                <div
                  style={{
                    marginTop: '0.35rem',
                    paddingTop: '0.35rem',
                    borderTop: '1px dashed #fbcfe8',
                    fontSize: '0.7rem',
                    color: '#9d174d',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <span>🛡️ Jatah aman:</span>
                  <span style={{ fontWeight: 800 }}>
                    {formatCny(yasmeen.dailyAverageSafeCny)} / hari
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                className="btn-enter-profile btn-enter-pink"
                onClick={() => {
                  if (setSelectedMonth) setSelectedMonth('2026-11');
                  setActiveView('yasmeen');
                }}
                style={{ flex: 1, padding: '0.58rem 0.75rem', fontSize: '0.8rem' }}
              >
                <span>Buka Catatan</span>
                <ArrowRight size={15} />
              </button>
              <button
                className="btn-back-home"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditProfile('yasmeen');
                }}
                title="Edit Profil & Foto"
                style={{ padding: '0.58rem 0.7rem', background: '#ffffff', borderColor: '#fbcfe8', color: '#db2777', borderRadius: '12px' }}
              >
                <Settings size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Adziima */}
        <div className="profile-select-card blue">
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.45rem' }}>
              <div style={{ position: 'relative' }}>
                <UserAvatar
                  user={users.adziima}
                  size={64}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEditProfile('adziima');
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '1.5px solid #bae6fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.06)'
                  }}
                >
                  🌊
                </span>
              </div>
            </div>

            <div className="profile-name" style={{ fontSize: '1.05rem', fontWeight: 900, color: '#075985' }}>
              {users.adziima?.name || 'Muhammad Mulkan Adziima'}
            </div>
            <div className="profile-desc" style={{ fontSize: '0.74rem', minHeight: '18px', color: '#0369a1' }}>
              {users.adziima?.bio || 'Catatan Keuangan'}
            </div>
          </div>

          <div>
            <div className="profile-amount-box" style={{ border: '1.5px solid #bae6fd' }}>
              <div style={{ fontSize: '0.66rem', color: '#0369a1', fontWeight: 800, letterSpacing: '0.04em' }}>
                TOTAL UANG AKTIF (AKTUAL HARI INI)
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: '#0284c7', marginTop: '0.1rem' }}>
                {(users.adziima?.initialFundIdr > 0 || (adziimaTransactions && adziimaTransactions.length > 0) || adziimaBalanceIdr > 0) ? formatIdr(adziimaBalanceIdr) : 'Atur Duit Sendiri'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#0369a1', marginTop: '0.15rem', fontWeight: 700 }}>
                {(users.adziima?.initialFundIdr > 0 || (adziimaTransactions && adziimaTransactions.length > 0) || adziimaBalanceIdr > 0) ? 'Tersedia & Terkendali' : 'Klik untuk mulai'}
              </div>

              {adziima?.dailyAverageSafeIdr !== undefined && (
                <div
                  style={{
                    marginTop: '0.35rem',
                    paddingTop: '0.35rem',
                    borderTop: '1px dashed #bae6fd',
                    fontSize: '0.7rem',
                    color: '#0369a1',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <span>🛡️ Jatah aman:</span>
                  <span style={{ fontWeight: 800 }}>
                    {formatIdr(adziima.dailyAverageSafeIdr)} / hari
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                className="btn-enter-profile btn-enter-blue"
                onClick={() => {
                  if (setSelectedMonth) setSelectedMonth('2026-11');
                  setActiveView('adziima');
                }}
                style={{ flex: 1, padding: '0.58rem 0.75rem', fontSize: '0.8rem' }}
              >
                <span>Buka Catatan</span>
                <ArrowRight size={15} />
              </button>
              <button
                className="btn-back-home"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditProfile('adziima');
                }}
                title="Edit Profil & Foto"
                style={{ padding: '0.58rem 0.7rem', background: '#ffffff', borderColor: '#bae6fd', color: '#0284c7', borderRadius: '12px' }}
              >
                <Settings size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Aset Emas Berdua */}
        <div className="profile-select-card gold">
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.45rem' }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#fef08a',
                    border: '2px solid #f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#b45309',
                    boxShadow: '0 3px 10px rgba(245, 158, 11, 0.15)'
                  }}
                >
                  <Coins size={32} />
                </div>
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '1.5px solid #fde047',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.06)'
                  }}
                >
                  ✨
                </span>
              </div>
            </div>

            <div className="profile-name" style={{ fontSize: '1.05rem', fontWeight: 900, color: '#78350f' }}>
              Aset Emas Berdua
            </div>
            <div className="profile-desc" style={{ fontSize: '0.74rem', minHeight: '18px', color: '#92400e' }}>
              Galeri 24 · Emas Batangan 24K
            </div>
          </div>

          <div>
            <div className="profile-amount-box" style={{ border: '1.5px solid #fde047' }}>
              <div style={{ fontSize: '0.66rem', color: '#92400e', fontWeight: 800, letterSpacing: '0.04em' }}>
                NILAI ASET PASAR KINI
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: '#b45309', marginTop: '0.1rem' }}>
                {goldAssetValueIdr > 0 ? formatIdr(goldAssetValueIdr) : 'Rp 0'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '0.15rem', fontWeight: 700 }}>
                {goldGrams > 0 ? `${goldGrams} gr (${goldKeping} kpg)` : 'Belum ada tersimpan'}
              </div>

              {/* Target Mini Bar */}
              <div style={{ marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px dashed #fde047' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 800, color: '#92400e', marginBottom: '0.2rem' }}>
                  <span>Target 25 Gram</span>
                  <span>{goldGrams}/25 gr ({goldProgress}%)</span>
                </div>
                <div style={{ width: '100%', height: 6, background: '#fef3c7', borderRadius: 99, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${goldProgress}%`,
                      background: '#f59e0b',
                      borderRadius: 99,
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                className="btn-enter-profile btn-enter-gold"
                onClick={() => setActiveView('gold')}
                style={{ flex: 1, padding: '0.58rem 0.75rem', fontSize: '0.8rem' }}
              >
                <span>Portofolio Emas</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Bisnis Berdua */}
        <div className="profile-select-card purple">
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.45rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ede9fe 0%, #fdf2f8 100%)',
                  border: '2px solid #c4b5fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  boxShadow: '0 3px 10px rgba(124, 58, 237, 0.12)'
                }}
              >
                💼
              </div>
            </div>

            <div className="profile-name" style={{ fontSize: '1.05rem', fontWeight: 900, color: '#581c87' }}>
              Bisnis Berdua
            </div>
            <div className="profile-desc" style={{ fontSize: '0.74rem', minHeight: '18px', color: '#6d28d9' }}>
              Kelola Kategori Usaha & HPP Mandiri
            </div>
          </div>

          <div>
            <div className="profile-amount-box" style={{ border: '1.5px solid #d8b4fe', background: '#faf5ff', padding: '0.85rem 0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '96px' }}>
              <div style={{ fontSize: '0.66rem', color: '#6b21a8', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                PORTOFOLIO USAHA BERSAMA
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: '#581c87', marginTop: '0.2rem' }}>
                {bizCalc.projects?.length || 1} Kategori Bisnis Aktif
              </div>
              <div style={{ fontSize: '0.72rem', color: '#7c3aed', marginTop: '0.25rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.35 }}>
                HPP, Ongkir per Kg & Pencatatan Terpisah
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.65rem' }}>
              <button
                className="btn-enter-profile"
                onClick={() => setActiveView('business')}
                style={{
                  flex: 1,
                  background: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.58rem 0.75rem',
                  fontSize: '0.8rem',
                  boxShadow: '0 3px 10px rgba(124, 58, 237, 0.25)'
                }}
              >
                <span>Buka Catatan Bisnis</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. COMPACT BOTTOM TICKER BAR */}
      <div className="landing-ticker-bar" style={{ marginTop: '0.4rem', padding: '0.3rem 0.75rem', fontSize: '0.72rem' }}>
        <div className="ticker-pill-item">
          <span className="ticker-icon">💱</span>
          <span>Kurs: <strong style={{ color: '#be185d' }}>1 CNY = Rp {exchangeRate?.toLocaleString('id-ID') || '2.750'}</strong></span>
        </div>
        <span className="ticker-dot-divider">•</span>
        <div className="ticker-pill-item">
          <span className="ticker-icon">🏆</span>
          <span>Galeri 24: <strong style={{ color: '#b45309' }}>{formatIdr(goldPricePerGram)}/gr</strong></span>
        </div>
        <span className="ticker-dot-divider">•</span>
        <div className="ticker-pill-item">
          <span className="ticker-icon">🔄</span>
          <span>Buyback: <strong style={{ color: '#0369a1' }}>{formatIdr(goldBuybackPerGram)}/gr</strong></span>
        </div>
        <span className="ticker-dot-divider">•</span>
        <div
          className="ticker-pill-item"
          onClick={onOpenCloudModal}
          style={{ cursor: 'pointer' }}
          title="Klik untuk cek status cloud"
        >
          <span className="ticker-icon">☁️</span>
          <span>Cloud: <strong style={{ color: isCloudConnected ? '#15803d' : '#d97706' }}>{isCloudConnected ? 'Aktif' : 'Siap'}</strong></span>
        </div>
      </div>
    </div>
  );
}
