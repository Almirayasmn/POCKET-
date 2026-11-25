import React from 'react';
import { usePocket } from '../context/PocketContext';
import { formatIdr, formatCny, getLocalDateString } from '../utils/formatters';
import UserAvatar from './UserAvatar';
import { Coins, ArrowUpRight, Settings, ShieldCheck } from 'lucide-react';

export default function LandingPage({ onOpenEditProfile, onOpenCloudModal }) {
  const {
    setActiveView,
    users,
    calculations,
    yasmeenCurrencyView,
    exchangeRate,
    isCloudConnected,
    setSelectedMonth,
    adziimaTransactions
  } = usePocket();

  const { yasmeen, adziima, gold, actualBalances = {} } = calculations;
  const isYasmeenIdr = yasmeenCurrencyView === 'IDR';

  const yasmeenBalanceIdr = actualBalances.yasmeenBalanceIdr ?? (yasmeen?.totalBalanceIdr || 0);
  const yasmeenBalanceCny = actualBalances.yasmeenBalanceCny ?? (yasmeen?.totalBalanceCny || 0);
  const adziimaBalanceIdr = actualBalances.adziimaBalanceIdr ?? (adziima?.totalBalanceIdr || 0);
  const goldAssetValueIdr = actualBalances.goldAssetValueIdr ?? (gold?.currentAssetValueIdr || 0);
  const totalJointWealthIdr =
    actualBalances.totalJointWealthIdr ??
    yasmeenBalanceIdr + adziimaBalanceIdr + goldAssetValueIdr;

  const yasmeenPercent = actualBalances.yasmeenPercent ?? 33;
  const adziimaPercent = actualBalances.adziimaPercent ?? 33;
  const goldPercent = actualBalances.goldPercent ?? 34;

  const goldGrams = gold?.totalGrams || 0;
  const goldKeping = gold?.totalKeping || 0;
  const targetGrams = gold?.targetGrams || 25;
  const goldProgress = targetGrams > 0 ? Math.min(100, Math.round((goldGrams / targetGrams) * 100)) : 0;
  const goldPricePerGram = gold?.pricePerGram || 2510000;
  const goldBuybackPerGram = gold?.buybackPerGram || 2363000;

  const openMonthlyAccount = (view) => {
    const curMonth = getLocalDateString().slice(0, 7);
    if (setSelectedMonth && curMonth >= '2026-10') {
      setSelectedMonth(curMonth);
    }
    setActiveView(view);
  };

  const hasAdziimaActivity =
    users.adziima?.initialFundIdr > 0 ||
    (adziimaTransactions && adziimaTransactions.length > 0) ||
    adziimaBalanceIdr > 0;

  return (
    <div style={{ width: '100%' }}>
      {/* BAND 1: Full-Width Hero Net Worth & Distribution */}
      <section className="hq-band">
        <div className="hq-hero-wealth">
          <div>
            <div className="hq-eyebrow">
              <span>Akumulasi Aset & Tabungan Berdua</span>
            </div>
            <div className="hq-hero-amount">{formatIdr(totalJointWealthIdr)}</div>
          </div>

          <div className="hq-wealth-bar-wrap">
            <div className="hq-wealth-bar">
              <div
                className="hq-wealth-seg pink"
                style={{ width: `${Math.max(4, yasmeenPercent)}%` }}
                title={`Yasmeen Almira: ${formatIdr(yasmeenBalanceIdr)} (${yasmeenPercent}%)`}
              />
              <div
                className="hq-wealth-seg blue"
                style={{ width: `${Math.max(4, adziimaPercent)}%` }}
                title={`Muhammad Mulkan Adziima: ${formatIdr(adziimaBalanceIdr)} (${adziimaPercent}%)`}
              />
              <div
                className="hq-wealth-seg gold"
                style={{ width: `${Math.max(4, goldPercent)}%` }}
                title={`Aset Emas Galeri 24: ${formatIdr(goldAssetValueIdr)} (${goldPercent}%)`}
              />
            </div>

            <div className="hq-wealth-legend">
              <span className="hq-legend-item">
                <span className="hq-nav-dot" style={{ background: '#ec4899' }} />
                Yasmeen <strong>{yasmeenPercent}%</strong>
              </span>
              <span className="hq-legend-item">
                <span className="hq-nav-dot" style={{ background: '#0ea5e9' }} />
                Adziima <strong>{adziimaPercent}%</strong>
              </span>
              <span className="hq-legend-item">
                <span className="hq-nav-dot" style={{ background: '#f59e0b' }} />
                Emas 24K <strong>{goldPercent}%</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* BAND 2: Full-Width 3-Column Edge-to-Edge Accounts Strip (No Nested Cards) */}
      <section className="hq-accounts-grid">
        {/* Account 1: Yasmeen */}
        <div
          className="hq-account-col"
          onClick={() => openMonthlyAccount('yasmeen')}
          role="button"
          tabIndex={0}
        >
          <div className="hq-account-top">
            <div className="hq-account-identity">
              <UserAvatar
                user={users.yasmeen}
                size={46}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditProfile('yasmeen');
                }}
              />
              <div>
                <div className="hq-account-name">
                  {users.yasmeen?.name || 'Yasmeen Almira'}
                </div>
                <div className="hq-account-bio">
                  {users.yasmeen?.bio || 'Catatan Keuangan Pribadi'}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="hq-btn-icon"
              onClick={(e) => {
                e.stopPropagation();
                onOpenEditProfile('yasmeen');
              }}
              title="Edit Profil & Foto"
            >
              <Settings size={15} />
            </button>
          </div>

          <div>
            <div className="hq-account-balance-label">Saldo Aktif Aktual</div>
            <div className="hq-account-balance" style={{ color: '#db2777' }}>
              {isYasmeenIdr ? formatIdr(yasmeenBalanceIdr) : formatCny(yasmeenBalanceCny)}
            </div>
            <div className="hq-account-sub">
              ≈ {isYasmeenIdr ? formatCny(yasmeenBalanceCny) : formatIdr(yasmeenBalanceIdr)}
            </div>
          </div>

          <div className="hq-account-foot">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {yasmeen?.dailyAverageSafeCny !== undefined ? (
                <>
                  Jatah aman: <strong>{formatCny(yasmeen.dailyAverageSafeCny)}/hari</strong>
                </>
              ) : (
                `Porsi ${yasmeenPercent}% dari total aset`
              )}
            </span>
            <span className="hq-account-cta" style={{ color: '#db2777' }}>
              <span>Buka Catatan</span>
              <ArrowUpRight size={15} />
            </span>
          </div>
        </div>

        {/* Account 2: Adziima */}
        <div
          className="hq-account-col"
          onClick={() => openMonthlyAccount('adziima')}
          role="button"
          tabIndex={0}
        >
          <div className="hq-account-top">
            <div className="hq-account-identity">
              <UserAvatar
                user={users.adziima}
                size={46}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditProfile('adziima');
                }}
              />
              <div>
                <div className="hq-account-name">
                  {users.adziima?.name || 'Muhammad Mulkan Adziima'}
                </div>
                <div className="hq-account-bio">
                  {users.adziima?.bio || 'Catatan Keuangan Pribadi'}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="hq-btn-icon"
              onClick={(e) => {
                e.stopPropagation();
                onOpenEditProfile('adziima');
              }}
              title="Edit Profil & Foto"
            >
              <Settings size={15} />
            </button>
          </div>

          <div>
            <div className="hq-account-balance-label">Saldo Aktif Aktual</div>
            <div className="hq-account-balance" style={{ color: '#0284c7' }}>
              {hasAdziimaActivity ? formatIdr(adziimaBalanceIdr) : 'Atur Saldo'}
            </div>
            <div className="hq-account-sub">
              {hasAdziimaActivity ? 'Tersedia di rekening / dompet' : 'Klik untuk mulai mencatat'}
            </div>
          </div>

          <div className="hq-account-foot">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {adziima?.dailyAverageSafeIdr !== undefined ? (
                <>
                  Jatah aman: <strong>{formatIdr(adziima.dailyAverageSafeIdr)}/hari</strong>
                </>
              ) : (
                `Porsi ${adziimaPercent}% dari total aset`
              )}
            </span>
            <span className="hq-account-cta" style={{ color: '#0284c7' }}>
              <span>Buka Catatan</span>
              <ArrowUpRight size={15} />
            </span>
          </div>
        </div>

        {/* Account 3: Aset Emas 24K */}
        <div
          className="hq-account-col"
          onClick={() => setActiveView('gold')}
          role="button"
          tabIndex={0}
        >
          <div className="hq-account-top">
            <div className="hq-account-identity">
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  background: '#fffbeb',
                  border: '1.5px solid #fde68a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b45309',
                  flexShrink: 0
                }}
              >
                <Coins size={22} />
              </div>
              <div>
                <div className="hq-account-name">Aset Emas Berdua</div>
                <div className="hq-account-bio">Galeri 24 · Emas Batangan 24K</div>
              </div>
            </div>

            <span className="hq-badge hq-badge-amber">
              <ShieldCheck size={12} />
              999.9
            </span>
          </div>

          <div>
            <div className="hq-account-balance-label">Nilai Aset Pasar Kini</div>
            <div className="hq-account-balance" style={{ color: '#b45309' }}>
              {goldAssetValueIdr > 0 ? formatIdr(goldAssetValueIdr) : 'Rp 0'}
            </div>
            <div className="hq-account-sub">
              {goldGrams > 0 ? `${goldGrams} gr · ${goldKeping} keping` : 'Belum ada tersimpan'}
            </div>

            <div style={{ marginTop: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  marginBottom: '0.3rem'
                }}
              >
                <span>Target {targetGrams} gr</span>
                <span className="tabular-nums">
                  {goldGrams}/{targetGrams} gr ({goldProgress}%)
                </span>
              </div>
              <div className="hq-progress-track">
                <div
                  className="hq-progress-fill"
                  style={{ width: `${goldProgress}%`, background: '#d97706' }}
                />
              </div>
            </div>
          </div>

          <div className="hq-account-foot">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Porsi {goldPercent}% dari total aset
            </span>
            <span className="hq-account-cta" style={{ color: '#b45309' }}>
              <span>Portofolio Emas</span>
              <ArrowUpRight size={15} />
            </span>
          </div>
        </div>
      </section>

      {/* BAND 3: Edge-to-Edge Live Market Reference Bar */}
      <section className="hq-ticker-strip">
        <div className="hq-ticker-cell">
          <span className="hq-ticker-label">Kurs CNY</span>
          <span className="hq-ticker-val">
            1 CNY = Rp {exchangeRate?.toLocaleString('id-ID') || '2.750'}
          </span>
        </div>

        <div className="hq-ticker-cell">
          <span className="hq-ticker-label">Galeri 24 (Jual)</span>
          <span className="hq-ticker-val" style={{ color: '#b45309' }}>
            {formatIdr(goldPricePerGram)}/gr
          </span>
        </div>

        <div className="hq-ticker-cell">
          <span className="hq-ticker-label">Galeri 24 (Buyback)</span>
          <span className="hq-ticker-val" style={{ color: '#0284c7' }}>
            {formatIdr(goldBuybackPerGram)}/gr
          </span>
        </div>

        <div
          className="hq-ticker-cell"
          onClick={onOpenCloudModal}
          style={{ cursor: 'pointer' }}
          title="Klik untuk cek status sinkronisasi cloud"
        >
          <span className="hq-ticker-label">Sinkronisasi Cloud</span>
          <span
            className="hq-ticker-val"
            style={{
              color: isCloudConnected ? '#059669' : '#d97706',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <span className={`hq-status-dot ${isCloudConnected ? 'online' : 'offline'}`} />
            {isCloudConnected ? 'Aktif' : 'Siap'}
          </span>
        </div>
      </section>
    </div>
  );
}
