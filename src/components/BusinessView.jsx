import React, { useState, useMemo } from 'react';
import { usePocket } from '../context/PocketContext';
import { formatIdr, formatDateIndo } from '../utils/formatters';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ShoppingBag,
  Store,
  Video,
  Users,
  Plus,
  Trash2,
  TrendingUp,
  Target,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Package,
  Layers,
  Calculator,
  RotateCcw,
  DollarSign,
  PieChart,
  HelpCircle,
  Percent,
  Truck,
  ArrowRight,
  Info,
  Calendar,
  X,
  FileSpreadsheet
} from 'lucide-react';

export default function BusinessView({ onOpenCloudModal }) {
  const {
    setActiveView,
    business,
    businessCalculations,
    recordBusinessSale,
    deleteBusinessSale,
    addBusinessExpense,
    deleteBusinessExpense,
    updateConsignmentStock,
    updateBusinessBatch,
    updateBusinessSettings,
    isCloudConnected,
    isCloudSyncing
  } = usePocket();

  // Active Tab
  const [activeTab, setActiveTab] = useState('channels'); // 'channels' | 'calculator' | 'ledger' | 'partnership'

  // Modals state
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isConsignmentModalOpen, setIsConsignmentModalOpen] = useState(false);
  const [isEditBatchOpen, setIsEditBatchOpen] = useState(false);

  // Form states - Quick Sale
  const [saleChannel, setSaleChannel] = useState('cfd'); // 'cfd' | 'live' | 'saudara' | 'lainnya'
  const [salePcs, setSalePcs] = useState('1');
  const [salePricePerPcs, setSalePricePerPcs] = useState('120000');
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [saleBuyerOrNote, setSaleBuyerOrNote] = useState('');
  const [saleSeller, setSaleSeller] = useState('berdua');

  // Form states - Expense
  const [expChannel, setExpChannel] = useState('cfd');
  const [expCategory, setExpCategory] = useState('sewa_lapak');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expNotes, setExpNotes] = useState('');

  // Form states - Consignment Action
  const [csgActionType, setCsgActionType] = useState('sold'); // 'sold' | 'give' | 'return'
  const [csgPcs, setCsgPcs] = useState('1');
  const [csgPrice, setCsgPrice] = useState('120000');
  const [csgPaidAmount, setCsgPaidAmount] = useState('');
  const [csgNotes, setCsgNotes] = useState('');

  // Form states - Edit Batch
  const [batchPcsInput, setBatchPcsInput] = useState('50');
  const [batchWeightInput, setBatchWeightInput] = useState('35');
  const [batchPriceChinaInput, setBatchPriceChinaInput] = useState('63200');
  const [batchShippingKgInput, setBatchShippingKgInput] = useState('3700');
  const [batchOtherCostsInput, setBatchOtherCostsInput] = useState('0');
  const [batchTargetSellPriceInput, setBatchTargetSellPriceInput] = useState('120000');

  // Destructure calculations
  const calc = businessCalculations || {};
  const currentBatch = calc.currentBatch || {};
  const sales = business?.sales || [];
  const expenses = business?.expenses || [];
  const consignments = business?.consignments || [];
  const consignment1 = consignments[0] || {};

  // Handle Quick Add Sale
  const handleSaveSale = (e) => {
    e.preventDefault();
    const pcsNum = parseInt(salePcs, 10) || 1;
    const priceNum = parseFloat(salePricePerPcs) || 120000;

    recordBusinessSale({
      batchId: currentBatch.id || 'batch-1',
      channel: saleChannel,
      date: saleDate,
      pcs: pcsNum,
      pricePerPcs: priceNum,
      buyerOrNote: saleBuyerOrNote,
      seller: saleSeller
    });

    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
    } catch (err) {}

    setIsAddSaleOpen(false);
    setSalePcs('1');
    setSaleBuyerOrNote('');
  };

  // Handle Add Expense
  const handleSaveExpense = (e) => {
    e.preventDefault();
    const amt = parseFloat(expAmount) || 0;
    if (amt <= 0) return;

    addBusinessExpense({
      batchId: currentBatch.id || 'batch-1',
      channel: expChannel,
      category: expCategory,
      amountIdr: amt,
      date: expDate,
      notes: expNotes
    });

    setIsAddExpenseOpen(false);
    setExpAmount('');
    setExpNotes('');
  };

  // Handle Consignment Action
  const handleSaveConsignmentAction = (e) => {
    e.preventDefault();
    const pcsNum = parseInt(csgPcs, 10) || 0;
    const priceNum = parseFloat(csgPrice) || 120000;

    if (csgActionType === 'sold') {
      const paid = csgPaidAmount ? parseFloat(csgPaidAmount) : (pcsNum * priceNum);
      updateConsignmentStock({
        consignmentId: consignment1.id || 'csg-1',
        deltaSold: pcsNum,
        deltaPaid: paid,
        notes: csgNotes ? `${consignment1.notes || ''} | ${csgNotes}` : consignment1.notes
      });
      // Also record into sales so omzet reflects
      recordBusinessSale({
        batchId: currentBatch.id || 'batch-1',
        channel: 'saudara',
        date: new Date().toISOString().split('T')[0],
        pcs: pcsNum,
        pricePerPcs: priceNum,
        buyerOrNote: `Setoran Saudara: ${csgNotes || 'Laku terjual'}`,
        seller: 'saudara'
      });
    } else if (csgActionType === 'give') {
      updateConsignmentStock({
        consignmentId: consignment1.id || 'csg-1',
        deltaGiven: pcsNum,
        notes: csgNotes ? `${consignment1.notes || ''} | Tambah titipan: ${csgNotes}` : consignment1.notes
      });
    } else if (csgActionType === 'return') {
      updateConsignmentStock({
        consignmentId: consignment1.id || 'csg-1',
        deltaReturned: pcsNum,
        notes: csgNotes ? `${consignment1.notes || ''} | Retur barang: ${csgNotes}` : consignment1.notes
      });
    }

    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } catch (err) {}

    setIsConsignmentModalOpen(false);
    setCsgPcs('1');
    setCsgPaidAmount('');
    setCsgNotes('');
  };

  // Handle Save Batch Settings
  const handleSaveBatch = (e) => {
    e.preventDefault();
    updateBusinessBatch(currentBatch.id || 'batch-1', {
      totalPcs: parseInt(batchPcsInput, 10) || 50,
      weightKg: parseFloat(batchWeightInput) || 35,
      pricePerPcsChina: parseFloat(batchPriceChinaInput) || 63200,
      shippingCostPerKg: parseFloat(batchShippingKgInput) || 3700,
      otherCosts: parseFloat(batchOtherCostsInput) || 0,
      targetSellPrice: parseFloat(batchTargetSellPriceInput) || 120000
    });
    setIsEditBatchOpen(false);
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0.8rem 1rem 5rem' }}>
      {/* 1. TOP HEADER & NAVIGATION */}
      <header
        style={{
          background: 'linear-gradient(135deg, #f5f3ff 0%, #faf5ff 50%, #fdf2f8 100%)',
          borderRadius: '24px',
          border: '1.5px solid #e9d5ff',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 8px 24px rgba(168, 85, 247, 0.08)',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              onClick={() => setActiveView('landing')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#ffffff',
                border: '1.5px solid #ddd6fe',
                color: '#7c3aed',
                padding: '0.55rem 0.95rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.06)'
              }}
            >
              <ArrowLeft size={16} />
              <span>Halaman Utama</span>
            </button>

            <div style={{ width: '1px', height: '24px', background: '#e9d5ff' }} />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.25rem' }}>👗</span>
                <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#6b21a8', letterSpacing: '-0.02em' }}>
                  Pocket Bisnis Baju
                </h1>
                <span
                  style={{
                    background: '#ede9fe',
                    color: '#6d28d9',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid #c4b5fd'
                  }}
                >
                  Yasmeen & Adziima
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#7e22ce', fontWeight: 600, marginTop: '0.15rem' }}>
                Impor Baju China ➔ Bandung ➔ Padang · Sistem Multi-Jalur & Konsinyasi
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsAddSaleOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                padding: '0.6rem 1.1rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={16} />
              <span>Catat Penjualan</span>
            </button>

            <button
              onClick={() => {
                setCsgActionType('sold');
                setIsConsignmentModalOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#ffffff',
                color: '#6d28d9',
                border: '1.5px solid #c4b5fd',
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <Users size={15} color="#7c3aed" />
              <span>Setoran Saudara</span>
            </button>

            <button
              onClick={() => setIsAddExpenseOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#ffffff',
                color: '#dc2626',
                border: '1.5px solid #fecaca',
                padding: '0.6rem 0.95rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
              title="Catat Biaya Sewa CFD, Kantong, Transport, dll"
            >
              <TrendingUp size={15} style={{ transform: 'rotate(180deg)' }} />
              <span>Biaya Operasional</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. FOUR HERO METRICS CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Card 1: Total Omzet & Pcs Terjual */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '1.3rem 1.4rem',
            border: '1.5px solid #e9d5ff',
            boxShadow: '0 4px 16px rgba(124, 58, 237, 0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Omzet Penjualan
            </span>
            <span style={{ background: '#f5f3ff', padding: '0.35rem', borderRadius: '10px' }}>
              <ShoppingBag size={18} color="#7c3aed" />
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, color: '#581c87', marginTop: '0.4rem' }}>
            {formatIdr(calc.totalRevenue || 0)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontWeight: 800, color: '#059669' }}>
              {calc.totalPcsSold || 0} pcs terjual
            </span>
            <span>•</span>
            <span>dari total {calc.totalStock || 50} pcs bal</span>
          </div>
        </div>

        {/* Card 2: Modal Bal & Status BEP (Balik Modal) */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '1.3rem 1.4rem',
            border: '1.5px solid #fed7aa',
            boxShadow: '0 4px 16px rgba(249, 115, 22, 0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Modal & Status Balik Modal (BEP)
            </span>
            <span style={{ background: '#fff7ed', padding: '0.35rem', borderRadius: '10px' }}>
              <Target size={18} color="#ea580c" />
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, color: '#9a3412', marginTop: '0.4rem' }}>
            {formatIdr(calc.totalCapitalCost || 3289500)}
          </div>
          <div style={{ marginTop: '0.45rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 800, color: '#9a3412', marginBottom: '0.25rem' }}>
              <span>Target BEP: {calc.bepPcs || 28} pcs (56%)</span>
              <span>{calc.bepPercent || 0}% Terpenuhi</span>
            </div>
            <div style={{ height: '7px', background: '#ffedd5', borderRadius: '10px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${calc.bepPercent || 0}%`,
                  background: 'linear-gradient(90deg, #f97316 0%, #ea580c 100%)',
                  borderRadius: '10px',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Laba Bersih & Bagi Hasil */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '1.3rem 1.4rem',
            border: '1.5px solid #bbf7d0',
            boxShadow: '0 4px 16px rgba(34, 197, 94, 0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Laba Bersih Terkumpul
            </span>
            <span style={{ background: '#f0fdf4', padding: '0.35rem', borderRadius: '10px' }}>
              <TrendingUp size={18} color="#16a34a" />
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, color: '#166534', marginTop: '0.4rem' }}>
            {formatIdr(calc.netProfit || 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '0.35rem', fontWeight: 700 }}>
            <span>🌸 Yasmeen: {formatIdr(calc.profitYasmeen || 0)}</span>
            <span style={{ margin: '0 0.3rem' }}>•</span>
            <span>🌊 Adziima: {formatIdr(calc.profitAdziima || 0)}</span>
          </div>
        </div>

        {/* Card 4: Sisa Stok Aktual */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '1.3rem 1.4rem',
            border: '1.5px solid #bae6fd',
            boxShadow: '0 4px 16px rgba(56, 189, 248, 0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Stok Baju Aktual
            </span>
            <span style={{ background: '#f0f9ff', padding: '0.35rem', borderRadius: '10px' }}>
              <Package size={18} color="#0284c7" />
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, color: '#075985', marginTop: '0.4rem' }}>
            {calc.remainingReadyStock || 0} pcs Ready
          </div>
          <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '0.35rem', fontWeight: 700 }}>
            <span>📦 Di Saudara: {calc.remainingAtSaudara || 0} pcs</span>
            <span style={{ margin: '0 0.3rem' }}>•</span>
            <span>✅ Terjual: {calc.totalPcsSold || 0} pcs</span>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE TABS */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          background: '#ede9fe',
          padding: '0.4rem',
          borderRadius: '16px',
          marginBottom: '1.5rem',
          overflowX: 'auto'
        }}
      >
        <button
          onClick={() => setActiveTab('channels')}
          style={{
            flex: '1 1 0',
            minWidth: '150px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: '0.65rem 1rem',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'channels' ? '#ffffff' : 'transparent',
            color: activeTab === 'channels' ? '#6b21a8' : '#7c3aed',
            boxShadow: activeTab === 'channels' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <Users size={16} />
          <span>3 Jalur Penjualan</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          style={{
            flex: '1 1 0',
            minWidth: '150px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: '0.65rem 1rem',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'calculator' ? '#ffffff' : 'transparent',
            color: activeTab === 'calculator' ? '#6b21a8' : '#7c3aed',
            boxShadow: activeTab === 'calculator' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <Calculator size={16} />
          <span>Kalkulator & Data Bal</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          style={{
            flex: '1 1 0',
            minWidth: '150px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: '0.65rem 1rem',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'ledger' ? '#ffffff' : 'transparent',
            color: activeTab === 'ledger' ? '#6b21a8' : '#7c3aed',
            boxShadow: activeTab === 'ledger' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <FileSpreadsheet size={16} />
          <span>Buku Kas & Riwayat ({sales.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('partnership')}
          style={{
            flex: '1 1 0',
            minWidth: '150px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: '0.65rem 1rem',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'partnership' ? '#ffffff' : 'transparent',
            color: activeTab === 'partnership' ? '#6b21a8' : '#7c3aed',
            boxShadow: activeTab === 'partnership' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <ShieldCheck size={16} />
          <span>Bagi Hasil & Restock</span>
        </button>
      </div>

      {/* 4. TAB CONTENTS */}
      {/* TAB 1: 3 JALUR PENJUALAN */}
      {activeTab === 'channels' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Banner Tips Flow */}
          <div
            style={{
              background: '#fdf4ff',
              border: '1.5px solid #f0abfc',
              borderRadius: '18px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}
          >
            <Sparkles size={20} color="#c026d3" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.82rem', color: '#86198f', lineHeight: 1.5 }}>
              <strong>Flow 3 Jalur Penjualan:</strong> Stok 1 Bal (50 pcs) dibagi ke 3 jalur:
              <span style={{ fontWeight: 800 }}> 15 pcs Titip Jual Saudara</span>,
              <span style={{ fontWeight: 800 }}> 20 pcs Lapak CFD Padang</span>, dan
              <span style={{ fontWeight: 800 }}> 15 pcs Live Selling bareng Adik</span>.
              Saudara setor flat <strong>Rp 120.000/pcs</strong> saat laku, selisih jual di atasnya jadi keuntungan saudara!
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.25rem' }}>
            {/* Channel 1: Konsinyasi Saudara */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1.5px solid #e9d5ff',
                padding: '1.4rem',
                boxShadow: '0 4px 16px rgba(124, 58, 237, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ background: '#f5f3ff', padding: '0.45rem', borderRadius: '12px' }}>
                      <Users size={20} color="#7c3aed" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#581c87' }}>
                        Titip Jual ke Saudara
                      </h3>
                      <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 700 }}>
                        Sistem Konsinyasi (Bayar Setelah Laku)
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      background: '#ede9fe',
                      color: '#6d28d9',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    Setoran Rp 120k
                  </span>
                </div>

                <div style={{ background: '#faf5ff', borderRadius: '14px', padding: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: '#6b7280' }}>Total Barang Dititip:</span>
                    <span style={{ fontWeight: 800, color: '#374151' }}>{consignment1.givenPcs || 15} pcs</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: '#059669', fontWeight: 700 }}>Sudah Laku & Disetor:</span>
                    <span style={{ fontWeight: 900, color: '#059669' }}>{consignment1.soldPcs || 0} pcs</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: '#d97706', fontWeight: 700 }}>Sisa Masih di Saudara:</span>
                    <span style={{ fontWeight: 900, color: '#b45309' }}>{calc.remainingAtSaudara || 15} pcs</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', paddingTop: '0.4rem', borderTop: '1px dashed #e9d5ff' }}>
                    <span style={{ color: '#581c87', fontWeight: 800 }}>Total Uang Masuk Setoran:</span>
                    <span style={{ fontWeight: 900, color: '#7c3aed' }}>
                      {formatIdr(consignment1.paidAmount || ((consignment1.soldPcs || 0) * 120000))}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.4, margin: '0 0 1rem' }}>
                  Saudara bebas menjual Rp 130.000 - Rp 150.000. Selisih dari Rp 120.000 adalah laba saudara. Rekap dilakukan berkala per minggu.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setCsgActionType('sold');
                    setIsConsignmentModalOpen(true);
                  }}
                  style={{
                    flex: 1,
                    background: '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  Catat Setoran Laku
                </button>
                <button
                  onClick={() => {
                    setCsgActionType('give');
                    setIsConsignmentModalOpen(true);
                  }}
                  style={{
                    background: '#ede9fe',
                    color: '#6d28d9',
                    border: 'none',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                  title="Tambah titipan pcs baju"
                >
                  + Titip
                </button>
                <button
                  onClick={() => {
                    setCsgActionType('return');
                    setIsConsignmentModalOpen(true);
                  }}
                  style={{
                    background: '#fee2e2',
                    color: '#b91c1c',
                    border: 'none',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                  title="Catat barang sisa/retur dari saudara"
                >
                  Retur
                </button>
              </div>
            </div>

            {/* Channel 2: Lapak CFD Padang */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1.5px solid #fed7aa',
                padding: '1.4rem',
                boxShadow: '0 4px 16px rgba(249, 115, 22, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ background: '#fff7ed', padding: '0.45rem', borderRadius: '12px' }}>
                      <Store size={20} color="#ea580c" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#9a3412' }}>
                        Lapak CFD Padang
                      </h3>
                      <div style={{ fontSize: '0.72rem', color: '#c2410c', fontWeight: 700 }}>
                        Jualan Offline Setiap Minggu Pagi
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      background: '#ffedd5',
                      color: '#c2410c',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    Alokasi 20 pcs
                  </span>
                </div>

                <div style={{ background: '#fffaf0', borderRadius: '14px', padding: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: '#6b7280' }}>Harga Jual Normal:</span>
                    <span style={{ fontWeight: 800, color: '#374151' }}>Rp 120.000 / pcs</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: '#059669', fontWeight: 700 }}>Terjual di CFD:</span>
                    <span style={{ fontWeight: 900, color: '#059669' }}>{calc.cfdPcsSold || 0} pcs</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: '#581c87', fontWeight: 700 }}>Total Omzet CFD:</span>
                    <span style={{ fontWeight: 900, color: '#581c87' }}>{formatIdr(calc.cfdRevenue || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', paddingTop: '0.4rem', borderTop: '1px dashed #fed7aa' }}>
                    <span style={{ color: '#dc2626', fontWeight: 700 }}>Biaya Lapak & Transport:</span>
                    <span style={{ fontWeight: 800, color: '#dc2626' }}>{formatIdr(calc.cfdExpenses || 0)}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.4, margin: '0 0 1rem' }}>
                  Cocok untuk pembeli yang ingin melihat & meraba bahan langsung. Diskon promo bundle (misal 2 pcs Rp 230k) bisa disesuaikan.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setSaleChannel('cfd');
                    setSalePricePerPcs('120000');
                    setIsAddSaleOpen(true);
                  }}
                  style={{
                    flex: 1,
                    background: '#ea580c',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  + Jual di CFD
                </button>
                <button
                  onClick={() => {
                    setExpChannel('cfd');
                    setExpCategory('sewa_lapak');
                    setIsAddExpenseOpen(true);
                  }}
                  style={{
                    background: '#ffedd5',
                    color: '#c2410c',
                    border: 'none',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                  title="Catat Biaya Sewa Tempat / Parkir CFD"
                >
                  + Biaya Lapak
                </button>
              </div>
            </div>

            {/* Channel 3: Live TikTok / Shopee bareng Adik */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1.5px solid #fbcfe8',
                padding: '1.4rem',
                boxShadow: '0 4px 16px rgba(244, 114, 182, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ background: '#fdf2f8', padding: '0.45rem', borderRadius: '12px' }}>
                      <Video size={20} color="#db2777" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#9d174d' }}>
                        Live Selling (Adik)
                      </h3>
                      <div style={{ fontSize: '0.72rem', color: '#db2777', fontWeight: 700 }}>
                        TikTok Live / Shopee Live Interaktif
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      background: '#fce7f3',
                      color: '#be185d',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    Alokasi 15 pcs
                  </span>
                </div>

                <div style={{ background: '#fff5f7', borderRadius: '14px', padding: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: '#6b7280' }}>Harga Promo Live:</span>
                    <span style={{ fontWeight: 800, color: '#374151' }}>Rp 109.000 – Rp 120.000</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: '#059669', fontWeight: 700 }}>Terjual Saat Live:</span>
                    <span style={{ fontWeight: 900, color: '#059669' }}>{calc.livePcsSold || 0} pcs</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: '#581c87', fontWeight: 700 }}>Total Omzet Live:</span>
                    <span style={{ fontWeight: 900, color: '#581c87' }}>{formatIdr(calc.liveRevenue || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', paddingTop: '0.4rem', borderTop: '1px dashed #fbcfe8' }}>
                    <span style={{ color: '#be185d', fontWeight: 700 }}>Komisi Adik / Packing:</span>
                    <span style={{ fontWeight: 800, color: '#be185d' }}>{formatIdr(calc.liveExpenses || 0)}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.4, margin: '0 0 1rem' }}>
                  Live interaktif oleh adik dengan spill model & try-on. Komisi adik disisihkan per baju terjual (misal Rp 5.000/pcs).
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setSaleChannel('live');
                    setSalePricePerPcs('115000');
                    setSaleSeller('adik');
                    setIsAddSaleOpen(true);
                  }}
                  style={{
                    flex: 1,
                    background: '#db2777',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  + Jual di Live
                </button>
                <button
                  onClick={() => {
                    setExpChannel('live');
                    setExpCategory('komisi_adik');
                    setIsAddExpenseOpen(true);
                  }}
                  style={{
                    background: '#fce7f3',
                    color: '#be185d',
                    border: 'none',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                  title="Catat Komisi Adik / Packing Live"
                >
                  + Komisi Adik
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KALKULATOR & DATA BAL */}
      {activeTab === 'calculator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Detailed Breakdown Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1.5px solid #e9d5ff',
              padding: '1.5rem',
              boxShadow: '0 4px 16px rgba(124, 58, 237, 0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#581c87' }}>
                  Struktur Modal & HPP Bal #1 (Impor China ➔ Padang)
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.15rem' }}>
                  1 Bal = 50 pcs baju impor (35 kg) via kargo Bandung ke Padang
                </div>
              </div>

              <button
                onClick={() => {
                  setBatchPcsInput(currentBatch.totalPcs?.toString() || '50');
                  setBatchWeightInput(currentBatch.weightKg?.toString() || '35');
                  setBatchPriceChinaInput(currentBatch.pricePerPcsChina?.toString() || '63200');
                  setBatchShippingKgInput(currentBatch.shippingCostPerKg?.toString() || '3700');
                  setBatchOtherCostsInput(currentBatch.otherCosts?.toString() || '0');
                  setBatchTargetSellPriceInput(currentBatch.targetSellPrice?.toString() || '120000');
                  setIsEditBatchOpen(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: '#f5f3ff',
                  border: '1.5px solid #c4b5fd',
                  color: '#6d28d9',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                <Calculator size={14} />
                <span>Ubah Angka Modal / Bal</span>
              </button>
            </div>

            {/* Step-by-step Formula Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#fdf4ff', border: '1.5px solid #f5d0fe', borderRadius: '16px', padding: '1rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#a21caf', textTransform: 'uppercase' }}>
                  1. Baju dari China
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#86198f', marginTop: '0.25rem' }}>
                  Rp 3.160.000
                </div>
                <div style={{ fontSize: '0.72rem', color: '#701a75', marginTop: '0.2rem' }}>
                  50 pcs × Rp 63.200 (inc ongkir ke Indo/Bandung)
                </div>
              </div>

              <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '16px', padding: '1rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase' }}>
                  2. Ongkir Bandung ➔ Padang
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e40af', marginTop: '0.25rem' }}>
                  Rp 129.500
                </div>
                <div style={{ fontSize: '0.72rem', color: '#1e3a8a', marginTop: '0.2rem' }}>
                  35 kg × Rp 3.700/kg
                </div>
              </div>

              <div style={{ background: '#fefce8', border: '1.5px solid #fef08a', borderRadius: '16px', padding: '1rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#a16207', textTransform: 'uppercase' }}>
                  3. Total Modal 1 Bal
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#854d0e', marginTop: '0.25rem' }}>
                  Rp 3.289.500
                </div>
                <div style={{ fontSize: '0.72rem', color: '#713f12', marginTop: '0.2rem' }}>
                  HPP Bersih: <strong>Rp 65.790 / pcs</strong>
                </div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '16px', padding: '1rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
                  4. Target Jual & Laba
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#166534', marginTop: '0.25rem' }}>
                  Untung Rp 54.210 / pcs
                </div>
                <div style={{ fontSize: '0.72rem', color: '#14532d', marginTop: '0.2rem' }}>
                  Dijual Rp 120.000 (Margin Kotor 45,2%)
                </div>
              </div>
            </div>

            {/* Simulation Table: Jika Terjual X pcs */}
            <div style={{ background: '#faf5ff', borderRadius: '16px', padding: '1.2rem', border: '1px solid #e9d5ff' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#581c87', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Percent size={16} />
                <span>Simulasi Perputaran Balik Modal & Profit 1 Bal (50 pcs)</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e9d5ff', color: '#6d28d9' }}>
                      <th style={{ padding: '0.5rem' }}>Pcs Terjual</th>
                      <th style={{ padding: '0.5rem' }}>Omzet (@ Rp 120k)</th>
                      <th style={{ padding: '0.5rem' }}>Modal 1 Bal</th>
                      <th style={{ padding: '0.5rem' }}>Selisih Kas / Status</th>
                      <th style={{ padding: '0.5rem' }}>Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f3e8ff' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 700 }}>25 pcs</td>
                      <td style={{ padding: '0.5rem' }}>Rp 3.000.000</td>
                      <td style={{ padding: '0.5rem' }}>Rp 3.289.500</td>
                      <td style={{ padding: '0.5rem', color: '#dc2626', fontWeight: 800 }}>- Rp 289.500</td>
                      <td style={{ padding: '0.5rem', color: '#6b7280' }}>Kurang 3 pcs lagi untuk balik modal</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f3e8ff', background: '#ecfdf5' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 900, color: '#065f46' }}>28 pcs (BEP) ⭐</td>
                      <td style={{ padding: '0.5rem', fontWeight: 800, color: '#065f46' }}>Rp 3.360.000</td>
                      <td style={{ padding: '0.5rem' }}>Rp 3.289.500</td>
                      <td style={{ padding: '0.5rem', color: '#059669', fontWeight: 900 }}>+ Rp 70.500</td>
                      <td style={{ padding: '0.5rem', color: '#047857', fontWeight: 700 }}>MODAL SUDAH BALIK 100%! 🎉</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f3e8ff' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 700 }}>40 pcs</td>
                      <td style={{ padding: '0.5rem' }}>Rp 4.800.000</td>
                      <td style={{ padding: '0.5rem' }}>Rp 3.289.500</td>
                      <td style={{ padding: '0.5rem', color: '#059669', fontWeight: 800 }}>+ Rp 1.510.500</td>
                      <td style={{ padding: '0.5rem', color: '#6b7280' }}>Profit bersih sudah tembus Rp 1.5 jt</td>
                    </tr>
                    <tr style={{ background: '#fdf4ff' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 900, color: '#701a75' }}>50 pcs (Habis) 🏆</td>
                      <td style={{ padding: '0.5rem', fontWeight: 900, color: '#701a75' }}>Rp 6.000.000</td>
                      <td style={{ padding: '0.5rem' }}>Rp 3.289.500</td>
                      <td style={{ padding: '0.5rem', color: '#7c3aed', fontWeight: 900 }}>+ Rp 2.710.500</td>
                      <td style={{ padding: '0.5rem', color: '#7c3aed', fontWeight: 800 }}>Modal utuh + Untung Rp 2,7 Juta!</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUKU KAS & RIWAYAT */}
      {activeTab === 'ledger' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1.5px solid #e9d5ff',
              padding: '1.5rem',
              boxShadow: '0 4px 16px rgba(124, 58, 237, 0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#581c87' }}>
                  Riwayat Transaksi Penjualan & Pengeluaran
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.15rem' }}>
                  Total {sales.length} transaksi penjualan tercatat
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setIsAddSaleOpen(true)}
                  style={{
                    background: '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.5rem 0.9rem',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  + Catat Penjualan
                </button>
                <button
                  onClick={() => setIsAddExpenseOpen(true)}
                  style={{
                    background: '#fee2e2',
                    color: '#b91c1c',
                    border: 'none',
                    padding: '0.5rem 0.9rem',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  + Catat Biaya
                </button>
              </div>
            </div>

            {/* Sales Table */}
            {sales.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 1.5rem',
                  background: '#faf5ff',
                  borderRadius: '16px',
                  border: '1.5px dashed #c4b5fd'
                }}
              >
                <ShoppingBag size={36} color="#c084fc" style={{ margin: '0 auto 0.6rem' }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#6b21a8' }}>
                  Belum ada transaksi penjualan yang dicatat
                </div>
                <p style={{ fontSize: '0.78rem', color: '#7c3aed', maxWidth: '380px', margin: '0.4rem auto 1rem' }}>
                  Yuk catat penjualan baju pertama kalian dari CFD, Live TikTok, atau setoran dari saudara!
                </p>
                <button
                  onClick={() => setIsAddSaleOpen(true)}
                  style={{
                    background: '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.6rem 1.2rem',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  + Catat Penjualan Sekarang
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e9d5ff', color: '#6d28d9', textAlign: 'left' }}>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Tanggal</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Jalur</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Pcs</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Harga / Pcs</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Total Omzet</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Catatan / Pembeli</th>
                      <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((s) => {
                      const channelBadge = {
                        cfd: { label: 'CFD Padang', bg: '#ffedd5', color: '#c2410c' },
                        live: { label: 'Live Adik', bg: '#fce7f3', color: '#be185d' },
                        saudara: { label: 'Saudara', bg: '#ede9fe', color: '#6d28d9' }
                      }[s.channel] || { label: s.channel, bg: '#f3f4f6', color: '#4b5563' };

                      return (
                        <tr key={s.id} style={{ borderBottom: '1px solid #f3e8ff' }}>
                          <td style={{ padding: '0.6rem 0.5rem', color: '#6b7280' }}>
                            {formatDateIndo(s.date)}
                          </td>
                          <td style={{ padding: '0.6rem 0.5rem' }}>
                            <span
                              style={{
                                background: channelBadge.bg,
                                color: channelBadge.color,
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                padding: '0.2rem 0.55rem',
                                borderRadius: 'var(--radius-full)'
                              }}
                            >
                              {channelBadge.label}
                            </span>
                          </td>
                          <td style={{ padding: '0.6rem 0.5rem', fontWeight: 800, color: '#111827' }}>
                            {s.pcs} pcs
                          </td>
                          <td style={{ padding: '0.6rem 0.5rem' }}>
                            {formatIdr(s.pricePerPcs)}
                          </td>
                          <td style={{ padding: '0.6rem 0.5rem', fontWeight: 900, color: '#059669' }}>
                            {formatIdr(s.totalAmountIdr)}
                          </td>
                          <td style={{ padding: '0.6rem 0.5rem', color: '#4b5563' }}>
                            {s.buyerOrNote || '-'}
                          </td>
                          <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                            <button
                              onClick={() => {
                                if (window.confirm('Hapus transaksi penjualan ini?')) {
                                  deleteBusinessSale(s.id);
                                }
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#9ca3af',
                                cursor: 'pointer',
                                padding: '0.2rem'
                              }}
                              title="Hapus"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Expenses List */}
            {expenses.length > 0 && (
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed #e9d5ff' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#991b1b', marginBottom: '0.8rem' }}>
                  Pengeluaran Operasional Bisnis ({expenses.length})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  {expenses.map((e) => (
                    <div
                      key={e.id}
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '12px',
                        padding: '0.75rem 0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.82rem' }}>
                          {formatIdr(e.amountIdr)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#7f1d1d', marginTop: '0.1rem' }}>
                          {e.notes || e.category} · {formatDateIndo(e.date)}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm('Hapus pengeluaran ini?')) {
                            deleteBusinessExpense(e.id);
                          }
                        }}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: BAGI HASIL & PUTARAN KAS */}
      {activeTab === 'partnership' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Rules Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1.5px solid #bbf7d0',
              padding: '1.5rem',
              boxShadow: '0 4px 16px rgba(34, 197, 94, 0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ background: '#f0fdf4', padding: '0.5rem', borderRadius: '12px' }}>
                <ShieldCheck size={22} color="#16a34a" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#166534' }}>
                  Prinsip Perlindungan Modal & Bagi Hasil 50:50
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#15803d' }}>
                  Bisnis Sehat: Uang modal diputar kembali, keuntungan bersih dibagi adil
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              {/* Box 1: Dana Restock Modal Bal */}
              <div style={{ background: '#faf5ff', border: '1.5px solid #d8b4fe', borderRadius: '16px', padding: '1.2rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7e22ce', textTransform: 'uppercase' }}>
                  🔒 Kas Perlindungan Modal (Restock Bal #2)
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900, color: '#581c87', marginTop: '0.35rem' }}>
                  {formatIdr(calc.restockFund || 0)}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#6b7280', marginTop: '0.3rem', lineHeight: 1.4 }}>
                  Wajib diamankan dari omzet pertama sampai terkumpul <strong>Rp 3.289.500</strong> agar bisa langsung order bal selanjutnya tanpa tombok.
                </div>
              </div>

              {/* Box 2: Pool Keuntungan Bersih */}
              <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '16px', padding: '1.2rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
                  💰 Pool Keuntungan Bersih (Bisa Dibagi)
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900, color: '#166534', marginTop: '0.35rem' }}>
                  {formatIdr(calc.distributableProfit || 0)}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#166534', marginTop: '0.3rem', lineHeight: 1.4 }}>
                  Uang lebihan setelah modal bal tertutup 100% dan beban operasional lunas. Siap dibagi berdua atau ditabung ke emas!
                </div>
              </div>
            </div>

            {/* Split Breakdown */}
            <div
              style={{
                background: 'linear-gradient(135deg, #fdf2f8 0%, #f0f9ff 100%)',
                borderRadius: '16px',
                border: '1.5px solid #e2e8f0',
                padding: '1.25rem'
              }}
            >
              <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#334155', marginBottom: '0.85rem', textAlign: 'center' }}>
                Pembagian Hasil Bersih Partner (50% Yasmeen & 50% Adziima)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1rem', border: '1.5px solid #fbcfe8', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#db2777' }}>🌸 Bagian Yasmeen (50%)</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#be185d', marginTop: '0.25rem' }}>
                    {formatIdr(calc.profitYasmeen || 0)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#9d174d', marginTop: '0.2rem' }}>
                    Hak laba bersih terkumpul
                  </div>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1rem', border: '1.5px solid #bae6fd', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0284c7' }}>🌊 Bagian Adziima (50%)</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0369a1', marginTop: '0.25rem' }}>
                    {formatIdr(calc.profitAdziima || 0)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#075985', marginTop: '0.2rem' }}>
                    Hak laba bersih terkumpul
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CATAT PENJUALAN CEPAT */}
      {isAddSaleOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddSaleOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>🛍️</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#581c87' }}>
                  Catat Penjualan Baju
                </h3>
              </div>
              <button onClick={() => setIsAddSaleOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSale} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#6b7280', marginBottom: '0.3rem' }}>
                  Jalur Penjualan
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSaleChannel('cfd');
                      setSalePricePerPcs('120000');
                    }}
                    style={{
                      padding: '0.55rem',
                      borderRadius: '10px',
                      border: saleChannel === 'cfd' ? '2px solid #ea580c' : '1px solid #e5e7eb',
                      background: saleChannel === 'cfd' ? '#fff7ed' : '#ffffff',
                      color: saleChannel === 'cfd' ? '#c2410c' : '#4b5563',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    CFD Padang
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSaleChannel('live');
                      setSalePricePerPcs('115000');
                      setSaleSeller('adik');
                    }}
                    style={{
                      padding: '0.55rem',
                      borderRadius: '10px',
                      border: saleChannel === 'live' ? '2px solid #db2777' : '1px solid #e5e7eb',
                      background: saleChannel === 'live' ? '#fdf2f8' : '#ffffff',
                      color: saleChannel === 'live' ? '#be185d' : '#4b5563',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Live Adik
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSaleChannel('saudara');
                      setSalePricePerPcs('120000');
                    }}
                    style={{
                      padding: '0.55rem',
                      borderRadius: '10px',
                      border: saleChannel === 'saudara' ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                      background: saleChannel === 'saudara' ? '#f5f3ff' : '#ffffff',
                      color: saleChannel === 'saudara' ? '#6d28d9' : '#4b5563',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Saudara
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#6b7280', marginBottom: '0.3rem' }}>
                    Jumlah (Pcs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={salePcs}
                    onChange={(e) => setSalePcs(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '10px',
                      border: '1.5px solid #e5e7eb',
                      fontSize: '0.9rem',
                      fontWeight: 800
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#6b7280', marginBottom: '0.3rem' }}>
                    Harga Jual / Pcs (Rp)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={salePricePerPcs}
                    onChange={(e) => setSalePricePerPcs(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '10px',
                      border: '1.5px solid #e5e7eb',
                      fontSize: '0.9rem',
                      fontWeight: 800
                    }}
                  />
                </div>
              </div>

              <div style={{ background: '#f5f3ff', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b21a8', fontWeight: 700 }}>Total Uang Masuk: </span>
                <span style={{ fontSize: '1.1rem', color: '#7c3aed', fontWeight: 900 }}>
                  {formatIdr((parseInt(salePcs, 10) || 1) * (parseFloat(salePricePerPcs) || 120000))}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#6b7280', marginBottom: '0.3rem' }}>
                  Catatan / Nama Pembeli (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Beli 2 dress di CFD, transfer BCA"
                  value={saleBuyerOrNote}
                  onChange={(e) => setSaleBuyerOrNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '10px',
                    border: '1.5px solid #e5e7eb',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#6b7280', marginBottom: '0.3rem' }}>
                  Tanggal Transaksi
                </label>
                <input
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '10px',
                    border: '1.5px solid #e5e7eb',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '0.5rem',
                  background: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
                }}
              >
                Simpan Penjualan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: KONSINYASI SAUDARA (SETORAN / TITIP / RETUR) */}
      {isConsignmentModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsConsignmentModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>🤝</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#581c87' }}>
                  Kelola Titip Jual Saudara
                </h3>
              </div>
              <button onClick={() => setIsConsignmentModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveConsignmentAction} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#6b7280', marginBottom: '0.3rem' }}>
                  Pilih Tindakan
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => setCsgActionType('sold')}
                    style={{
                      padding: '0.55rem',
                      borderRadius: '10px',
                      border: csgActionType === 'sold' ? '2px solid #059669' : '1px solid #e5e7eb',
                      background: csgActionType === 'sold' ? '#ecfdf5' : '#ffffff',
                      color: csgActionType === 'sold' ? '#065f46' : '#4b5563',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Setor Laku
                  </button>
                  <button
                    type="button"
                    onClick={() => setCsgActionType('give')}
                    style={{
                      padding: '0.55rem',
                      borderRadius: '10px',
                      border: csgActionType === 'give' ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                      background: csgActionType === 'give' ? '#f5f3ff' : '#ffffff',
                      color: csgActionType === 'give' ? '#6d28d9' : '#4b5563',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    + Tambah Titipan
                  </button>
                  <button
                    type="button"
                    onClick={() => setCsgActionType('return')}
                    style={{
                      padding: '0.55rem',
                      borderRadius: '10px',
                      border: csgActionType === 'return' ? '2px solid #dc2626' : '1px solid #e5e7eb',
                      background: csgActionType === 'return' ? '#fef2f2' : '#ffffff',
                      color: csgActionType === 'return' ? '#991b1b' : '#4b5563',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Retur Sisa
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#6b7280', marginBottom: '0.3rem' }}>
                  Jumlah Pcs Baju
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={csgPcs}
                  onChange={(e) => setCsgPcs(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '10px',
                    border: '1.5px solid #e5e7eb',
                    fontSize: '0.9rem',
                    fontWeight: 800
                  }}
                />
              </div>

              {csgActionType === 'sold' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#6b7280', marginBottom: '0.3rem' }}>
                    Harga Setoran per Pcs (Wajib Rp 120.000)
                  </label>
                  <input
                    type="number"
                    value={csgPrice}
                    onChange={(e) => setCsgPrice(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '10px',
                      border: '1.5px solid #e5e7eb',
                      fontSize: '0.9rem',
                      fontWeight: 800
                    }}
                  />
                  <div style={{ marginTop: '0.4rem', fontSize: '0.74rem', color: '#059669', fontWeight: 700 }}>
                    Total Setoran Uang: {formatIdr((parseInt(csgPcs, 10) || 1) * (parseFloat(csgPrice) || 120000))}
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#6b7280', marginBottom: '0.3rem' }}>
                  Catatan / Keterangan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rekap minggu pertama, laku 5 pcs"
                  value={csgNotes}
                  onChange={(e) => setCsgNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '10px',
                    border: '1.5px solid #e5e7eb',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '0.5rem',
                  background: csgActionType === 'sold' ? '#059669' : '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Konfirmasi Tindakan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CATAT BIAYA OPERASIONAL */}
      {isAddExpenseOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddExpenseOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>💸</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#991b1b' }}>
                  Catat Biaya Operasional
                </h3>
              </div>
              <button onClick={() => setIsAddExpenseOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#6b7280', marginBottom: '0.3rem' }}>
                  Kategori Pengeluaran
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '10px',
                    border: '1.5px solid #e5e7eb',
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}
                >
                  <option value="sewa_lapak">Sewa Stand / Lapak CFD Padang</option>
                  <option value="transport">Bensin / Transportasi / Parkir</option>
                  <option value="packing">Plastik Packing & Kantong Kresek</option>
                  <option value="komisi_adik">Komisi Live Adik</option>
                  <option value="lainnya">Keperluan Lainnya</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#6b7280', marginBottom: '0.3rem' }}>
                  Nominal Biaya (Rp)
                </label>
                <input
                  type="number"
                  step="1000"
                  placeholder="Contoh: 30000"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '10px',
                    border: '1.5px solid #e5e7eb',
                    fontSize: '0.9rem',
                    fontWeight: 800
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#6b7280', marginBottom: '0.3rem' }}>
                  Keterangan Singkat
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Beli kantong kresek baju 1 pack"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '10px',
                    border: '1.5px solid #e5e7eb',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '0.5rem',
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Simpan Pengeluaran
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT PARAMETER BAL */}
      {isEditBatchOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditBatchOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>⚙️</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#581c87' }}>
                  Parameter Modal 1 Bal
                </h3>
              </div>
              <button onClick={() => setIsEditBatchOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#6b7280' }}>Total Pcs / Bal</label>
                  <input
                    type="number"
                    value={batchPcsInput}
                    onChange={(e) => setBatchPcsInput(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', fontWeight: 800 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#6b7280' }}>Berat Bal (kg)</label>
                  <input
                    type="number"
                    value={batchWeightInput}
                    onChange={(e) => setBatchWeightInput(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', fontWeight: 800 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#6b7280' }}>Harga China/pcs (Rp)</label>
                  <input
                    type="number"
                    value={batchPriceChinaInput}
                    onChange={(e) => setBatchPriceChinaInput(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', fontWeight: 800 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#6b7280' }}>Ongkir Kargo / kg (Rp)</label>
                  <input
                    type="number"
                    value={batchShippingKgInput}
                    onChange={(e) => setBatchShippingKgInput(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', fontWeight: 800 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#6b7280' }}>Target Jual / Setoran Saudara (Rp)</label>
                <input
                  type="number"
                  value={batchTargetSellPriceInput}
                  onChange={(e) => setBatchTargetSellPriceInput(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', fontWeight: 800 }}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '0.5rem',
                  background: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.7rem',
                  borderRadius: '10px',
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
