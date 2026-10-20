import React, { useState } from 'react';
import { usePocket } from '../context/PocketContext';
import { formatIdr, formatDateIndo } from '../utils/formatters';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Coins,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Target,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Building,
  RefreshCw,
  Layers,
  Scale,
  ExternalLink,
  Table as TableIcon
} from 'lucide-react';
import { GALERI24_DEFAULT_PRICE_TABLE } from '../data/initialData';

export default function GoldSavingsView() {
  const {
    setActiveView,
    goldSavings,
    calculations,
    addGoldDeposit,
    deleteGoldDeposit,
    updateGoldPrice,
    updateGoldTarget,
    updateGaleri24Prices,
    setGoldValuationMode
  } = usePocket();

  const { gold } = calculations;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPriceTableModalOpen, setIsPriceTableModalOpen] = useState(false);
  const [isPriceUpdateModalOpen, setIsPriceUpdateModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);

  // Form states for Add Gold Bar
  const [contributor, setContributor] = useState('berdua');
  const [keping, setKeping] = useState('1');
  const [selectedPecahan, setSelectedPecahan] = useState(1);
  const [customPecahan, setCustomPecahan] = useState('');
  const [isCustomPecahan, setIsCustomPecahan] = useState(false);
  const [amountIdr, setAmountIdr] = useState('');
  const [place, setPlace] = useState('Galeri 24 (Pegadaian)');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [serialNumber, setSerialNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Modals input states
  const [sellPriceInput, setSellPriceInput] = useState(gold.pricePerGram.toString());
  const [buybackPriceInput, setBuybackPriceInput] = useState((gold.buybackPerGram || 2363000).toString());
  const [dateLabelInput, setDateLabelInput] = useState(gold.lastUpdatedLabel || 'Hari Ini (galeri24.co.id)');
  const [targetInput, setTargetInput] = useState(gold.targetGrams.toString());

  // Calculated grams in modal
  const effectivePecahan = isCustomPecahan ? (parseFloat(customPecahan) || 0) : selectedPecahan;
  const effectiveKeping = parseInt(keping) || 1;
  const calculatedTotalGrams = (effectiveKeping * effectivePecahan) || 0;

  // Find official Galeri 24 catalog price for selected pecahan
  const catalogEntry = (gold.priceTable || GALERI24_DEFAULT_PRICE_TABLE).find(
    p => Math.abs(p.grams - effectivePecahan) < 0.001
  );

  // Handle open add modal
  const handleOpenAddModal = (initialPecahan = 1) => {
    setContributor('berdua');
    setKeping('1');
    setSelectedPecahan(initialPecahan);
    setIsCustomPecahan(false);
    setCustomPecahan('');

    // Pre-populate with official Galeri 24 catalog price if available
    const cat = (gold.priceTable || GALERI24_DEFAULT_PRICE_TABLE).find(p => p.grams === initialPecahan);
    if (cat) {
      setAmountIdr(cat.sell.toString());
    } else {
      setAmountIdr(Math.round(initialPecahan * gold.pricePerGram).toString());
    }

    setPlace('Galeri 24 (Pegadaian)');
    setDate(new Date().toISOString().split('T')[0]);
    setSerialNumber('');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleSelectPecahan = (grams) => {
    setSelectedPecahan(grams);
    setIsCustomPecahan(false);
    const cat = (gold.priceTable || GALERI24_DEFAULT_PRICE_TABLE).find(p => p.grams === grams);
    const qty = parseInt(keping) || 1;
    if (cat) {
      setAmountIdr((cat.sell * qty).toString());
    } else {
      setAmountIdr(Math.round(grams * qty * gold.pricePerGram).toString());
    }
  };

  const handleKepingChange = (newQtyStr) => {
    setKeping(newQtyStr);
    const qty = parseInt(newQtyStr) || 1;
    if (catalogEntry) {
      setAmountIdr((catalogEntry.sell * qty).toString());
    } else {
      setAmountIdr(Math.round(effectivePecahan * qty * gold.pricePerGram).toString());
    }
  };

  const handleSubmitDeposit = (e) => {
    e.preventDefault();
    if (calculatedTotalGrams <= 0) {
      alert('Pilih pecahan dan jumlah keping yang valid!');
      return;
    }

    const totalCost = parseFloat(amountIdr) || (calculatedTotalGrams * gold.pricePerGram);

    addGoldDeposit({
      contributor,
      keping: effectiveKeping,
      pecahan: effectivePecahan,
      grams: calculatedTotalGrams,
      amountIdr: totalCost,
      place,
      date,
      serialNumber,
      notes
    });

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#fbbf24', '#f59e0b', '#fef08a']
      });
    } catch (e) {
      // ignore
    }

    setIsAddModalOpen(false);
  };

  const handleSavePrices = (e) => {
    e.preventDefault();
    const sell = parseFloat(sellPriceInput);
    const buyback = parseFloat(buybackPriceInput);
    if (sell && sell > 0) {
      updateGaleri24Prices({
        sell,
        buyback: buyback || Math.round(sell * 0.94),
        dateLabel: dateLabelInput
      });
      setIsPriceUpdateModalOpen(false);
    }
  };

  const handleSaveTarget = (e) => {
    e.preventDefault();
    const val = parseFloat(targetInput);
    if (val && val > 0) {
      updateGoldTarget(val);
      setIsTargetModalOpen(false);
    }
  };

  const isProfit = gold.profitLossIdr >= 0;
  const isBuybackMode = gold.valuationMode === 'buyback';

  return (
    <div>
      {/* Top Header */}
      <div className="top-nav">
        <button className="btn-back-home" onClick={() => setActiveView('landing')}>
          <ArrowLeft size={16} />
          <span>Halaman Utama</span>
        </button>

        <div className="nav-user-badge">
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#fef08a',
              border: '1.5px solid #fde047',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#b45309'
            }}
          >
            <Coins size={20} />
          </div>
          <div>
            <div className="nav-user-title" style={{ color: '#b45309' }}>
              Aset Emas Batangan Galeri 24
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Yasmeen & Adziima · Galeri 24 Pegadaian</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            className="btn-back-home"
            onClick={() => setIsPriceTableModalOpen(true)}
            style={{ borderColor: '#fde047', color: '#b45309', background: '#ffffff' }}
            title="Lihat Daftar Harga Resmi Galeri 24"
          >
            <TableIcon size={14} />
            <span>Tabel Galeri 24</span>
          </button>

          <button
            className="btn-back-home"
            onClick={() => {
              setSellPriceInput(gold.pricePerGram.toString());
              setBuybackPriceInput((gold.buybackPerGram || 2363000).toString());
              setDateLabelInput(gold.lastUpdatedLabel || 'Hari Ini (galeri24.co.id)');
              setIsPriceUpdateModalOpen(true);
            }}
            style={{ borderColor: '#fde047', color: '#b45309', background: '#ffffff' }}
            title="Update Harga Tren Harian"
          >
            <RefreshCw size={14} />
            <span>Update Harga</span>
          </button>

          <button
            className="btn-back-home"
            onClick={() => {
              setTargetInput(gold.targetGrams.toString());
              setIsTargetModalOpen(true);
            }}
            style={{ borderColor: '#fde047', color: '#b45309', background: '#ffffff' }}
            title="Atur Target Emas"
          >
            <Target size={14} />
            <span>Target</span>
          </button>
        </div>
      </div>

      {/* Official Galeri 24 Banner & Mode Toggle */}
      <div
        style={{
          marginTop: '1rem',
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '0.75rem 1.2rem',
          border: '1px solid #fde047',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
          <div style={{ fontSize: '0.82rem', color: '#78350f' }}>
            Data Resmi <strong>galeri24.co.id</strong>: <span style={{ fontWeight: 600 }}>{gold.lastUpdatedLabel}</span>
          </div>
          <a
            href="https://galeri24.co.id/harga-emas"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.78rem', color: '#b45309', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'underline', marginLeft: '0.3rem' }}
          >
            <span>Cek Web Resmi</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Valuation Toggle: Harga Jual vs Harga Buyback */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#fefce8', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #fde047' }}>
          <button
            type="button"
            onClick={() => setGoldValuationMode('sell')}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: !isBuybackMode ? '#f59e0b' : 'transparent',
              color: !isBuybackMode ? '#ffffff' : '#92400e',
              transition: 'all 0.2s ease'
            }}
          >
            Nilai Pasar (Beli Baru: {formatIdr(gold.pricePerGram)}/gr)
          </button>
          <button
            type="button"
            onClick={() => setGoldValuationMode('buyback')}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: isBuybackMode ? '#b45309' : 'transparent',
              color: isBuybackMode ? '#ffffff' : '#92400e',
              transition: 'all 0.2s ease'
            }}
          >
            Nilai Cair (Buyback: {formatIdr(gold.buybackPerGram || 2363000)}/gr)
          </button>
        </div>
      </div>

      {/* Gold Hero Card */}
      <div className="gold-banner" style={{ background: '#fefce8', border: '2px solid #fef08a', borderRadius: 'var(--radius-xl)', padding: '1.6rem', marginTop: '1rem', boxShadow: '0 4px 16px rgba(245, 158, 11, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid #fde047', marginBottom: '0.6rem' }}>
              <ShieldCheck size={14} color="#b45309" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Galeri 24 · Emas Batangan 24 Karat (999.9)
              </span>
            </div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: '#92400e', lineHeight: 1.1 }}>
              {gold.totalGrams.toFixed(2)}{' '}
              <span style={{ fontSize: '1.3rem', fontWeight: 700 }}>gram</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#b45309', marginLeft: '0.75rem' }}>
                ({gold.totalKeping} keping)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.95rem', color: '#78350f' }}>
                {isBuybackMode ? 'Nilai Pencairan Hari Ini (Buyback):' : 'Estimasi Nilai Pasar Terkini:'}{' '}
                <strong>{formatIdr(gold.currentAssetValueIdr)}</strong>
              </div>
              <span style={{ color: '#d97706' }}>•</span>
              <div style={{ fontSize: '0.82rem', color: '#92400e', background: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fde047' }}>
                Acuan: <strong>{formatIdr(gold.activeValuationPrice)}</strong> / gr
              </div>
            </div>
          </div>

          <button
            className="btn-enter-profile btn-enter-gold"
            onClick={() => handleOpenAddModal(1)}
            style={{ width: 'auto', padding: '0.75rem 1.4rem', background: '#f59e0b', color: '#ffffff', border: 'none', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>+ Catat Emas Galeri 24</span>
          </button>
        </div>

        {/* Dynamic Trend & Gain/Loss Banner ("bergerak naik turun asetnya sesuai tren emas") */}
        <div style={{ marginTop: '1.3rem', background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', border: '1px solid #fde047' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: isProfit ? '#dcfce7' : '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isProfit ? '#16a34a' : '#dc2626'
                }}
              >
                {isProfit ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Pergerakan Tren Nilai Aset ({isBuybackMode ? 'Berdasarkan Buyback' : 'Berdasarkan Harga Toko'})
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: isProfit ? '#15803d' : '#b91c1c' }}>
                  {gold.totalGoldSpentIdr > 0 ? (
                    <>
                      {isProfit ? '+' : ''}{formatIdr(gold.profitLossIdr)}{' '}
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                        ({isProfit ? '+' : ''}{gold.profitLossPercent}%)
                      </span>
                    </>
                  ) : (
                    'Belum ada modal tercatat'
                  )}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                Total Modal Beli: <strong>{formatIdr(gold.totalGoldSpentIdr)}</strong>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
                Rata-rata Harga Beli: <strong>{gold.totalGrams > 0 ? `${formatIdr(Math.round(gold.avgBuyPricePerGram))}/gr` : '-'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar towards target */}
        <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid rgba(251, 191, 36, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#92400e', marginBottom: '0.4rem' }}>
            <span>Target Emas Berdua: {gold.targetGrams} gram</span>
            <span>{gold.progressPercent}% Tercapai</span>
          </div>
          <div className="progress-bar-bg" style={{ height: '10px', background: 'rgba(255,255,255,0.85)', border: '1px solid #fef08a' }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${gold.progressPercent}%`,
                background: '#f59e0b'
              }}
            />
          </div>
        </div>

        {/* Contribution breakdown */}
        <div className="gold-stats-grid" style={{ marginTop: '1.2rem' }}>
          <div className="gold-stat-item" style={{ background: '#ffffff', border: '1px solid #fde047' }}>
            <div className="gold-stat-label">Disetor Yasmeen</div>
            <div className="gold-stat-value" style={{ color: '#db2777' }}>
              {gold.yasmeenContributedGrams.toFixed(2)} gr
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              ≈ {formatIdr(gold.yasmeenContributedGrams * gold.activeValuationPrice)}
            </div>
          </div>

          <div className="gold-stat-item" style={{ background: '#ffffff', border: '1px solid #fde047' }}>
            <div className="gold-stat-label">Disetor Adziima</div>
            <div className="gold-stat-value" style={{ color: '#0284c7' }}>
              {gold.adziimaContributedGrams.toFixed(2)} gr
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              ≈ {formatIdr(gold.adziimaContributedGrams * gold.activeValuationPrice)}
            </div>
          </div>

          <div className="gold-stat-item" style={{ background: '#ffffff', border: '1px solid #fde047' }}>
            <div className="gold-stat-label">Total Keping Batangan</div>
            <div className="gold-stat-value" style={{ color: '#b45309' }}>
              {gold.totalKeping} Keping
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Galeri 24 Pegadaian
            </div>
          </div>
        </div>
      </div>

      {/* Gold Transaction / Holdings History */}
      <div className="pastel-card" style={{ padding: '1.4rem', marginTop: '1.5rem', background: '#ffffff', border: '1px solid #fef08a' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Daftar Emas Batangan Galeri 24 Berdua
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Catatan fisik kepingan emas batangan, harga beli, nomor sertifikat, dan pergerakan nilainya
            </p>
          </div>

          <button
            className="btn-enter-profile btn-enter-gold"
            onClick={() => handleOpenAddModal(1)}
            style={{ width: 'auto', padding: '0.45rem 1rem' }}
          >
            <Plus size={14} />
            <span>+ Tambah Keping</span>
          </button>
        </div>

        {(goldSavings.transactions || []).length === 0 ? (
          <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fef08a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem', color: '#b45309' }}>
              <Coins size={28} />
            </div>
            <p style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
              Belum ada koleksi emas batangan tercatat
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1rem' }}>
              Kalian bisa catat pembelian emas batangan Galeri 24: berapa keping, berapa gram, harga beli saat itu, dan pantau kenaikan nilainya setiap hari!
            </p>
            <button
              className="btn-enter-profile btn-enter-gold"
              onClick={() => handleOpenAddModal(1)}
              style={{ width: 'auto', margin: '0 auto', padding: '0.6rem 1.4rem' }}
            >
              <Plus size={16} />
              <span>Catat Keping Pertama</span>
            </button>
          </div>
        ) : (
          <div>
            {(goldSavings.transactions || []).map((entry) => {
              const itemKeping = parseInt(entry.keping) || 1;
              const itemGrams = parseFloat(entry.grams) || 0;
              const itemPecahan = entry.pecahan || (itemKeping > 0 ? (itemGrams / itemKeping) : itemGrams);
              const itemSpent = parseFloat(entry.amountIdr) || 0;
              const itemCurrentValue = itemGrams * gold.activeValuationPrice;
              const itemProfit = itemCurrentValue - itemSpent;
              const itemProfitPercent = itemSpent > 0 ? Math.round(((itemProfit / itemSpent) * 100) * 10) / 10 : 0;
              const itemAvgBuyPrice = itemGrams > 0 ? Math.round(itemSpent / itemGrams) : 0;

              const contributorLabel = entry.contributor === 'yasmeen'
                ? 'Yasmeen'
                : entry.contributor === 'adziima'
                ? 'Adziima'
                : 'Patungan Berdua (50:50)';

              const contributorColor = entry.contributor === 'yasmeen'
                ? '#db2777'
                : entry.contributor === 'adziima'
                ? '#0284c7'
                : '#b45309';

              return (
                <div key={entry.id} className="tx-item" style={{ alignItems: 'flex-start', padding: '1rem', borderBottom: '1px solid #fef08a' }}>
                  <div className="tx-left" style={{ alignItems: 'flex-start' }}>
                    <div
                      className="tx-category-badge"
                      style={{
                        background: '#fef08a',
                        border: '1px solid #fde047',
                        marginTop: '0.1rem'
                      }}
                    >
                      <Coins size={20} color="#b45309" />
                    </div>

                    <div className="tx-details">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                          {itemKeping} Keping · {itemGrams} gram Emas Batangan
                        </h4>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            background: '#fefce8',
                            border: '1px solid #fde047',
                            color: '#b45309'
                          }}
                        >
                          Pecahan {itemPecahan} gr
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            color: 'var(--text-dim)'
                          }}
                        >
                          {entry.place || 'Galeri 24'}
                        </span>
                      </div>

                      <div className="tx-meta" style={{ marginTop: '0.35rem' }}>
                        <span>{formatDateIndo(entry.date)}</span>
                        <span>•</span>
                        <span style={{ color: contributorColor, fontWeight: 700 }}>
                          Milik: {contributorLabel}
                        </span>
                        {entry.serialNumber && (
                          <>
                            <span>•</span>
                            <span style={{ fontFamily: 'monospace', color: '#475569' }}>
                              Seri: {entry.serialNumber}
                            </span>
                          </>
                        )}
                        {entry.notes && (
                          <>
                            <span>•</span>
                            <span style={{ fontStyle: 'italic' }}>"{entry.notes}"</span>
                          </>
                        )}
                      </div>

                      {/* Item Gain/Loss Indicator */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.45rem', fontSize: '0.78rem', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--text-dim)' }}>
                          Beli: <strong>{formatIdr(itemSpent)}</strong> (@ {formatIdr(itemAvgBuyPrice)}/gr)
                        </span>
                        <span>•</span>
                        <span style={{ color: 'var(--text-dim)' }}>
                          Kini: <strong>{formatIdr(itemCurrentValue)}</strong>
                        </span>
                        <span>•</span>
                        <span style={{ fontWeight: 800, color: itemProfit >= 0 ? '#15803d' : '#b91c1c' }}>
                          {itemProfit >= 0 ? '▲ +' : '▼ '}{formatIdr(itemProfit)} ({itemProfit >= 0 ? '+' : ''}{itemProfitPercent}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginLeft: 'auto' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div className="tx-amount" style={{ color: '#b45309', fontSize: '1.05rem', fontWeight: 800 }}>
                        {formatIdr(itemCurrentValue)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        {isBuybackMode ? 'Nilai Buyback' : 'Nilai Pasar'}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Hapus catatan emas ${itemKeping} keping (${itemGrams} gr)?`)) {
                          deleteGoldDeposit(entry.id);
                        }
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.4rem' }}
                      title="Hapus Keping Ini"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Add Gold Bar (Galeri 24) */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Coins size={22} color="#b45309" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Catat Emas Batangan Galeri 24</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Berapa keping & berapa gram emas yang kalian beli
                  </div>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitDeposit}>
              {/* Contributor */}
              <div className="form-group">
                <label className="form-label">Kepemilikan / Siapa yang Beli?</label>
                <select
                  className="form-select"
                  value={contributor}
                  onChange={(e) => setContributor(e.target.value)}
                >
                  <option value="berdua">Patungan Berdua (50:50)</option>
                  <option value="yasmeen">Yasmeen</option>
                  <option value="adziima">Adziima</option>
                </select>
              </div>

              {/* Pecahan & Keping */}
              <div className="form-group">
                <label className="form-label">Pecahan Emas Galeri 24 per Keping</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  {(gold.priceTable || GALERI24_DEFAULT_PRICE_TABLE).map(p => (
                    <button
                      type="button"
                      key={p.grams}
                      onClick={() => handleSelectPecahan(p.grams)}
                      style={{
                        padding: '0.45rem 0.2rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-sm)',
                        border: (!isCustomPecahan && selectedPecahan === p.grams) ? '2px solid #b45309' : '1px solid #e2e8f0',
                        background: (!isCustomPecahan && selectedPecahan === p.grams) ? '#fef08a' : '#ffffff',
                        color: (!isCustomPecahan && selectedPecahan === p.grams) ? '#92400e' : 'var(--text-main)',
                        cursor: 'pointer'
                      }}
                    >
                      {p.grams} gr
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsCustomPecahan(true)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.78rem',
                      borderRadius: 'var(--radius-sm)',
                      border: isCustomPecahan ? '2px solid #b45309' : '1px solid #e2e8f0',
                      background: isCustomPecahan ? '#fef08a' : '#f8fafc',
                      color: isCustomPecahan ? '#92400e' : 'var(--text-dim)',
                      cursor: 'pointer'
                    }}
                  >
                    Pecahan Lain
                  </button>

                  {isCustomPecahan && (
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      placeholder="Masukkan gram, cth: 0.25"
                      value={customPecahan}
                      onChange={(e) => setCustomPecahan(e.target.value)}
                      style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                      autoFocus
                    />
                  )}
                </div>
              </div>

              {/* Keping & Total Gramasi */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Jumlah Keping *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={keping}
                    onChange={(e) => handleKepingChange(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total Gramasi Emas</label>
                  <div
                    style={{
                      padding: '0.75rem',
                      background: '#fefce8',
                      border: '1.5px solid #fde047',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 800,
                      color: '#92400e',
                      fontSize: '1rem',
                      textAlign: 'center'
                    }}
                  >
                    {calculatedTotalGrams.toFixed(2)} gram
                  </div>
                </div>
              </div>

              {/* Harga Beli */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Total Harga Beli / Modal (Rp) *</label>
                  {catalogEntry && (
                    <button
                      type="button"
                      onClick={() => setAmountIdr((catalogEntry.sell * (parseInt(keping) || 1)).toString())}
                      style={{ background: 'transparent', border: 'none', color: '#b45309', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Reset ke katalog resmi ({formatIdr(catalogEntry.sell * (parseInt(keping) || 1))})
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Masukkan total rupiah yang dibayarkan"
                  value={amountIdr}
                  onChange={(e) => setAmountIdr(e.target.value)}
                  required
                />
                {Boolean(amountIdr && calculatedTotalGrams > 0) && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                    Rata-rata harga beli: <strong>{formatIdr(Math.round(parseFloat(amountIdr) / calculatedTotalGrams))}</strong> / gram
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tempat Beli</label>
                  <select
                    className="form-select"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                  >
                    <option value="Galeri 24 (Pegadaian)">Galeri 24 (Pegadaian)</option>
                    <option value="Outlet Galeri 24 Mall">Outlet Galeri 24 Mall</option>
                    <option value="Pegadaian Digital / Tabungan">Pegadaian Digital / Tabungan</option>
                    <option value="Antam / Butik LM">Antam / Butik LM</option>
                    <option value="Toko Emas Lokal">Toko Emas Lokal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tanggal Beli</label>
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nomor Seri / Sertifikat Galeri 24 (Opsional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: G24-098231 atau barcode certicard"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Catatan Tambahan</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Tabungan bulan November, kado ulang tahun..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="submit-btn gold"
                style={{ background: '#f59e0b', color: '#ffffff', fontWeight: 800, marginTop: '0.5rem' }}
              >
                <Check size={18} />
                <span>Simpan Keping Emas Galeri 24</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Official Galeri 24 Price Table */}
      {isPriceTableModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPriceTableModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TableIcon size={22} color="#b45309" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Daftar Harga Emas Galeri 24 Resmi</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Sumber: galeri24.co.id/harga-emas · {gold.lastUpdatedLabel}
                  </div>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsPriceTableModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem', background: '#fefce8', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #fde047', fontSize: '0.8rem', color: '#78350f' }}>
              Harga emas batangan Galeri 24 diperbarui setiap hari kerja mengikuti acuan resmi Pegadaian. Klik salah satu pecahan untuk langsung mencatat pembelian!
            </div>

            <div style={{ maxHeight: '360px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '0.6rem 0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>Gramasi</th>
                    <th style={{ padding: '0.6rem 0.8rem', fontWeight: 800, color: '#b45309' }}>Harga Jual</th>
                    <th style={{ padding: '0.6rem 0.8rem', fontWeight: 800, color: '#0369a1' }}>Harga Buyback</th>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center', fontWeight: 800 }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {(gold.priceTable || GALERI24_DEFAULT_PRICE_TABLE).map((row, idx) => (
                    <tr
                      key={row.grams}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd'
                      }}
                    >
                      <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>
                        {row.grams} gram
                      </td>
                      <td style={{ padding: '0.6rem 0.8rem', fontWeight: 800, color: '#92400e' }}>
                        {formatIdr(row.sell)}
                      </td>
                      <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: '#0284c7' }}>
                        {formatIdr(row.buyback)}
                      </td>
                      <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setIsPriceTableModalOpen(false);
                            handleOpenAddModal(row.grams);
                          }}
                          style={{
                            padding: '0.25rem 0.6rem',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid #fde047',
                            background: '#fefce8',
                            color: '#b45309',
                            cursor: 'pointer'
                          }}
                        >
                          + Beli
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
              <a
                href="https://galeri24.co.id/harga-emas"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.8rem', color: '#b45309', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'underline' }}
              >
                <span>Buka Langsung galeri24.co.id/harga-emas</span>
                <ExternalLink size={14} />
              </a>

              <button
                type="button"
                className="btn-back-home"
                onClick={() => setIsPriceTableModalOpen(false)}
                style={{ padding: '0.4rem 0.9rem' }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Update Tren Harga Emas Hari Ini */}
      {isPriceUpdateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPriceUpdateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={20} color="#b45309" />
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Sinkronkan Harga Galeri 24</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsPriceUpdateModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePrices}>
              <div style={{ background: '#fefce8', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #fde047', marginBottom: '1rem', fontSize: '0.8rem', color: '#78350f' }}>
                Nilai acuan ini langsung digunakan untuk menghitung nilai terkini seluruh emas batangan dan tren naik/turun untung-rugi.
              </div>

              <div className="form-group">
                <label className="form-label">Harga Jual Galeri 24 (1 gr) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={sellPriceInput}
                  onChange={(e) => setSellPriceInput(e.target.value)}
                  placeholder="Contoh: 2510000"
                  autoFocus
                  required
                />
                <div style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 700, marginTop: '0.25rem' }}>
                  Terbaca: {formatIdr(parseFloat(sellPriceInput) || 0)} / gram
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Harga Buyback Galeri 24 (1 gr) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={buybackPriceInput}
                  onChange={(e) => setBuybackPriceInput(e.target.value)}
                  placeholder="Contoh: 2363000"
                  required
                />
                <div style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 700, marginTop: '0.25rem' }}>
                  Terbaca: {formatIdr(parseFloat(buybackPriceInput) || 0)} / gram
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Label Tanggal Pembaruan</label>
                <input
                  type="text"
                  className="form-input"
                  value={dateLabelInput}
                  onChange={(e) => setDateLabelInput(e.target.value)}
                  placeholder="Contoh: Selasa, 20 Oktober 2026"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <a
                  href="https://galeri24.co.id/harga-emas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-back-home"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.82rem', padding: '0.6rem' }}
                >
                  <ExternalLink size={14} />
                  <span>Cek Web</span>
                </a>

                <button
                  type="submit"
                  className="submit-btn gold"
                  style={{ flex: 1, background: '#f59e0b', color: '#ffffff', fontWeight: 800, margin: 0 }}
                >
                  <Check size={18} />
                  <span>Simpan Pembaruan Harga</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Target Emas Bersama */}
      {isTargetModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTargetModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={20} color="#b45309" />
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Atur Target Emas Berdua</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsTargetModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTarget}>
              <div className="form-group">
                <label className="form-label">Target Emas Bersama (Gram)</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="Contoh: 25 atau 50"
                  autoFocus
                  required
                />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  Saat ini terkumpul: {gold.totalGrams.toFixed(2)} gram ({gold.totalKeping} keping)
                </div>
              </div>

              <button
                type="submit"
                className="submit-btn gold"
                style={{ background: '#f59e0b', color: '#ffffff', fontWeight: 800 }}
              >
                <Check size={18} />
                <span>Simpan Target</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
