import React, { useState, useMemo } from 'react';
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
  Table as TableIcon,
  Cloud,
  Calculator,
  Info,
  HelpCircle,
  Zap,
  ArrowRight
} from 'lucide-react';
import { GALERI24_DEFAULT_PRICE_TABLE } from '../data/initialData';
import PegadaianGoldChart from './PegadaianGoldChart';

export default function GoldSavingsView({ onOpenCloudModal }) {
  const {
    setActiveView,
    goldSavings,
    calculations,
    addGoldDeposit,
    deleteGoldDeposit,
    updateGoldPrice,
    updateGoldTarget,
    updateGaleri24Prices,
    refreshLiveGoldPrices,
    isFetchingGoldPrice,
    setGoldValuationMode,
    isCloudConnected,
    isCloudSyncing
  } = usePocket();

  const { gold } = calculations;

  // Simulator & Toast states
  const [toastMessage, setToastMessage] = useState(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [calcMode, setCalcMode] = useState('grams'); // 'grams' | 'idr'
  const [calcInputGrams, setCalcInputGrams] = useState('5');
  const [calcInputIdr, setCalcInputIdr] = useState('10000000');

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

  // Real-time automatic fetch handler directly from sahabat.pegadaian.co.id
  const handleAutoFetch = async () => {
    if (isFetchingGoldPrice) return;
    try {
      const res = await refreshLiveGoldPrices(true);
      if (res && res.success) {
        setToastMessage(`✓ Berhasil memperbarui harga resmi Pegadaian: Rp ${(res.sellPricePer001g || 24300).toLocaleString('id-ID')}/0,01 gr (Rp ${(res.sellPrice || 2430000).toLocaleString('id-ID')}/gr) • Buyback Rp ${(res.buybackPricePer001g || 23440).toLocaleString('id-ID')}/0,01 gr`);
        setTimeout(() => setToastMessage(null), 5000);
        try {
          confetti({ particleCount: 35, spread: 65, origin: { y: 0.3 } });
        } catch (e) {}
      } else {
        setToastMessage('⚠️ Tidak dapat terhubung ke web Pegadaian. Menggunakan acuan resmi terverifikasi.');
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (e) {
      setToastMessage('⚠️ Terjadi kendala saat menghubungkan ke Pegadaian');
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Contributor Breakdown
  const contributorStats = useMemo(() => {
    let yasmeenGrams = 0;
    let yasmeenSpent = 0;
    let adziimaGrams = 0;
    let adziimaSpent = 0;
    let sharedGrams = 0;
    let sharedSpent = 0;

    (goldSavings.transactions || []).forEach(tx => {
      const g = parseFloat(tx.grams) || 0;
      const s = parseFloat(tx.amountIdr) || 0;
      if (tx.contributor === 'yasmeen') {
        yasmeenGrams += g;
        yasmeenSpent += s;
      } else if (tx.contributor === 'adziima') {
        adziimaGrams += g;
        adziimaSpent += s;
      } else {
        sharedGrams += g;
        sharedSpent += s;
      }
    });

    return {
      yasmeen: { grams: yasmeenGrams, spent: yasmeenSpent, value: yasmeenGrams * gold.activeValuationPrice },
      adziima: { grams: adziimaGrams, spent: adziimaSpent, value: adziimaGrams * gold.activeValuationPrice },
      shared: { grams: sharedGrams, spent: sharedSpent, value: sharedGrams * gold.activeValuationPrice }
    };
  }, [goldSavings.transactions, gold.activeValuationPrice]);

  // Calculator Simulation Results
  const calcResult = useMemo(() => {
    if (calcMode === 'grams') {
      const grams = parseFloat(calcInputGrams) || 0;
      const matchRow = (gold.priceTable || GALERI24_DEFAULT_PRICE_TABLE).find(
        p => Math.abs(p.grams - grams) < 0.001
      );
      const sellTotal = matchRow ? matchRow.sell : Math.round(grams * gold.pricePerGram);
      const buybackTotal = matchRow ? matchRow.buyback : Math.round(grams * (gold.buybackPerGram || 2363000));
      const spread = sellTotal - buybackTotal;
      return {
        grams,
        sellTotal,
        buybackTotal,
        spread,
        spreadPercent: sellTotal > 0 ? Math.round((spread / sellTotal) * 1000) / 10 : 0
      };
    } else {
      const budget = parseFloat(calcInputIdr) || 0;
      const gramsGot = gold.pricePerGram > 0 ? (budget / gold.pricePerGram) : 0;
      const buybackYield = Math.round(gramsGot * (gold.buybackPerGram || 2363000));
      return {
        budget,
        gramsGot: Math.round(gramsGot * 100) / 100,
        buybackYield,
        diff: budget - buybackYield
      };
    }
  }, [calcMode, calcInputGrams, calcInputIdr, gold.pricePerGram, gold.buybackPerGram, gold.priceTable]);

  return (
    <div>
      {/* Modern Docked Top Navigation Bar (Evernote/Notion Style) */}
      <div className="modern-navbar">
        <div className="modern-nav-left">
          <button className="modern-nav-btn" onClick={() => setActiveView('landing')}>
            <ArrowLeft size={14} />
            <span>Halaman Utama</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#b45309'
              }}
            >
              <Coins size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                Aset Emas Batangan Galeri 24
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Tabungan Fisik & Investasi Berdua · Yasmeen & Adziima
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Automatic Live Fetch Button */}
          <button
            className="modern-nav-btn gold"
            onClick={handleAutoFetch}
            disabled={isFetchingGoldPrice}
            title="Tarik harga live otomatis dari Pegadaian & Galeri 24"
          >
            <RefreshCw size={12} className={isFetchingGoldPrice ? 'animate-spin' : ''} />
            <span>{isFetchingGoldPrice ? 'Menarik...' : 'Tarik Otomatis'}</span>
          </button>

          <button
            className="modern-nav-btn"
            onClick={() => setIsSimulatorOpen(prev => !prev)}
            style={{
              background: isSimulatorOpen ? '#fef3c7' : '#ffffff',
              color: isSimulatorOpen ? '#92400e' : '#334155'
            }}
            title="Buka / Tutup Kalkulator & Simulasi Investasi Emas"
          >
            <Calculator size={13} />
            <span>Kalkulator</span>
          </button>

          <button
            className="modern-nav-btn"
            onClick={() => setIsPriceTableModalOpen(true)}
            title="Lihat Daftar Harga Resmi Galeri 24"
          >
            <TableIcon size={13} />
            <span>Tabel Resmi</span>
          </button>

          <button
            className="modern-nav-btn"
            onClick={() => {
              setTargetInput(gold.targetGrams.toString());
              setIsTargetModalOpen(true);
            }}
            title="Atur Target Emas"
          >
            <Target size={13} />
            <span>Target</span>
          </button>

          <button
            className="modern-nav-btn"
            onClick={onOpenCloudModal}
            style={{
              background: isCloudConnected ? '#ecfdf5' : '#ffffff',
              color: isCloudConnected ? '#065f46' : '#334155',
              borderColor: isCloudConnected ? '#a7f3d0' : '#e2e8f0'
            }}
            title="Sinkronisasi Cloud Multi-Device"
          >
            {isCloudSyncing ? (
              <RefreshCw size={13} className="animate-spin" color="#059669" />
            ) : (
              <Cloud size={13} />
            )}
            <span>{isCloudConnected ? 'Cloud Aktif' : 'Cloud Sync'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Fetch Toast Banner */}
      {toastMessage && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.65rem 1rem',
            borderRadius: '12px',
            background: toastMessage.startsWith('✓') ? '#ecfdf5' : '#fffbeb',
            border: `1px solid ${toastMessage.startsWith('✓') ? '#a7f3d0' : '#fde68a'}`,
            color: toastMessage.startsWith('✓') ? '#065f46' : '#92400e',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
        >
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit', fontWeight: 900 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Official Galeri 24 Live Strip & Mode Toggle (Clean Editorial Sub-bar) */}
      <div className="modern-status-strip">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#ecfdf5', padding: '0.2rem 0.55rem', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#047857' }}>Live galeri24.co.id</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Acuan: <strong style={{ color: '#0f172a' }}>{gold.lastUpdatedLabel || 'Galeri 24 Pegadaian'}</strong>
          </span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Harga Jual: <strong style={{ color: '#b45309' }}>{formatIdr(gold.pricePerGram)}</strong> / gr
          </span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Buyback: <strong style={{ color: '#047857' }}>{formatIdr(gold.buybackPerGram)}</strong> / gr
          </span>
          <a
            href="https://galeri24.co.id/harga-emas"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.75rem', color: '#b45309', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none', fontWeight: 700 }}
          >
            <span>Cek Web Resmi</span>
            <ExternalLink size={11} />
          </a>
        </div>

        {/* Valuation Toggle: Nilai Toko vs Nilai Buyback */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#f1f5f9', padding: '0.2rem', borderRadius: '9999px' }}>
          <button
            type="button"
            onClick={() => setGoldValuationMode('sell')}
            style={{
              padding: '0.28rem 0.75rem',
              borderRadius: '9999px',
              border: 'none',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: !isBuybackMode ? '#ffffff' : 'transparent',
              color: !isBuybackMode ? '#0f172a' : '#64748b',
              boxShadow: !isBuybackMode ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Nilai Toko (Jual: {formatIdr(gold.pricePerGram)}/gr)
          </button>
          <button
            type="button"
            onClick={() => setGoldValuationMode('buyback')}
            style={{
              padding: '0.28rem 0.75rem',
              borderRadius: '9999px',
              border: 'none',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: isBuybackMode ? '#ffffff' : 'transparent',
              color: isBuybackMode ? '#0f172a' : '#64748b',
              boxShadow: isBuybackMode ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Nilai Cair (Buyback: {formatIdr(gold.buybackPerGram || 2363000)}/gr)
          </button>
        </div>
      </div>

      {/* Clean Editorial Executive Hero (Evernote Style - ZERO NESTED CARDS) */}
      <div className="editorial-hero-section">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
              Galeri 24 Pegadaian · Emas Batangan 24 Karat (999.9)
            </div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.65rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
              {gold.totalGrams.toFixed(2)}{' '}
              <span style={{ fontSize: '1.35rem', fontWeight: 600, color: '#64748b' }}>gram</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#94a3b8', marginLeft: '0.65rem' }}>
                ({gold.totalKeping} keping tersimpan)
              </span>
            </div>

            {/* Market Valuation & Inline Gain/Loss Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.65rem' }}>
              <div style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
                {formatIdr(gold.currentAssetValueIdr)}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                ({isBuybackMode ? 'Harga Buyback' : 'Harga Toko'}: {formatIdr(gold.activeValuationPrice)}/gr)
              </span>

              {/* Sleek Inline Gain/Loss Pill - No heavy card */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.22rem 0.65rem',
                  borderRadius: '9999px',
                  background: isProfit ? '#dcfce7' : '#fee2e2',
                  color: isProfit ? '#15803d' : '#b91c1c',
                  fontSize: '0.76rem',
                  fontWeight: 800
                }}
              >
                {isProfit ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                <span>
                  {gold.totalGoldSpentIdr > 0
                    ? `${isProfit ? '+' : ''}${formatIdr(gold.profitLossIdr)} (${isProfit ? '+' : ''}${gold.profitLossPercent}%)`
                    : 'Belum ada modal tercatat'}
                </span>
              </div>

              {gold.totalGoldSpentIdr > 0 && (
                <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                  Modal: {formatIdr(gold.totalGoldSpentIdr)} · Rata-rata: {formatIdr(Math.round(gold.avgBuyPricePerGram))}/gr
                </span>
              )}
            </div>
          </div>

          <button
            className="modern-nav-btn gold"
            onClick={() => handleOpenAddModal(1)}
            style={{ padding: '0.65rem 1.35rem', fontSize: '0.85rem' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Catat Emas Galeri 24</span>
          </button>
        </div>

        {/* Target Progress Bar - Minimalist Clean Line */}
        <div style={{ marginTop: '1.4rem', paddingTop: '1.1rem', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.45rem' }}>
            <span>Target Emas Berdua: {gold.targetGrams} gram</span>
            <span style={{ color: '#0f172a', fontWeight: 800 }}>{gold.progressPercent}% Tercapai</span>
          </div>
          <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${gold.progressPercent}%`,
                height: '100%',
                background: '#f59e0b',
                borderRadius: '9999px',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>

        {/* 4-Column Continuous Metrics Strip - Clean Dividers, ZERO BOXED CARDS */}
        <div className="metrics-strip">
          <div className="metrics-col">
            <div className="metrics-label" style={{ color: '#db2777' }}>Disetor Yasmeen</div>
            <div className="metrics-value" style={{ color: '#be185d' }}>
              {gold.yasmeenContributedGrams.toFixed(2)} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>gr</span>
            </div>
            <div className="metrics-sub">
              ≈ {formatIdr(gold.yasmeenContributedValueIdr || 0)}
            </div>
          </div>

          <div className="metrics-col">
            <div className="metrics-label" style={{ color: '#0284c7' }}>Disetor Adziima</div>
            <div className="metrics-value" style={{ color: '#0369a1' }}>
              {gold.adziimaContributedGrams.toFixed(2)} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>gr</span>
            </div>
            <div className="metrics-sub">
              ≈ {formatIdr(gold.adziimaContributedValueIdr || 0)}
            </div>
          </div>

          <div className="metrics-col">
            <div className="metrics-label" style={{ color: '#d97706' }}>Patungan (50:50)</div>
            <div className="metrics-value" style={{ color: '#b45309' }}>
              {contributorStats.shared.grams.toFixed(2)} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>gr</span>
            </div>
            <div className="metrics-sub">
              ≈ {formatIdr(contributorStats.shared.value || 0)}
            </div>
          </div>

          <div className="metrics-col">
            <div className="metrics-label" style={{ color: '#475569' }}>Total Keping Batangan</div>
            <div className="metrics-value" style={{ color: '#0f172a' }}>
              {gold.totalKeping} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Kpg</span>
            </div>
            <div className="metrics-sub">
              Galeri 24 Pegadaian Resmi
            </div>
          </div>
        </div>
      </div>

      {/* Official Pegadaian Live Interactive Trend Chart (Sesuai web Pegadaian pada screenshot) */}
      <PegadaianGoldChart
        history={gold.pegadaianHistory}
        currentSellPricePer001g={gold.pegadaianPrice001g || 24300}
        currentBuybackPricePer001g={gold.pegadaianBuyback001g || 23440}
        lastUpdatedLabel={gold.pegadaianDateLabel || new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
        onRefresh={handleAutoFetch}
        isRefreshing={isFetchingGoldPrice}
      />

      {/* Interactive Gold Investment Simulator & Calculator (Collapsible) */}
      {isSimulatorOpen && (
        <div
          className="editorial-hero-section"
          style={{
            marginTop: '1.2rem',
            background: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#fef08a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
              <Calculator size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#92400e', margin: 0 }}>
                Kalkulator & Simulasi Emas Galeri 24
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#b45309', margin: 0 }}>
                Simulasi beli baru vs estimasi nilai pencairan buyback hari ini
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'inline-flex', background: '#fef9c3', padding: '2px', borderRadius: 'var(--radius-full)', border: '1px solid #fde047' }}>
            <button
              type="button"
              onClick={() => setCalcMode('grams')}
              style={{
                border: 'none',
                background: calcMode === 'grams' ? '#f59e0b' : 'transparent',
                color: calcMode === 'grams' ? '#ffffff' : '#92400e',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Berdasarkan Gram
            </button>
            <button
              type="button"
              onClick={() => setCalcMode('idr')}
              style={{
                border: 'none',
                background: calcMode === 'idr' ? '#f59e0b' : 'transparent',
                color: calcMode === 'idr' ? '#ffffff' : '#92400e',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Berdasarkan Budget Rp
            </button>
          </div>
        </div>

        {/* Input & Quick Presets */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1rem' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#78350f', marginBottom: '0.35rem' }}>
              {calcMode === 'grams' ? 'Jumlah Gram Emas:' : 'Budget Pembelian (Rp):'}
            </label>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <input
                type="number"
                value={calcMode === 'grams' ? calcInputGrams : calcInputIdr}
                onChange={(e) => calcMode === 'grams' ? setCalcInputGrams(e.target.value) : setCalcInputIdr(e.target.value)}
                placeholder={calcMode === 'grams' ? 'Contoh: 5' : 'Contoh: 10000000'}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.8rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid #fde047',
                  background: '#ffffff'
                }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#92400e' }}>
                {calcMode === 'grams' ? 'gr' : 'IDR'}
              </span>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {calcMode === 'grams' ? (
              [0.5, 1, 2, 5, 10, 25].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setCalcInputGrams(g.toString())}
                  style={{
                    border: '1px solid #fde047',
                    background: parseFloat(calcInputGrams) === g ? '#f59e0b' : '#fefce8',
                    color: parseFloat(calcInputGrams) === g ? '#ffffff' : '#92400e',
                    padding: '0.35rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {g} gr
                </button>
              ))
            ) : (
              [
                { label: '1 Jt', val: 1000000 },
                { label: '2.5 Jt', val: 2500000 },
                { label: '5 Jt', val: 5000000 },
                { label: '10 Jt', val: 10000000 },
                { label: '25 Jt', val: 25000000 }
              ].map(p => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setCalcInputIdr(p.val.toString())}
                  style={{
                    border: '1px solid #fde047',
                    background: parseFloat(calcInputIdr) === p.val ? '#f59e0b' : '#fefce8',
                    color: parseFloat(calcInputIdr) === p.val ? '#ffffff' : '#92400e',
                    padding: '0.35rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {p.label}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Live Calculation Output Card */}
        {calcMode === 'grams' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', background: '#fefce8', padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid #fef08a' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#78350f', fontWeight: 700, textTransform: 'uppercase' }}>
                Estimasi Modal Beli (Toko Galeri 24)
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#92400e', fontFamily: 'var(--font-display)', marginTop: '0.15rem' }}>
                {formatIdr(calcResult.sellTotal)}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#b45309' }}>
                @ {formatIdr(Math.round(calcResult.sellTotal / (calcResult.grams || 1)))}/gr
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#78350f', fontWeight: 700, textTransform: 'uppercase' }}>
                Nilai Pencairan Hari Ini (Buyback)
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#15803d', fontFamily: 'var(--font-display)', marginTop: '0.15rem' }}>
                {formatIdr(calcResult.buybackTotal)}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#166534' }}>
                @ {formatIdr(gold.buybackPerGram || 2363000)}/gr
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#78350f', fontWeight: 700, textTransform: 'uppercase' }}>
                Selisih Spread Jual-Beli
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#b45309', fontFamily: 'var(--font-display)', marginTop: '0.15rem' }}>
                {formatIdr(calcResult.spread)}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#78350f' }}>
                Spread: {calcResult.spreadPercent}% (Impaspas jika emas naik ~{calcResult.spreadPercent}%)
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', background: '#fefce8', padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid #fef08a' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#78350f', fontWeight: 700, textTransform: 'uppercase' }}>
                Dapat Emas Batangan Galeri 24
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#92400e', fontFamily: 'var(--font-display)', marginTop: '0.15rem' }}>
                {calcResult.gramsGot} <span style={{ fontSize: '0.9rem' }}>gram</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#b45309' }}>
                Dari modal {formatIdr(calcResult.budget)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#78350f', fontWeight: 700, textTransform: 'uppercase' }}>
                Nilai Jika Dicairkan Hari Ini
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#15803d', fontFamily: 'var(--font-display)', marginTop: '0.15rem' }}>
                {formatIdr(calcResult.buybackYield)}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#166534' }}>
                Harga buyback @ {formatIdr(gold.buybackPerGram || 2363000)}/gr
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => handleOpenAddModal(calcResult.gramsGot >= 1 ? Math.floor(calcResult.gramsGot) : 1)}
                className="btn-enter-profile btn-enter-gold"
                style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.85rem' }}
              >
                <Plus size={15} />
                <span>Catat Pembelian Ini</span>
              </button>
            </div>
          </div>
        )}
      </div>
    )}

      {/* Gold Transaction / Holdings History */}
      <div className="editorial-hero-section" style={{ marginTop: '1.5rem', background: '#ffffff' }}>
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
            <span>Tambah Keping</span>
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

              // Find exact matching row from Galeri 24 official price table
              const matchRow = (gold.priceTable || GALERI24_DEFAULT_PRICE_TABLE).find(
                p => Math.abs(p.grams - itemPecahan) < 0.001
              );
              const unitCurrentPrice = matchRow
                ? (isBuybackMode ? matchRow.buyback : matchRow.sell)
                : (itemPecahan * gold.activeValuationPrice);
              const itemCurrentValue = unitCurrentPrice * itemKeping;

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

                  <div className="tx-right" style={{ marginLeft: 'auto' }}>
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
