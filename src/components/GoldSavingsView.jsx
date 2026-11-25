import React, { useState, useMemo } from 'react';
import { usePocket } from '../context/PocketContext';
import { formatIdr, formatDateIndo } from '../utils/formatters';
import confetti from 'canvas-confetti';
import {
  Coins,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Target,
  Check,
  X,
  RefreshCw,
  ExternalLink,
  Table as TableIcon,
  Calculator
} from 'lucide-react';
import { GALERI24_DEFAULT_PRICE_TABLE } from '../data/initialData';
import PegadaianGoldChart from './PegadaianGoldChart';

export default function GoldSavingsView() {
  const {
    goldSavings,
    calculations,
    addGoldDeposit,
    deleteGoldDeposit,
    updateGoldTarget,
    updateGaleri24Prices,
    refreshLiveGoldPrices,
    isFetchingGoldPrice,
    setGoldValuationMode
  } = usePocket();

  const { gold } = calculations;

  const [toastMessage, setToastMessage] = useState(null);
  const [calcMode, setCalcMode] = useState('grams');
  const [calcInputGrams, setCalcInputGrams] = useState('5');
  const [calcInputIdr, setCalcInputIdr] = useState('10000000');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPriceTableModalOpen, setIsPriceTableModalOpen] = useState(false);
  const [isPriceUpdateModalOpen, setIsPriceUpdateModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);

  // Add Gold Form States
  const [contributor, setContributor] = useState('berdua');
  const [keping, setKeping] = useState('1');
  const [selectedPecahan, setSelectedPecahan] = useState(1);
  const [customPecahan, setCustomPecahan] = useState('');
  const [isCustomPecahan, setIsCustomPecahan] = useState(false);
  const [amountIdr, setAmountIdr] = useState('');
  const [place, setPlace] = useState('Galeri 24 Resmi');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [serialNumber, setSerialNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Modal Input States
  const [sellPriceInput, setSellPriceInput] = useState(gold.pricePerGram.toString());
  const [buybackPriceInput, setBuybackPriceInput] = useState((gold.buybackPerGram || 2322000).toString());
  const [dateLabelInput, setDateLabelInput] = useState(gold.lastUpdatedLabel || 'Hari Ini (galeri24.co.id)');
  const [targetInput, setTargetInput] = useState(gold.targetGrams.toString());

  const effectivePecahan = isCustomPecahan ? parseFloat(customPecahan) || 0 : selectedPecahan;
  const effectiveKeping = parseInt(keping, 10) || 1;
  const calculatedTotalGrams = effectiveKeping * effectivePecahan || 0;

  const catalogEntry = (gold.priceTable || GALERI24_DEFAULT_PRICE_TABLE).find(
    (p) => Math.abs(p.grams - effectivePecahan) < 0.001
  );

  const handleOpenAddModal = (initialPecahan = 1) => {
    setContributor('berdua');
    setKeping('1');
    setSelectedPecahan(initialPecahan);
    setIsCustomPecahan(false);
    setCustomPecahan('');

    const cat = (gold.priceTable || GALERI24_DEFAULT_PRICE_TABLE).find((p) => p.grams === initialPecahan);
    if (cat) {
      setAmountIdr(cat.sell.toString());
    } else {
      setAmountIdr(Math.round(initialPecahan * gold.pricePerGram).toString());
    }

    setPlace('Galeri 24 Resmi');
    setDate(new Date().toISOString().split('T')[0]);
    setSerialNumber('');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleSelectPecahan = (grams) => {
    setSelectedPecahan(grams);
    setIsCustomPecahan(false);
    const cat = (gold.priceTable || GALERI24_DEFAULT_PRICE_TABLE).find((p) => p.grams === grams);
    const qty = parseInt(keping, 10) || 1;
    if (cat) {
      setAmountIdr((cat.sell * qty).toString());
    } else {
      setAmountIdr(Math.round(grams * qty * gold.pricePerGram).toString());
    }
  };

  const handleKepingChange = (newQtyStr) => {
    setKeping(newQtyStr);
    const qty = parseInt(newQtyStr, 10) || 1;
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

    const totalCost = parseFloat(amountIdr) || calculatedTotalGrams * gold.pricePerGram;
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
        particleCount: 45,
        spread: 65,
        origin: { y: 0.8 },
        colors: ['#fbbf24', '#f59e0b', '#fef08a']
      });
    } catch (err) {}

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

  const handleAutoFetch = async () => {
    if (isFetchingGoldPrice) return;
    try {
      const res = await refreshLiveGoldPrices(true);
      if (res && res.success) {
        setToastMessage(
          `Berhasil memperbarui harga Galeri 24: Rp ${(res.sellPrice || 2467000).toLocaleString('id-ID')}/gr · Buyback Rp ${(res.buybackPrice || 2322000).toLocaleString('id-ID')}/gr`
        );
        setTimeout(() => setToastMessage(null), 5000);
      } else {
        setToastMessage('Tidak dapat terhubung ke web Galeri 24. Menggunakan acuan resmi tersimpan.');
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (e) {
      setToastMessage('Terjadi kendala saat menghubungkan ke Galeri 24.');
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const contributorStats = useMemo(() => {
    let sharedGrams = 0;
    (goldSavings.transactions || []).forEach((tx) => {
      if (tx.contributor !== 'yasmeen' && tx.contributor !== 'adziima') {
        sharedGrams += parseFloat(tx.grams) || 0;
      }
    });
    return {
      shared: { grams: sharedGrams, value: sharedGrams * gold.activeValuationPrice }
    };
  }, [goldSavings.transactions, gold.activeValuationPrice]);

  const calcResult = useMemo(() => {
    if (calcMode === 'grams') {
      const grams = parseFloat(calcInputGrams) || 0;
      const matchRow = (gold.priceTable || GALERI24_DEFAULT_PRICE_TABLE).find(
        (p) => Math.abs(p.grams - grams) < 0.001
      );
      const sellTotal = matchRow ? matchRow.sell : Math.round(grams * gold.pricePerGram);
      const buybackTotal = matchRow
        ? matchRow.buyback
        : Math.round(grams * (gold.buybackPerGram || 2363000));
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
      const gramsGot = gold.pricePerGram > 0 ? budget / gold.pricePerGram : 0;
      const buybackYield = Math.round(gramsGot * (gold.buybackPerGram || 2363000));
      return {
        budget,
        gramsGot: Math.round(gramsGot * 100) / 100,
        buybackYield
      };
    }
  }, [calcMode, calcInputGrams, calcInputIdr, gold.pricePerGram, gold.buybackPerGram, gold.priceTable]);

  return (
    <div style={{ width: '100%' }}>
      {/* BAND 1: Full-Width Gold Context Header */}
      <header className="hq-context-bar">
        <div className="hq-context-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#b45309'
              }}
            >
              <Coins size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem' }}>
                  Aset Emas Galeri 24
                </span>
                <span className="hq-badge hq-badge-green">
                  <span className="hq-status-dot online" />
                  Live galeri24.co.id
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Acuan: {gold.lastUpdatedLabel || 'Galeri 24 Resmi'} · Jual{' '}
                <strong>{formatIdr(gold.pricePerGram)}/gr</strong> · Buyback{' '}
                <strong>{formatIdr(gold.buybackPerGram)}/gr</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="hq-context-actions">
          <div className="hq-segmented">
            <button
              type="button"
              onClick={() => setGoldValuationMode('sell')}
              className={`hq-segmented-btn ${!isBuybackMode ? 'active' : ''}`}
            >
              Nilai Toko
            </button>
            <button
              type="button"
              onClick={() => setGoldValuationMode('buyback')}
              className={`hq-segmented-btn ${isBuybackMode ? 'active' : ''}`}
            >
              Nilai Cair
            </button>
          </div>

          <button
            type="button"
            className="hq-btn"
            onClick={handleAutoFetch}
            disabled={isFetchingGoldPrice}
            title="Tarik harga live dari galeri24.co.id"
          >
            <RefreshCw size={14} className={isFetchingGoldPrice ? 'animate-spin' : ''} />
            <span>{isFetchingGoldPrice ? 'Menarik...' : 'Update Harga'}</span>
          </button>

          <button
            type="button"
            className="hq-btn"
            onClick={() => setIsPriceTableModalOpen(true)}
          >
            <TableIcon size={14} />
            <span>Tabel Resmi</span>
          </button>

          <button
            type="button"
            className="hq-btn"
            onClick={() => {
              setTargetInput(gold.targetGrams.toString());
              setIsTargetModalOpen(true);
            }}
          >
            <Target size={14} />
            <span>Target</span>
          </button>

          <button
            type="button"
            className="hq-btn hq-btn-gold"
            onClick={() => handleOpenAddModal(1)}
          >
            <Plus size={15} />
            <span>Catat Emas</span>
          </button>
        </div>
      </header>

      {/* Live Toast Strip */}
      {toastMessage && (
        <div className={`hq-alert-strip ${toastMessage.startsWith('Berhasil') ? 'success' : 'warn'}`}>
          <span>{toastMessage}</span>
          <button type="button" className="hq-btn-icon" onClick={() => setToastMessage(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* BAND 2: Edge-to-Edge 4-Column KPI Strip */}
      <section className="hq-kpi-strip cols-4">
        <div className="hq-kpi-cell tint-gold">
          <div className="hq-kpi-label">
            <span style={{ color: '#b45309' }}>Total Gramasi</span>
            <Coins size={15} color="#d97706" />
          </div>
          <div className="hq-kpi-value" style={{ color: '#92400e' }}>
            {gold.totalGrams.toFixed(2)} <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>gr</span>
          </div>
          <div className="hq-kpi-meta">
            <span>{gold.totalKeping} keping fisik</span>
            <span className="hq-badge hq-badge-amber">24K · 999.9</span>
          </div>
        </div>

        <div className="hq-kpi-cell tint-orange">
          <div className="hq-kpi-label">
            <span style={{ color: '#c2410c' }}>{isBuybackMode ? 'Nilai Cair (Buyback)' : 'Nilai Pasar Kini'}</span>
          </div>
          <div className="hq-kpi-value" style={{ color: '#b45309' }}>{formatIdr(gold.currentAssetValueIdr)}</div>
          <div className="hq-kpi-meta">
            <span>Acuan: {formatIdr(gold.activeValuationPrice)}/gr</span>
          </div>
        </div>

        <div className={`hq-kpi-cell ${isProfit ? 'tint-green' : 'tint-rose'}`}>
          <div className="hq-kpi-label">
            <span style={{ color: isProfit ? '#059669' : '#e11d48' }}>Tren Untung / Rugi</span>
            {isProfit ? <TrendingUp size={15} color="#059669" /> : <TrendingDown size={15} color="#e11d48" />}
          </div>
          <div className="hq-kpi-value" style={{ color: isProfit ? '#059669' : '#e11d48' }}>
            {gold.totalGoldSpentIdr > 0
              ? `${isProfit ? '+' : ''}${formatIdr(gold.profitLossIdr)}`
              : 'Rp 0'}
          </div>
          <div className="hq-kpi-meta">
            <span>
              Modal: {formatIdr(gold.totalGoldSpentIdr)}
            </span>
            {gold.totalGoldSpentIdr > 0 && (
              <span className={`hq-badge ${isProfit ? 'hq-badge-green' : 'hq-badge-red'}`}>
                {isProfit ? '+' : ''}
                {gold.profitLossPercent}%
              </span>
            )}
          </div>
        </div>

        <div className="hq-kpi-cell tint-purple">
          <div className="hq-kpi-label">
            <span style={{ color: '#7c3aed' }}>Target Berdua</span>
            <Target size={15} color="#7c3aed" />
          </div>
          <div className="hq-kpi-value" style={{ color: '#6d28d9' }}>
            {gold.progressPercent}%
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
              / {gold.targetGrams} gr
            </span>
          </div>
          <div style={{ marginTop: '0.55rem' }}>
            <div className="hq-progress-track">
              <div
                className="hq-progress-fill"
                style={{ width: `${gold.progressPercent}%`, background: 'linear-gradient(90deg, #f59e0b, #8b5cf6)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* BAND 3: Edge-to-Edge Contributor Breakdown Strip */}
      <section className="hq-kpi-strip cols-3">
        <div className="hq-kpi-cell" style={{ paddingTop: '0.9rem', paddingBottom: '0.9rem', background: '#fdf2f8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#9d174d', textTransform: 'uppercase' }}>
              Disetor Yasmeen
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: '#db2777' }}>
              {gold.yasmeenContributedGrams.toFixed(2)} gr
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#be185d', opacity: 0.85, marginTop: '0.15rem' }} className="tabular-nums">
            ≈ {formatIdr(gold.yasmeenContributedValueIdr || 0)}
          </div>
        </div>

        <div className="hq-kpi-cell" style={{ paddingTop: '0.9rem', paddingBottom: '0.9rem', background: '#f0f9ff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>
              Disetor Adziima
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: '#0284c7' }}>
              {gold.adziimaContributedGrams.toFixed(2)} gr
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#0369a1', opacity: 0.85, marginTop: '0.15rem' }} className="tabular-nums">
            ≈ {formatIdr(gold.adziimaContributedValueIdr || 0)}
          </div>
        </div>

        <div className="hq-kpi-cell" style={{ paddingTop: '0.9rem', paddingBottom: '0.9rem', background: '#fffbeb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>
              Patungan Berdua (50:50)
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: '#b45309' }}>
              {contributorStats.shared.grams.toFixed(2)} gr
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#b45309', opacity: 0.85, marginTop: '0.15rem' }} className="tabular-nums">
            ≈ {formatIdr(contributorStats.shared.value || 0)} · Avg beli{' '}
            {gold.totalGrams > 0 ? `${formatIdr(Math.round(gold.avgBuyPricePerGram))}/gr` : '-'}
          </div>
        </div>
      </section>

      {/* BAND 4: 2-Column Full-Width Split — Live Chart | Investment Simulator */}
      <section className="hq-split-2">
        <div className="hq-split-col">
          <PegadaianGoldChart
            history={gold.pegadaianHistory}
            currentSellPricePerGram={gold.pricePerGram || 2467000}
            currentBuybackPricePerGram={gold.buybackPerGram || 2322000}
            lastUpdatedLabel={
              gold.lastUpdatedLabel ||
              new Date().toLocaleDateString('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })
            }
            onRefresh={handleAutoFetch}
            isRefreshing={isFetchingGoldPrice}
          />
        </div>

        <div className="hq-split-col">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.6rem',
              marginBottom: '1rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Calculator size={15} color="#b45309" />
                <h3 className="hq-section-title">Kalkulator & Simulasi</h3>
              </div>
              <p className="hq-section-subtitle">Bandingkan harga beli vs pencairan buyback</p>
            </div>

            <div className="hq-segmented">
              <button
                type="button"
                onClick={() => setCalcMode('grams')}
                className={`hq-segmented-btn ${calcMode === 'grams' ? 'active' : ''}`}
              >
                Gram
              </button>
              <button
                type="button"
                onClick={() => setCalcMode('idr')}
                className={`hq-segmented-btn ${calcMode === 'idr' ? 'active' : ''}`}
              >
                Budget Rp
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
            <input
              type="number"
              value={calcMode === 'grams' ? calcInputGrams : calcInputIdr}
              onChange={(e) =>
                calcMode === 'grams' ? setCalcInputGrams(e.target.value) : setCalcInputIdr(e.target.value)
              }
              placeholder={calcMode === 'grams' ? 'Contoh: 5' : 'Contoh: 10000000'}
              className="hq-input-inline"
              style={{ flex: 1, fontWeight: 700, fontSize: '0.95rem' }}
            />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {calcMode === 'grams' ? 'gram' : 'IDR'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {calcMode === 'grams'
              ? [0.5, 1, 2, 5, 10, 25].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setCalcInputGrams(g.toString())}
                    className={`hq-btn ${parseFloat(calcInputGrams) === g ? 'hq-btn-gold' : ''}`}
                    style={{ padding: '0.28rem 0.55rem', fontSize: '0.74rem' }}
                  >
                    {g} gr
                  </button>
                ))
              : [
                  { label: '1 Jt', val: 1000000 },
                  { label: '2.5 Jt', val: 2500000 },
                  { label: '5 Jt', val: 5000000 },
                  { label: '10 Jt', val: 10000000 },
                  { label: '25 Jt', val: 25000000 }
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setCalcInputIdr(p.val.toString())}
                    className={`hq-btn ${parseFloat(calcInputIdr) === p.val ? 'hq-btn-gold' : ''}`}
                    style={{ padding: '0.28rem 0.55rem', fontSize: '0.74rem' }}
                  >
                    {p.label}
                  </button>
                ))}
          </div>

          {/* Flat Hairline Simulation Output */}
          <div style={{ borderTop: '1px solid var(--border-line)', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {calcMode === 'grams' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Estimasi Beli (Toko)</span>
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: '#92400e' }} className="tabular-nums">
                    {formatIdr(calcResult.sellTotal)}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Nilai Cair (Buyback)</span>
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: '#059669' }} className="tabular-nums">
                    {formatIdr(calcResult.buybackTotal)}
                  </strong>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Spread Jual-Beli ({calcResult.spreadPercent}%)
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#b45309' }} className="tabular-nums">
                    {formatIdr(calcResult.spread)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Perolehan Emas</span>
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#92400e' }} className="tabular-nums">
                    {calcResult.gramsGot} gram
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Nilai Buyback Hari Ini</span>
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: '#059669' }} className="tabular-nums">
                    {formatIdr(calcResult.buybackYield)}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal(calcResult.gramsGot >= 1 ? Math.floor(calcResult.gramsGot) : 1)}
                  className="hq-btn hq-btn-gold"
                  style={{ width: '100%', marginTop: '0.35rem' }}
                >
                  <Plus size={14} />
                  <span>Catat Pembelian Ini</span>
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* BAND 5: Full-Width Gold Holdings Ledger */}
      <section>
        <div className="hq-section-header">
          <div>
            <h2 className="hq-section-title">Daftar Emas Batangan Galeri 24 Berdua</h2>
            <p className="hq-section-subtitle">
              {(goldSavings.transactions || []).length} catatan kepingan emas batangan dan pergerakan nilainya
            </p>
          </div>

          <button
            type="button"
            className="hq-btn hq-btn-gold"
            onClick={() => handleOpenAddModal(1)}
          >
            <Plus size={14} />
            <span>Tambah Keping</span>
          </button>
        </div>

        {(goldSavings.transactions || []).length === 0 ? (
          <div className="hq-empty">
            <p style={{ fontWeight: 800, color: 'var(--text-main)' }}>
              Belum ada koleksi emas batangan tercatat
            </p>
            <p style={{ fontSize: '0.82rem', maxWidth: '420px', margin: '0.35rem auto 1rem' }}>
              Catat pembelian emas batangan Galeri 24 untuk memantau kenaikan nilai aset setiap hari.
            </p>
            <button type="button" className="hq-btn hq-btn-gold" onClick={() => handleOpenAddModal(1)}>
              <Plus size={15} />
              <span>Catat Keping Pertama</span>
            </button>
          </div>
        ) : (
          <div className="hq-ledger">
            {(goldSavings.transactions || []).map((entry) => {
              const itemKeping = parseInt(entry.keping, 10) || 1;
              const itemGrams = parseFloat(entry.grams) || 0;
              const itemPecahan = entry.pecahan || (itemKeping > 0 ? itemGrams / itemKeping : itemGrams);
              const itemSpent = parseFloat(entry.amountIdr) || 0;

              const matchRow = (gold.priceTable || GALERI24_DEFAULT_PRICE_TABLE).find(
                (p) => Math.abs(p.grams - itemPecahan) < 0.001
              );
              const unitCurrentPrice = matchRow
                ? isBuybackMode
                  ? matchRow.buyback
                  : matchRow.sell
                : itemPecahan * gold.activeValuationPrice;
              const itemCurrentValue = unitCurrentPrice * itemKeping;

              const itemProfit = itemCurrentValue - itemSpent;
              const itemProfitPercent =
                itemSpent > 0 ? Math.round((itemProfit / itemSpent) * 100 * 10) / 10 : 0;
              const itemAvgBuyPrice = itemGrams > 0 ? Math.round(itemSpent / itemGrams) : 0;

              const contributorLabel =
                entry.contributor === 'yasmeen'
                  ? 'Yasmeen'
                  : entry.contributor === 'adziima'
                  ? 'Adziima'
                  : 'Patungan Berdua (50:50)';
              const contributorColor =
                entry.contributor === 'yasmeen'
                  ? '#db2777'
                  : entry.contributor === 'adziima'
                  ? '#0284c7'
                  : '#b45309';

              return (
                <div key={entry.id} className="hq-ledger-row">
                  <div className="hq-ledger-left">
                    <div
                      className="hq-ledger-icon"
                      style={{ background: '#fffbeb', borderColor: '#fde68a' }}
                    >
                      <Coins size={17} color="#b45309" />
                    </div>

                    <div className="hq-ledger-body">
                      <div className="hq-ledger-title">
                        <span>
                          {itemKeping} Keping · {itemGrams} gram Emas Batangan
                        </span>
                        <span className="hq-badge hq-badge-amber">Pecahan {itemPecahan} gr</span>
                        <span className="hq-badge hq-badge-slate">{entry.place || 'Galeri 24'}</span>
                      </div>

                      <div className="hq-ledger-meta">
                        <span>{formatDateIndo(entry.date)}</span>
                        <span>·</span>
                        <span style={{ color: contributorColor, fontWeight: 700 }}>{contributorLabel}</span>
                        {entry.serialNumber && (
                          <>
                            <span>·</span>
                            <span style={{ fontFamily: 'var(--font-mono)' }}>Seri: {entry.serialNumber}</span>
                          </>
                        )}
                        {entry.notes && (
                          <>
                            <span>·</span>
                            <span style={{ fontStyle: 'italic' }}>&quot;{entry.notes}&quot;</span>
                          </>
                        )}
                      </div>

                      <div className="hq-ledger-meta" style={{ marginTop: '0.25rem' }}>
                        <span>
                          Modal: <strong>{formatIdr(itemSpent)}</strong> (@ {formatIdr(itemAvgBuyPrice)}/gr)
                        </span>
                        <span>·</span>
                        <span style={{ fontWeight: 700, color: itemProfit >= 0 ? '#059669' : '#e11d48' }}>
                          {itemProfit >= 0 ? '▲ +' : '▼ '}
                          {formatIdr(itemProfit)} ({itemProfit >= 0 ? '+' : ''}
                          {itemProfitPercent}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hq-ledger-right">
                    <div style={{ textAlign: 'right' }}>
                      <div className="hq-ledger-amount" style={{ color: '#b45309' }}>
                        {formatIdr(itemCurrentValue)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        {isBuybackMode ? 'Nilai Buyback' : 'Nilai Pasar'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus catatan emas ${itemKeping} keping (${itemGrams} gr)?`)) {
                          deleteGoldDeposit(entry.id);
                        }
                      }}
                      className="hq-btn-icon danger"
                      title="Hapus Keping Ini"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal: Add Gold Bar */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Catat Emas Batangan Galeri 24</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitDeposit}>
              <div className="form-group">
                <label className="form-label">Kepemilikan / Pembeli</label>
                <select className="form-select" value={contributor} onChange={(e) => setContributor(e.target.value)}>
                  <option value="berdua">Patungan Berdua (50:50)</option>
                  <option value="yasmeen">Yasmeen</option>
                  <option value="adziima">Adziima</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Pecahan Emas per Keping</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  {(gold.priceTable || GALERI24_DEFAULT_PRICE_TABLE).map((p) => (
                    <button
                      type="button"
                      key={p.grams}
                      onClick={() => handleSelectPecahan(p.grams)}
                      className={`hq-btn ${!isCustomPecahan && selectedPecahan === p.grams ? 'hq-btn-gold' : ''}`}
                      style={{ padding: '0.4rem 0.2rem', fontSize: '0.78rem' }}
                    >
                      {p.grams} gr
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsCustomPecahan(true)}
                    className={`hq-btn ${isCustomPecahan ? 'hq-btn-gold' : ''}`}
                    style={{ fontSize: '0.76rem' }}
                  >
                    Pecahan Lain
                  </button>

                  {isCustomPecahan && (
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      placeholder="Contoh: 0.25"
                      value={customPecahan}
                      onChange={(e) => setCustomPecahan(e.target.value)}
                      style={{ flex: 1, padding: '0.42rem 0.65rem', fontSize: '0.85rem' }}
                      autoFocus
                    />
                  )}
                </div>
              </div>

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
                  <label className="form-label">Total Gramasi</label>
                  <div
                    style={{
                      padding: '0.62rem 0.85rem',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-line)',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 800,
                      color: '#92400e',
                      textAlign: 'center'
                    }}
                  >
                    {calculatedTotalGrams.toFixed(2)} gram
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Total Harga Beli (Rp) *</label>
                  {catalogEntry && (
                    <button
                      type="button"
                      onClick={() => setAmountIdr((catalogEntry.sell * (parseInt(keping, 10) || 1)).toString())}
                      style={{ background: 'transparent', border: 'none', color: '#b45309', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Pakai katalog ({formatIdr(catalogEntry.sell * (parseInt(keping, 10) || 1))})
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  className="form-input"
                  value={amountIdr}
                  onChange={(e) => setAmountIdr(e.target.value)}
                  required
                />
                {Boolean(amountIdr && calculatedTotalGrams > 0) && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Rata-rata beli: <strong>{formatIdr(Math.round(parseFloat(amountIdr) / calculatedTotalGrams))}/gr</strong>
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tempat Beli</label>
                  <select className="form-select" value={place} onChange={(e) => setPlace(e.target.value)}>
                    <option value="Galeri 24 Resmi">Galeri 24 Resmi</option>
                    <option value="Outlet Galeri 24 Mall">Outlet Galeri 24 Mall</option>
                    <option value="Pegadaian Galeri 24">Pegadaian Galeri 24</option>
                    <option value="Antam / Butik LM">Antam / Butik LM</option>
                    <option value="Toko Emas Lokal">Toko Emas Lokal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tanggal Beli</label>
                  <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nomor Seri / Sertifikat (Opsional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: G24-098231"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Catatan Tambahan</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Catatan singkat..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button type="submit" className="submit-btn gold">
                <Check size={16} />
                <span>Simpan Keping Emas</span>
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
              <div>
                <h3 style={{ margin: 0 }}>Daftar Harga Emas Galeri 24 Resmi</h3>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  galeri24.co.id/harga-emas · {gold.lastUpdatedLabel}
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsPriceTableModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ maxHeight: '360px', overflowY: 'auto', border: '1px solid var(--border-line)', borderRadius: 'var(--radius-md)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-line)' }}>
                    <th style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>Gramasi</th>
                    <th style={{ padding: '0.6rem 0.8rem', fontWeight: 700, color: '#b45309' }}>Harga Jual</th>
                    <th style={{ padding: '0.6rem 0.8rem', fontWeight: 700, color: '#0284c7' }}>Buyback</th>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center', fontWeight: 700 }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {(gold.priceTable || GALERI24_DEFAULT_PRICE_TABLE).map((row) => (
                    <tr key={row.grams} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.55rem 0.8rem', fontWeight: 700 }}>{row.grams} gr</td>
                      <td style={{ padding: '0.55rem 0.8rem', fontWeight: 700, color: '#92400e' }} className="tabular-nums">
                        {formatIdr(row.sell)}
                      </td>
                      <td style={{ padding: '0.55rem 0.8rem', color: '#0284c7' }} className="tabular-nums">
                        {formatIdr(row.buyback)}
                      </td>
                      <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setIsPriceTableModalOpen(false);
                            handleOpenAddModal(row.grams);
                          }}
                          className="hq-btn"
                          style={{ padding: '0.22rem 0.55rem', fontSize: '0.72rem' }}
                        >
                          + Beli
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                className="hq-btn"
                onClick={() => {
                  setIsPriceTableModalOpen(false);
                  setIsPriceUpdateModalOpen(true);
                }}
              >
                Input Harga Manual
              </button>

              <a
                href="https://galeri24.co.id/harga-emas"
                target="_blank"
                rel="noopener noreferrer"
                className="hq-btn"
              >
                <span>Buka galeri24.co.id</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Manual Price Update */}
      {isPriceUpdateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPriceUpdateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3>Perbarui Harga Manual</h3>
              <button className="modal-close-btn" onClick={() => setIsPriceUpdateModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePrices}>
              <div className="form-group">
                <label className="form-label">Harga Jual (1 gr) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={sellPriceInput}
                  onChange={(e) => setSellPriceInput(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Harga Buyback (1 gr) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={buybackPriceInput}
                  onChange={(e) => setBuybackPriceInput(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Label Tanggal</label>
                <input
                  type="text"
                  className="form-input"
                  value={dateLabelInput}
                  onChange={(e) => setDateLabelInput(e.target.value)}
                />
              </div>

              <button type="submit" className="submit-btn gold">
                <Check size={16} />
                <span>Simpan Harga</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Target Emas */}
      {isTargetModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTargetModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
            <div className="modal-header">
              <h3>Atur Target Emas Berdua</h3>
              <button className="modal-close-btn" onClick={() => setIsTargetModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveTarget}>
              <div className="form-group">
                <label className="form-label">Target Emas (Gram)</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  autoFocus
                  required
                />
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  Terkumpul saat ini: {gold.totalGrams.toFixed(2)} gram ({gold.totalKeping} keping)
                </div>
              </div>

              <button type="submit" className="submit-btn gold">
                <Check size={16} />
                <span>Simpan Target</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
