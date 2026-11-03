import React, { useState } from 'react';
import { usePocket } from '../context/PocketContext';
import { formatIdr, formatDateIndo } from '../utils/formatters';
import { BUSINESS_TYPES, SALES_METHODS_LIST } from '../data/initialData';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Briefcase,
  ShoppingBag,
  Shirt,
  Plane,
  Utensils,
  Sparkles,
  Gem,
  Smartphone,
  Store,
  Plus,
  Trash2,
  TrendingUp,
  Target,
  ShieldCheck,
  CheckCircle2,
  Calculator,
  Percent,
  Truck,
  ArrowRight,
  Info,
  Calendar,
  X,
  DollarSign,
  Layers,
  Settings,
  Check,
  Package,
  Clock,
  Send,
  HelpCircle
} from 'lucide-react';

export default function BusinessView({ onOpenCloudModal }) {
  const {
    setActiveView,
    business,
    businessCalculations,
    updateBusinessPlan,
    updateBusinessSettings,
    recordBusinessSale,
    deleteBusinessSale,
    isCloudConnected,
    isCloudSyncing
  } = usePocket();

  const calc = businessCalculations || {};
  const settings = business?.settings || {};
  const plan = business?.plan || {};
  const sales = business?.sales || [];

  // Active business type
  const currentBusinessType = settings.businessType || 'fashion';
  const selectedMethods = settings.selectedSalesMethods || ['ready_stock', 'pre_order', 'online_shop'];

  // Local Form state for Manual Cost & Selling Price Inputs
  const [productName, setProductName] = useState(plan.productName || 'Produk / Paket Perdana');
  const [totalUnits, setTotalUnits] = useState((plan.totalUnits || 50).toString());
  const [itemCostTotal, setItemCostTotal] = useState((plan.itemCostTotal || 3000000).toString());
  const [shippingCostTotal, setShippingCostTotal] = useState((plan.shippingCostTotal || 250000).toString());
  const [otherCostTotal, setOtherCostTotal] = useState((plan.otherCostTotal || 50000).toString());
  const [targetPricePerUnit, setTargetPricePerUnit] = useState((plan.targetPricePerUnit || 100000).toString());
  const [planNotes, setPlanNotes] = useState(plan.notes || '');

  // Edit Business Info Modal
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);
  const [businessNameInput, setBusinessNameInput] = useState(settings.businessName || 'Rencana Usaha Bersama');
  const [customTypeInput, setCustomTypeInput] = useState(settings.customTypeName || '');

  // Add Sale Modal
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [saleMethod, setSaleMethod] = useState(selectedMethods[0] || 'ready_stock');
  const [salePcs, setSalePcs] = useState('1');
  const [salePrice, setSalePrice] = useState((calc.plan?.targetPricePerUnit || 100000).toString());
  const [saleBuyer, setSaleBuyer] = useState('');
  const [saleSeller, setSaleSeller] = useState('berdua');

  // Toast feedback
  const [toastMsg, setToastMsg] = useState(null);

  // Auto-save plan when inputs change
  const handleSavePlan = (updates = {}) => {
    const payload = {
      productName,
      totalUnits: parseInt(totalUnits, 10) || 1,
      itemCostTotal: parseFloat(itemCostTotal) || 0,
      shippingCostTotal: parseFloat(shippingCostTotal) || 0,
      otherCostTotal: parseFloat(otherCostTotal) || 0,
      targetPricePerUnit: parseFloat(targetPricePerUnit) || 0,
      notes: planNotes,
      ...updates
    };
    updateBusinessPlan(payload);
    setToastMsg('✓ Rencana modal & HPP berhasil disimpan!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Toggle Sales Method
  const handleToggleMethod = (methodId) => {
    let nextMethods = [];
    if (selectedMethods.includes(methodId)) {
      if (selectedMethods.length <= 1) {
        alert('Minimal harus ada 1 metode penjualan yang aktif!');
        return;
      }
      nextMethods = selectedMethods.filter(m => m !== methodId);
    } else {
      nextMethods = [...selectedMethods, methodId];
    }
    updateBusinessSettings({ selectedSalesMethods: nextMethods });
  };

  // Select Business Type
  const handleSelectBusinessType = (typeId) => {
    updateBusinessSettings({ businessType: typeId });
    try {
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.3 } });
    } catch (e) {}
  };

  // Save Business Info (Name & Custom Type)
  const handleSaveBusinessInfo = (e) => {
    e.preventDefault();
    updateBusinessSettings({
      businessName: businessNameInput.trim() || 'Rencana Usaha Bersama',
      customTypeName: customTypeInput.trim()
    });
    setIsEditInfoOpen(false);
  };

  // Record Sale
  const handleSaveSale = (e) => {
    e.preventDefault();
    const qty = parseInt(salePcs, 10) || 1;
    const price = parseFloat(salePrice) || calc.plan?.targetPricePerUnit || 100000;

    recordBusinessSale({
      date: saleDate,
      method: saleMethod,
      channel: saleMethod,
      pcs: qty,
      pricePerPcs: price,
      buyerOrNote: saleBuyer,
      seller: saleSeller
    });

    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } catch (err) {}

    setIsAddSaleOpen(false);
    setSalePcs('1');
    setSaleBuyer('');
  };

  // Helper icon for business type
  const getBizIcon = (typeId) => {
    switch (typeId) {
      case 'fashion': return <Shirt size={18} />;
      case 'jastip_impor': return <Plane size={18} />;
      case 'fnb': return <Utensils size={18} />;
      case 'beauty': return <Sparkles size={18} />;
      case 'accessories': return <Gem size={18} />;
      case 'electronics': return <Smartphone size={18} />;
      case 'services': return <Briefcase size={18} />;
      default: return <ShoppingBag size={18} />;
    }
  };

  return (
    <div className="view-container">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            background: '#047857',
            color: '#ffffff',
            padding: '0.65rem 1.1rem',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            fontSize: '0.82rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeInSlide 0.3s ease'
          }}
        >
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. TOP HEADER & NAVIGATION */}
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn-back-home"
            onClick={() => setActiveView('landing')}
            title="Kembali ke Halaman Utama"
          >
            <ArrowLeft size={16} />
            <span>Halaman Utama</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: '#ede9fe',
                border: '1.5px solid #c4b5fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7c3aed',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.12)'
              }}
            >
              {getBizIcon(currentBusinessType)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#581c87', margin: 0, lineHeight: 1.2 }}>
                  {settings.businessName || 'Rencana Usaha Bersama'}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditInfoOpen(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#7c3aed',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Ubah Nama & Keterangan Usaha"
                >
                  <Settings size={15} />
                </button>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6d28d9', marginTop: '0.1rem', fontWeight: 600 }}>
                {BUSINESS_TYPES.find(b => b.id === currentBusinessType)?.label || 'Perencanaan Usaha'} · Yasmeen & Adziima
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <button
            onClick={onOpenCloudModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: isCloudConnected ? '#f0fdf4' : '#ffffff',
              border: isCloudConnected ? '1.5px solid #86efac' : '1.5px dashed #cbd5e1',
              color: isCloudConnected ? '#166534' : '#64748b',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: isCloudConnected ? '#22c55e' : '#f59e0b' }} />
            <span>{isCloudConnected ? 'Cloud Aktif' : 'Sync Cloud'}</span>
          </button>
        </div>
      </div>

      {/* 2. SECTION 1: PILIH JENIS BISNIS */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #e9d5ff',
          padding: '1.1rem 1.25rem',
          boxShadow: '0 2px 10px rgba(124, 58, 237, 0.04)',
          marginBottom: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🏷️</span>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#4c1d95', margin: 0 }}>
                1. Pilih Jenis Bisnis
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#6d28d9', margin: 0 }}>
                Pilih kategori usaha yang ingin kamu rencanakan
              </p>
            </div>
          </div>
        </div>

        {/* Business Type Selector Pills */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '0.5rem'
          }}
        >
          {BUSINESS_TYPES.map(bt => {
            const isSelected = currentBusinessType === bt.id;
            return (
              <div
                key={bt.id}
                onClick={() => handleSelectBusinessType(bt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid #7c3aed' : '1.5px solid #f1f5f9',
                  background: isSelected ? '#f5f3ff' : '#ffffff',
                  color: isSelected ? '#581c87' : '#475569',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ color: isSelected ? '#7c3aed' : '#94a3b8' }}>
                  {getBizIcon(bt.id)}
                </div>
                <span style={{ flex: 1 }}>{bt.label}</span>
                {isSelected && <Check size={14} color="#7c3aed" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SECTION 2: INPUT PARAMETER MODAL & HASIL ESTIMASI HPP OTOMATIS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}
      >
        {/* Left: Manual Inputs Form */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #e9d5ff',
            padding: '1.1rem 1.25rem',
            boxShadow: '0 2px 10px rgba(124, 58, 237, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '1.1rem' }}>✍️</span>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#4c1d95', margin: 0 }}>
                2. Input Modal, Ongkir & Harga Jual Manual
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#6d28d9', margin: 0 }}>
                Ketik modal beli, ongkir dan harga jual rencana
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>
                Nama Produk / Koleksi / Paket:
              </label>
              <input
                type="text"
                className="form-input"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Contoh: Koleksi Baju Batch 1 / Brownies 200gr"
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>
                  Jumlah / Qty Barang:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    className="form-input"
                    value={totalUnits}
                    onChange={(e) => setTotalUnits(e.target.value)}
                    placeholder="50"
                    min="1"
                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
                  />
                  <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>
                    unit
                  </span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>
                  Modal Beli Barang (Rp):
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={itemCostTotal}
                  onChange={(e) => setItemCostTotal(e.target.value)}
                  placeholder="3000000"
                  style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>
                  Ongkir & Kargo (Rp):
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={shippingCostTotal}
                  onChange={(e) => setShippingCostTotal(e.target.value)}
                  placeholder="250000"
                  style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>
                  Packing & Operasional (Rp):
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={otherCostTotal}
                  onChange={(e) => setOtherCostTotal(e.target.value)}
                  placeholder="50000"
                  style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#4c1d95', display: 'block', marginBottom: '0.2rem' }}>
                Target Rencana Harga Jual per Unit (Rp):
              </label>
              <input
                type="number"
                className="form-input"
                value={targetPricePerUnit}
                onChange={(e) => setTargetPricePerUnit(e.target.value)}
                placeholder="100000"
                style={{ fontSize: '0.85rem', fontWeight: 800, borderColor: '#c4b5fd', background: '#faf5ff', color: '#581c87', padding: '0.5rem 0.65rem' }}
              />
            </div>

            <button
              type="button"
              onClick={() => handleSavePlan()}
              style={{
                marginTop: '0.4rem',
                background: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.55rem',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 3px 10px rgba(124, 58, 237, 0.2)'
              }}
            >
              <Calculator size={15} />
              <span>Simpan & Perbarui Hitungan HPP</span>
            </button>
          </div>
        </div>

        {/* Right: Live Auto-Calculation Card (Hasil Estimasi Otomatis) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%)',
            borderRadius: '16px',
            border: '2px solid #ddd6fe',
            padding: '1.1rem 1.25rem',
            boxShadow: '0 4px 16px rgba(124, 58, 237, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.1rem' }}>⚡</span>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#4c1d95', margin: 0 }}>
                  Hasil Estimasi HPP & Laba Otomatis
                </h3>
              </div>
              <span style={{ background: '#ede9fe', color: '#6d28d9', fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '99px' }}>
                Otomatis
              </span>
            </div>

            {/* Main Big Metric: Estimasi HPP per Unit */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1.5px solid #c4b5fd',
                padding: '0.75rem 1rem',
                marginBottom: '0.75rem',
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.05)'
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                ESTIMASI HPP (MODAL POKOK PER UNIT)
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#581c87', marginTop: '0.15rem' }}>
                {formatIdr(calc.hppPerUnit || 0)} <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6d28d9' }}>/ unit</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                Total Modal: {formatIdr(calc.totalCapitalCost || 0)} ÷ {calc.totalUnits || 0} unit
              </div>
            </div>

            {/* 3 Grid Mini Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ background: '#ffffff', borderRadius: '10px', padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#047857' }}>ESTIMASI UNTUNG / UNIT</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#065f46', marginTop: '0.1rem' }}>
                  +{formatIdr(calc.profitPerUnit || 0)}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>
                  Margin: {calc.marginPercent || 0}%
                </div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '10px', padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#b45309' }}>TITIK BALIK MODAL (BEP)</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#92400e', marginTop: '0.1rem' }}>
                  {calc.bepUnits || 0} unit
                </div>
                <div style={{ fontSize: '0.68rem', color: '#b45309', fontWeight: 700 }}>
                  harus laku untuk balik modal
                </div>
              </div>
            </div>

            {/* Potential Total Omzet & Total Net Profit */}
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.65rem 0.85rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                <span style={{ color: '#475569' }}>Potensi Omzet (Semua Laku):</span>
                <strong style={{ color: '#1e293b' }}>{formatIdr(calc.totalEstimatedRevenue || 0)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                <span style={{ color: '#047857', fontWeight: 700 }}>Potensi Laba Bersih Total:</span>
                <strong style={{ color: '#047857', fontWeight: 900 }}>+{formatIdr(calc.totalEstimatedNetProfit || 0)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#6d28d9', paddingTop: '0.3rem', borderTop: '1px dashed #cbd5e1' }}>
                <span>Bagi Hasil 50:50:</span>
                <strong>Yasmeen {formatIdr(Math.round((calc.totalEstimatedNetProfit || 0) * 0.5))} · Adziima {formatIdr(Math.round((calc.totalEstimatedNetProfit || 0) * 0.5))}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SECTION 3: PILIH METODE PENJUALAN */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #e9d5ff',
          padding: '1.1rem 1.25rem',
          boxShadow: '0 2px 10px rgba(124, 58, 237, 0.04)',
          marginBottom: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🛍️</span>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#4c1d95', margin: 0 }}>
                3. Pilih Metode Penjualan
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#6d28d9', margin: 0 }}>
                Klik untuk mengaktifkan atau menonaktifkan jalur penjualan yang kamu gunakan
              </p>
            </div>
          </div>
        </div>

        {/* Method Cards Checklist */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '0.65rem'
          }}
        >
          {SALES_METHODS_LIST.map(sm => {
            const isActive = selectedMethods.includes(sm.id);
            return (
              <div
                key={sm.id}
                onClick={() => handleToggleMethod(sm.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '12px',
                  border: isActive ? '2px solid #7c3aed' : '1.5px solid #e2e8f0',
                  background: isActive ? '#f5f3ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '6px',
                    border: isActive ? '2px solid #7c3aed' : '2px solid #cbd5e1',
                    background: isActive ? '#7c3aed' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    marginTop: '2px',
                    flexShrink: 0
                  }}
                >
                  {isActive && <Check size={13} strokeWidth={3} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isActive ? '#4c1d95' : '#334155' }}>
                      {sm.label}
                    </span>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        padding: '0.1rem 0.4rem',
                        borderRadius: '99px',
                        background: isActive ? '#ddd6fe' : '#f1f5f9',
                        color: isActive ? '#581c87' : '#94a3b8'
                      }}
                    >
                      {isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: isActive ? '#6d28d9' : '#64748b', margin: '0.2rem 0 0', lineHeight: 1.3 }}>
                    {sm.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. SECTION 4: REALISASI PENJUALAN & OMZET AKTUAL */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #e9d5ff',
          padding: '1.1rem 1.25rem',
          boxShadow: '0 2px 10px rgba(124, 58, 237, 0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontSize: '1.1rem' }}>📊</span>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#4c1d95', margin: 0 }}>
                4. Catatan & Realisasi Penjualan
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#6d28d9', margin: 0 }}>
                Rekam unit yang laku untuk memantau kemajuan balik modal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddSaleOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: '#7c3aed',
              color: '#ffffff',
              border: 'none',
              padding: '0.45rem 0.85rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)'
            }}
          >
            <Plus size={14} />
            <span>+ Catat Penjualan</span>
          </button>
        </div>

        {/* Realized Progress Ribbon */}
        <div
          style={{
            background: '#faf5ff',
            borderRadius: '12px',
            border: '1.5px solid #ddd6fe',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.65rem',
            textAlign: 'center'
          }}
        >
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#6d28d9' }}>TERJUAL</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#581c87', marginTop: '0.1rem' }}>
              {calc.totalPcsSold || 0} unit
            </div>
            <div style={{ fontSize: '0.68rem', color: '#7c3aed' }}>
              Sisa {calc.remainingUnits || 0} unit
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#6d28d9' }}>OMZET AKTUAL</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#581c87', marginTop: '0.1rem' }}>
              {formatIdr(calc.totalRevenue || 0)}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#7c3aed' }}>
              Uang riil masuk
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#6d28d9' }}>BALIK MODAL (BEP)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: calc.isCapitalRecovered ? '#047857' : '#b45309', marginTop: '0.1rem' }}>
              {calc.bepPercent || 0}%
            </div>
            <div style={{ fontSize: '0.68rem', color: calc.isCapitalRecovered ? '#059669' : '#b45309' }}>
              {calc.isCapitalRecovered ? '✓ Modal Kembali' : `Butuh ${Math.max(0, (calc.bepUnits || 0) - (calc.totalPcsSold || 0))} unit lagi`}
            </div>
          </div>
        </div>

        {/* Sales Table */}
        {sales.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.82rem' }}>
            Belum ada catatan penjualan. Klik <strong>"+ Catat Penjualan"</strong> untuk mencatat produk yang laku!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
                  <th style={{ padding: '0.5rem 0.65rem' }}>Tanggal</th>
                  <th style={{ padding: '0.5rem 0.65rem' }}>Metode</th>
                  <th style={{ padding: '0.5rem 0.65rem' }}>Qty</th>
                  <th style={{ padding: '0.5rem 0.65rem' }}>Harga</th>
                  <th style={{ padding: '0.5rem 0.65rem' }}>Total Omzet</th>
                  <th style={{ padding: '0.5rem 0.65rem' }}>Catatan / Pembeli</th>
                  <th style={{ padding: '0.5rem 0.65rem', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(s => {
                  const methodObj = SALES_METHODS_LIST.find(m => m.id === (s.method || s.channel));
                  const amt = s.totalAmountIdr || (s.pcs * s.pricePerPcs);
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.5rem 0.65rem', fontWeight: 600 }}>{s.date}</td>
                      <td style={{ padding: '0.5rem 0.65rem' }}>
                        <span style={{ background: '#ede9fe', color: '#581c87', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                          {methodObj?.label || s.method || 'Penjualan'}
                        </span>
                      </td>
                      <td style={{ padding: '0.5rem 0.65rem', fontWeight: 800 }}>{s.pcs} pcs</td>
                      <td style={{ padding: '0.5rem 0.65rem' }}>{formatIdr(s.pricePerPcs)}</td>
                      <td style={{ padding: '0.5rem 0.65rem', fontWeight: 800, color: '#047857' }}>{formatIdr(amt)}</td>
                      <td style={{ padding: '0.5rem 0.65rem', color: '#64748b' }}>{s.buyerOrNote || '-'}</td>
                      <td style={{ padding: '0.5rem 0.65rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => deleteBusinessSale(s.id)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                          title="Hapus riwayat penjualan ini"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: EDIT BUSINESS INFO */}
      {isEditInfoOpen && (
        <div className="modal-overlay" onClick={() => setIsEditInfoOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Ubah Nama & Keterangan Usaha</h3>
              <button className="modal-close-btn" onClick={() => setIsEditInfoOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveBusinessInfo}>
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label className="form-label">Nama Bisnis / Usaha:</label>
                <input
                  type="text"
                  className="form-input"
                  value={businessNameInput}
                  onChange={(e) => setBusinessNameInput(e.target.value)}
                  placeholder="Contoh: Rencana Usaha Bersama / Jastip Padang"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn-back-home"
                  onClick={() => setIsEditInfoOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Simpan Nama
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CATAT PENJUALAN CEPAT */}
      {isAddSaleOpen && (
        <div className="modal-overlay" onClick={() => setIsAddSaleOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Catat Penjualan Baru</h3>
              <button className="modal-close-btn" onClick={() => setIsAddSaleOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveSale}>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Tanggal Penjualan:</label>
                <input
                  type="date"
                  className="form-input"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Metode Penjualan (Pilih Jalur):</label>
                <select
                  className="form-select"
                  value={saleMethod}
                  onChange={(e) => setSaleMethod(e.target.value)}
                >
                  {selectedMethods.map(mId => {
                    const mObj = SALES_METHODS_LIST.find(m => m.id === mId);
                    return (
                      <option key={mId} value={mId}>
                        {mObj?.label || mId}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Jumlah Terjual (pcs):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={salePcs}
                    onChange={(e) => setSalePcs(e.target.value)}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Harga Satuan (Rp):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Nama Pembeli / Keterangan:</label>
                <input
                  type="text"
                  className="form-input"
                  value={saleBuyer}
                  onChange={(e) => setSaleBuyer(e.target.value)}
                  placeholder="Misal: Kak Rina / COD Padang Baru"
                />
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '10px',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem'
                }}
              >
                <span style={{ color: '#475569', fontWeight: 600 }}>Total Uang Masuk:</span>
                <strong style={{ color: '#047857', fontSize: '1.05rem', fontWeight: 900 }}>
                  {formatIdr((parseInt(salePcs, 10) || 1) * (parseFloat(salePrice) || 0))}
                </strong>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-back-home"
                  onClick={() => setIsAddSaleOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.55rem 1.1rem',
                    borderRadius: '8px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Simpan Penjualan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
