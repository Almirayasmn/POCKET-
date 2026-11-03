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
  Weight,
  Scale,
  FolderPlus,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function BusinessView({ onOpenCloudModal }) {
  const {
    setActiveView,
    business,
    businessCalculations,
    addBusinessProject,
    updateBusinessProject,
    deleteBusinessProject,
    setActiveBusinessProject,
    recordBusinessSale,
    deleteBusinessSale,
    isCloudConnected,
    isCloudSyncing
  } = usePocket();

  const calc = businessCalculations || {};
  const projects = calc.projects || [];
  const activeProjectId = calc.activeProjectId || (projects[0]?.id || 'biz-1');
  const activeProject = calc.activeProject || projects[0] || {};

  // View state: 'hub' (Daftar Semua Bisnis & Buat Baru) vs 'detail' (Halaman Khusus Bisnis Terpilih)
  const [viewMode, setViewMode] = useState(projects.length > 0 ? 'detail' : 'hub');
  const [isCreatingNew, setIsCreatingNew] = useState(projects.length === 0);

  // New Project Form State
  const [newCategory, setNewCategory] = useState('fashion');
  const [newCustomCategory, setNewCustomCategory] = useState('');
  const [newBizName, setNewBizName] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newTotalUnits, setNewTotalUnits] = useState('50');
  const [newItemCostTotal, setNewItemCostTotal] = useState('3000000');
  // Ongkir per Kg:
  const [newWeightKg, setNewWeightKg] = useState('35');
  const [newShippingCostPerKg, setNewShippingCostPerKg] = useState('3700');
  const [newOtherCostTotal, setNewOtherCostTotal] = useState('50000');
  const [newTargetPrice, setNewTargetPrice] = useState('120000');
  const [newNotes, setNewNotes] = useState('');
  const [newSelectedMethods, setNewSelectedMethods] = useState(['ready_stock', 'pre_order', 'online_shop']);

  // Edit Existing Project Form State (in Detail View)
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUnits, setEditUnits] = useState('');
  const [editItemCost, setEditItemCost] = useState('');
  const [editWeightKg, setEditWeightKg] = useState('');
  const [editShippingPerKg, setEditShippingPerKg] = useState('');
  const [editOtherCost, setEditOtherCost] = useState('');
  const [editTargetPrice, setEditTargetPrice] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Add Sale Modal State
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [saleMethod, setSaleMethod] = useState('');
  const [salePcs, setSalePcs] = useState('1');
  const [salePrice, setSalePrice] = useState('');
  const [saleBuyer, setSaleBuyer] = useState('');
  const [saleSeller, setSaleSeller] = useState('berdua');

  // Toast alert
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Helper icon for business type
  const getBizIcon = (typeId, size = 18) => {
    switch (typeId) {
      case 'fashion': return <Shirt size={size} />;
      case 'jastip_impor': return <Plane size={size} />;
      case 'fnb': return <Utensils size={size} />;
      case 'beauty': return <Sparkles size={size} />;
      case 'accessories': return <Gem size={size} />;
      case 'electronics': return <Smartphone size={size} />;
      case 'services': return <Briefcase size={size} />;
      default: return <ShoppingBag size={size} />;
    }
  };

  // Switch to a project's dedicated page
  const handleOpenProjectDetail = (projId) => {
    setActiveBusinessProject(projId);
    setViewMode('detail');
    setIsCreatingNew(false);
  };

  // Toggle Sales Method for a project
  const handleToggleMethod = (projId, methodId) => {
    const proj = projects.find(p => p.id === projId);
    if (!proj) return;
    const curMethods = proj.selectedSalesMethods || ['ready_stock'];
    let updatedMethods = [];
    if (curMethods.includes(methodId)) {
      if (curMethods.length <= 1) {
        alert('Minimal harus ada 1 metode penjualan yang aktif!');
        return;
      }
      updatedMethods = curMethods.filter(m => m !== methodId);
    } else {
      updatedMethods = [...curMethods, methodId];
    }
    updateBusinessProject(projId, { selectedSalesMethods: updatedMethods });
  };

  // Toggle Sales Method in New Project Creation Form
  const handleToggleNewMethod = (methodId) => {
    if (newSelectedMethods.includes(methodId)) {
      if (newSelectedMethods.length <= 1) return;
      setNewSelectedMethods(newSelectedMethods.filter(m => m !== methodId));
    } else {
      setNewSelectedMethods([...newSelectedMethods, methodId]);
    }
  };

  // Create New Business Project and immediately open its dedicated page
  const handleCreateProject = (e) => {
    e.preventDefault();
    const catObj = BUSINESS_TYPES.find(b => b.id === newCategory);
    const finalName = newBizName.trim() || `Bisnis ${catObj?.label || 'Baru'}`;

    const newId = addBusinessProject({
      name: finalName,
      category: newCategory,
      customCategoryName: newCustomCategory.trim(),
      productName: newProductName.trim() || 'Produk Perdana',
      totalUnits: parseInt(newTotalUnits, 10) || 50,
      itemCostTotal: parseFloat(newItemCostTotal) || 0,
      weightKg: parseFloat(newWeightKg) || 0,
      shippingCostPerKg: parseFloat(newShippingCostPerKg) || 0,
      otherCostTotal: parseFloat(newOtherCostTotal) || 0,
      targetPricePerUnit: parseFloat(newTargetPrice) || 100000,
      notes: newNotes,
      selectedSalesMethods: newSelectedMethods
    });

    try {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 } });
    } catch (err) {}

    showToast(`✓ Halaman khusus untuk "${finalName}" berhasil dibuat!`);
    setIsCreatingNew(false);
    setViewMode('detail');
  };

  // Open Edit Modal for Active Project
  const handleOpenEditModal = () => {
    if (!activeProject) return;
    setEditUnits((activeProject.totalUnits || 50).toString());
    setEditItemCost((activeProject.itemCostTotal || 0).toString());
    setEditWeightKg((activeProject.weightKg || 0).toString());
    setEditShippingPerKg((activeProject.shippingCostPerKg || 0).toString());
    setEditOtherCost((activeProject.otherCostTotal || 0).toString());
    setEditTargetPrice((activeProject.targetPricePerUnit || 100000).toString());
    setEditNotes(activeProject.notes || '');
    setIsEditOpen(true);
  };

  // Save Edit Updates
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!activeProject?.id) return;

    updateBusinessProject(activeProject.id, {
      totalUnits: parseInt(editUnits, 10) || 1,
      itemCostTotal: parseFloat(editItemCost) || 0,
      weightKg: parseFloat(editWeightKg) || 0,
      shippingCostPerKg: parseFloat(editShippingPerKg) || 0,
      otherCostTotal: parseFloat(editOtherCost) || 0,
      targetPricePerUnit: parseFloat(editTargetPrice) || 0,
      notes: editNotes
    });

    setIsEditOpen(false);
    showToast('✓ Data modal, ongkir per kg, dan harga jual berhasil diperbarui!');
  };

  // Open Add Sale Modal
  const handleOpenAddSale = () => {
    const curProj = activeProject;
    const methods = curProj?.selectedSalesMethods || ['ready_stock'];
    setSaleMethod(methods[0] || 'ready_stock');
    setSalePcs('1');
    setSalePrice((curProj?.targetPricePerUnit || 100000).toString());
    setSaleBuyer('');
    setSaleSeller('berdua');
    setSaleDate(new Date().toISOString().split('T')[0]);
    setIsAddSaleOpen(true);
  };

  // Save Sale for Active Project
  const handleSaveSale = (e) => {
    e.preventDefault();
    if (!activeProject?.id) return;

    const qty = parseInt(salePcs, 10) || 1;
    const price = parseFloat(salePrice) || activeProject.targetPricePerUnit || 100000;

    recordBusinessSale({
      projectId: activeProject.id,
      date: saleDate,
      method: saleMethod,
      pcs: qty,
      pricePerPcs: price,
      buyerOrNote: saleBuyer,
      seller: saleSeller
    });

    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    } catch (err) {}

    setIsAddSaleOpen(false);
    showToast(`✓ Berhasil mencatat penjualan ${qty} pcs!`);
  };

  // Delete Project
  const handleDeleteProject = (projId, projName) => {
    if (confirm(`Hapus proyek bisnis "${projName}" beserta seluruh datanya?`)) {
      deleteBusinessProject(projId);
      showToast(`✓ Proyek "${projName}" berhasil dihapus`);
      if (projects.length <= 1) {
        setViewMode('hub');
        setIsCreatingNew(true);
      }
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
            padding: '0.65rem 1.15rem',
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

      {/* TOP HEADER CONTROLS */}
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            className="btn-back-home"
            onClick={() => setActiveView('landing')}
            title="Kembali ke Beranda Utama"
          >
            <ArrowLeft size={16} />
            <span>Beranda</span>
          </button>

          {/* If inside detail view, show button to view all businesses */}
          {viewMode === 'detail' && (
            <button
              onClick={() => {
                setViewMode('hub');
                setIsCreatingNew(false);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#faf5ff',
                border: '1.5px solid #d8b4fe',
                color: '#6b21a8',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.76rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
              title="Buka daftar semua kategori & bisnis"
            >
              <Layers size={14} />
              <span>Semua Bisnis ({projects.length})</span>
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '11px',
                background: '#ede9fe',
                border: '1.5px solid #c4b5fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7c3aed'
              }}
            >
              {viewMode === 'detail' ? getBizIcon(activeProject?.category) : <Briefcase size={18} />}
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#581c87', margin: 0, lineHeight: 1.2 }}>
                {viewMode === 'detail' ? (activeProject?.name || 'Halaman Bisnis') : 'Manajemen Bisnis Berdua'}
              </h2>
              <div style={{ fontSize: '0.74rem', color: '#6d28d9', marginTop: '0.1rem', fontWeight: 600 }}>
                {viewMode === 'detail'
                  ? `${BUSINESS_TYPES.find(b => b.id === activeProject?.category)?.label || 'Usaha'} · Terpisah & Mandiri`
                  : 'Kelola per kategori usaha secara terpisah & mandiri'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          {viewMode === 'hub' && (
            <button
              type="button"
              onClick={() => setIsCreatingNew(!isCreatingNew)}
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
              <Plus size={15} />
              <span>{isCreatingNew ? 'Tutup Form' : '+ Tambah Bisnis Baru'}</span>
            </button>
          )}

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
            <span>{isCloudConnected ? 'Cloud' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: HUB / DAFTAR BISNIS & FORM PEMBUATAN BISNIS BARU */}
      {/* ========================================================================= */}
      {viewMode === 'hub' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Form Buat Bisnis Baru */}
          {isCreatingNew && (
            <div
              style={{
                background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)',
                borderRadius: '16px',
                border: '2px solid #c4b5fd',
                padding: '1.25rem',
                boxShadow: '0 4px 20px rgba(124, 58, 237, 0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                    <FolderPlus size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#4c1d95', margin: 0 }}>
                      Buat Halaman Bisnis Baru
                    </h3>
                    <p style={{ fontSize: '0.76rem', color: '#6d28d9', margin: 0 }}>
                      Isi data awal dan tarif ongkir per kg, setelah disimpan akan langsung membuka halamannya sendiri
                    </p>
                  </div>
                </div>
                {projects.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <form onSubmit={handleCreateProject}>
                {/* 1. Kategori Bisnis */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                    1. Pilih Kategori Usaha:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.45rem' }}>
                    {BUSINESS_TYPES.map(bt => {
                      const isSel = newCategory === bt.id;
                      return (
                        <div
                          key={bt.id}
                          onClick={() => setNewCategory(bt.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.5rem 0.65rem',
                            borderRadius: '10px',
                            border: isSel ? '2px solid #7c3aed' : '1.5px solid #e2e8f0',
                            background: isSel ? '#f5f3ff' : '#ffffff',
                            color: isSel ? '#581c87' : '#475569',
                            fontWeight: isSel ? 800 : 600,
                            fontSize: '0.76rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ color: isSel ? '#7c3aed' : '#94a3b8' }}>
                            {getBizIcon(bt.id, 16)}
                          </div>
                          <span style={{ flex: 1 }}>{bt.label}</span>
                          {isSel && <Check size={13} color="#7c3aed" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Nama Bisnis & Nama Produk */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>
                      2. Nama Bisnis / Proyek Usaha:
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={newBizName}
                      onChange={(e) => setNewBizName(e.target.value)}
                      placeholder="Contoh: Jastip Baju Padang / Katering Snack Box"
                      required
                      style={{ fontSize: '0.85rem', padding: '0.5rem 0.65rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>
                      Nama Produk / Batch Pertama:
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      placeholder="Contoh: Koleksi Baju Batch 1 / Brownies 200gr"
                      style={{ fontSize: '0.85rem', padding: '0.5rem 0.65rem' }}
                    />
                  </div>
                </div>

                {/* 3. Input Modal, Qty & Ongkir PER KG */}
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    padding: '0.85rem 1rem',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Scale size={15} color="#7c3aed" />
                    <span>3. Parameter Modal, Qty & Ongkir Per Kg (Manual):</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                        Modal Beli Barang (Rp):
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={newItemCostTotal}
                        onChange={(e) => setNewItemCostTotal(e.target.value)}
                        placeholder="3000000"
                        style={{ fontSize: '0.82rem', padding: '0.45rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                        Total Berat Barang (Kg):
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={newWeightKg}
                        onChange={(e) => setNewWeightKg(e.target.value)}
                        placeholder="35"
                        step="0.1"
                        style={{ fontSize: '0.82rem', padding: '0.45rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                        Tarif Ongkir Per Kg (Rp/kg):
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={newShippingCostPerKg}
                        onChange={(e) => setNewShippingCostPerKg(e.target.value)}
                        placeholder="3700"
                        style={{ fontSize: '0.82rem', padding: '0.45rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                        Biaya Packing & Lainnya (Rp):
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={newOtherCostTotal}
                        onChange={(e) => setNewOtherCostTotal(e.target.value)}
                        placeholder="50000"
                        style={{ fontSize: '0.82rem', padding: '0.45rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                        Jumlah / Qty Barang (pcs):
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={newTotalUnits}
                        onChange={(e) => setNewTotalUnits(e.target.value)}
                        placeholder="50"
                        min="1"
                        style={{ fontSize: '0.82rem', padding: '0.45rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#581c87', display: 'block', marginBottom: '0.2rem' }}>
                        Rencana Harga Jual / Unit (Rp):
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={newTargetPrice}
                        onChange={(e) => setNewTargetPrice(e.target.value)}
                        placeholder="120000"
                        style={{ fontSize: '0.82rem', padding: '0.45rem', fontWeight: 800, color: '#581c87', background: '#faf5ff' }}
                      />
                    </div>
                  </div>

                  {/* Live Mini Preview Total Ongkir */}
                  <div style={{ marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.74rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <span>
                      📦 Total Ongkir: <strong>{newWeightKg || 0} kg × {formatIdr(parseFloat(newShippingCostPerKg) || 0)} = {formatIdr((parseFloat(newWeightKg) || 0) * (parseFloat(newShippingCostPerKg) || 0))}</strong>
                    </span>
                    <span>
                      💡 Total Modal: <strong>{formatIdr((parseFloat(newItemCostTotal) || 0) + ((parseFloat(newWeightKg) || 0) * (parseFloat(newShippingCostPerKg) || 0)) + (parseFloat(newOtherCostTotal) || 0))}</strong>
                    </span>
                  </div>
                </div>

                {/* 4. Pilih Metode Penjualan */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    4. Pilih Jalur Penjualan yang Akan Digunakan:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
                    {SALES_METHODS_LIST.map(sm => {
                      const isAct = newSelectedMethods.includes(sm.id);
                      return (
                        <div
                          key={sm.id}
                          onClick={() => handleToggleNewMethod(sm.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '10px',
                            border: isAct ? '2px solid #7c3aed' : '1.5px solid #e2e8f0',
                            background: isAct ? '#f5f3ff' : '#ffffff',
                            cursor: 'pointer'
                          }}
                        >
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: '5px',
                              border: isAct ? '2px solid #7c3aed' : '2px solid #cbd5e1',
                              background: isAct ? '#7c3aed' : '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff'
                            }}
                          >
                            {isAct && <Check size={11} strokeWidth={3} />}
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isAct ? '#4c1d95' : '#475569' }}>
                            {sm.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  <span>Simpan & Buka Halaman Bisnis Ini</span>
                  <ArrowRight size={17} />
                </button>
              </form>
            </div>
          )}

          {/* Daftar Kartu Bisnis yang Sudah Dibuat */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                Daftar Proyek & Kategori Bisnis ({projects.length})
              </h3>
              {!isCreatingNew && (
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(true)}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#7c3aed',
                    background: '#f5f3ff',
                    border: '1px solid #ddd6fe',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  + Buat Kategori Baru
                </button>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
                gap: '1rem'
              }}
            >
              {projects.map(p => {
                const catObj = BUSINESS_TYPES.find(b => b.id === p.category);
                return (
                  <div
                    key={p.id}
                    className="pastel-card"
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1.5px solid #e9d5ff',
                      padding: '1.1rem 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 10px rgba(124, 58, 237, 0.05)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      {/* Category Badge & Delete */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#ede9fe', padding: '0.2rem 0.55rem', borderRadius: '99px', color: '#6d28d9', fontSize: '0.72rem', fontWeight: 800 }}>
                          {getBizIcon(p.category, 14)}
                          <span>{catObj?.label || p.category}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteProject(p.id, p.name)}
                          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                          title="Hapus proyek ini"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#581c87', margin: '0 0 0.25rem', lineHeight: 1.2 }}>
                        {p.name}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.85rem' }}>
                        {p.productName || 'Produk Perdana'} · {p.totalUnits || 0} unit
                      </p>

                      {/* Mini Key Metrics Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#faf5ff', padding: '0.65rem', borderRadius: '12px', border: '1px solid #f3e8ff', marginBottom: '0.85rem' }}>
                        <div>
                          <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#7c3aed' }}>ESTIMASI HPP</div>
                          <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#581c87' }}>
                            {formatIdr(p.hppPerUnit || 0)}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#6b21a8' }}>
                            Ongkir: {p.weightKg || 0} kg (@{formatIdr(p.shippingCostPerKg || 0)})
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#047857' }}>EST. UNTUNG / UNIT</div>
                          <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#065f46' }}>
                            +{formatIdr(p.profitPerUnit || 0)}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#059669' }}>
                            Margin: {p.marginPercent || 0}%
                          </div>
                        </div>
                      </div>

                      {/* BEP / Balik Modal Mini Bar */}
                      <div style={{ marginBottom: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>
                          <span>Balik Modal: {p.bepUnits || 0} unit</span>
                          <span>{p.bepPercent || 0}% Tertutup</span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: '#ede9fe', borderRadius: 99, overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${p.bepPercent || 0}%`,
                              background: '#7c3aed',
                              borderRadius: 99
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenProjectDetail(p.id)}
                      style={{
                        width: '100%',
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
                        boxShadow: '0 2px 8px rgba(124, 58, 237, 0.2)'
                      }}
                    >
                      <span>Buka Halaman Khusus Bisnis Ini</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: DEDICATED PAGE KHUSUS BISNIS INI (TIDAK BERCAMPUR) */}
      {/* ========================================================================= */}
      {viewMode === 'detail' && activeProject && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Quick Switcher Bar between projects */}
          {projects.length > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                overflowX: 'auto',
                paddingBottom: '0.2rem'
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>Ganti Bisnis:</span>
              {projects.map(p => {
                const isCur = p.id === activeProject.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActiveBusinessProject(p.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.3rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      border: isCur ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
                      background: isCur ? '#ede9fe' : '#ffffff',
                      color: isCur ? '#581c87' : '#475569',
                      fontSize: '0.74rem',
                      fontWeight: isCur ? 800 : 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {getBizIcon(p.category, 13)}
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* SECTION A: HASIL ESTIMASI HPP & LABA OTOMATIS */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%)',
              borderRadius: '16px',
              border: '2px solid #ddd6fe',
              padding: '1.25rem',
              boxShadow: '0 4px 16px rgba(124, 58, 237, 0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#ede9fe', padding: '0.2rem 0.55rem', borderRadius: '99px', color: '#6d28d9', fontSize: '0.72rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                  {getBizIcon(activeProject.category, 13)}
                  <span>Kategori: {BUSINESS_TYPES.find(b => b.id === activeProject.category)?.label || activeProject.category}</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#4c1d95', margin: 0, lineHeight: 1.2 }}>
                  {activeProject.name}
                </h3>
                <p style={{ fontSize: '0.76rem', color: '#6d28d9', margin: '0.15rem 0 0' }}>
                  {activeProject.productName} · {activeProject.totalUnits || 0} unit · Rencana Jual {formatIdr(activeProject.targetPricePerUnit || 0)}/unit
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenEditModal}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: '#ffffff',
                  border: '1.5px solid #c4b5fd',
                  color: '#6b21a8',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(124, 58, 237, 0.08)'
                }}
              >
                <Settings size={14} />
                <span>Edit Modal & Ongkir Per Kg</span>
              </button>
            </div>

            {/* Main Big Metric: Estimasi HPP */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1.5px solid #c4b5fd',
                padding: '0.85rem 1.15rem',
                marginBottom: '1rem',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6d28d9', letterSpacing: '0.04em' }}>
                  ESTIMASI HPP (HARGA POKOK PENJUALAN PER UNIT)
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#581c87', marginTop: '0.1rem' }}>
                  {formatIdr(activeProject.hppPerUnit || 0)} <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#6d28d9' }}>/ unit</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Rincian Modal: Modal Beli {formatIdr(activeProject.itemCostTotal || 0)}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#6d28d9', fontWeight: 700 }}>
                  Ongkir ({activeProject.weightKg || 0} kg @{formatIdr(activeProject.shippingCostPerKg || 0)}): {formatIdr(activeProject.totalShippingCost || 0)}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 800, marginTop: '0.15rem' }}>
                  Total Modal Bersih: {formatIdr(activeProject.totalCapitalCost || 0)}
                </div>
              </div>
            </div>

            {/* 4 Cards Grid of Calculated Insights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '0.75rem 0.9rem', border: '1.5px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#047857' }}>EST. UNTUNG / UNIT</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#065f46', marginTop: '0.15rem' }}>
                  +{formatIdr(activeProject.profitPerUnit || 0)}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>
                  Margin: {activeProject.marginPercent || 0}%
                </div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '0.75rem 0.9rem', border: '1.5px solid #fde047' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#92400e' }}>TITIK BALIK MODAL (BEP)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#78350f', marginTop: '0.15rem' }}>
                  {activeProject.bepUnits || 0} unit
                </div>
                <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 700 }}>
                  harus terjual untuk balik modal
                </div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '0.75rem 0.9rem', border: '1.5px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569' }}>POTENSI TOTAL OMZET</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e293b', marginTop: '0.15rem' }}>
                  {formatIdr(activeProject.totalEstimatedRevenue || 0)}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  Jika {activeProject.totalUnits || 0} unit habis terjual
                </div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '0.75rem 0.9rem', border: '1.5px solid #ddd6fe' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6d28d9' }}>POTENSI LABA BERSIH</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#581c87', marginTop: '0.15rem' }}>
                  +{formatIdr(activeProject.totalEstimatedNetProfit || 0)}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#7c3aed', fontWeight: 700 }}>
                  Yasmeen & Adziima 50:50
                </div>
              </div>
            </div>

            {/* Summary notes */}
            {activeProject.notes && (
              <div style={{ fontSize: '0.76rem', color: '#64748b', background: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                📌 Catatan: {activeProject.notes}
              </div>
            )}
          </div>

          {/* SECTION B: JALUR / METODE PENJUALAN KHUSUS BISNIS INI */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #e9d5ff',
              padding: '1.1rem 1.25rem',
              boxShadow: '0 2px 10px rgba(124, 58, 237, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#4c1d95', margin: 0 }}>
                  Metode Penjualan Khusus {activeProject.name}
                </h4>
                <p style={{ fontSize: '0.74rem', color: '#6d28d9', margin: 0 }}>
                  Aktifkan saluran jualan yang kamu gunakan untuk kategori bisnis ini
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.55rem' }}>
              {SALES_METHODS_LIST.map(sm => {
                const isAct = (activeProject.selectedSalesMethods || []).includes(sm.id);
                return (
                  <div
                    key={sm.id}
                    onClick={() => handleToggleMethod(activeProject.id, sm.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: isAct ? '2px solid #7c3aed' : '1.5px solid #e2e8f0',
                      background: isAct ? '#f5f3ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '5px',
                        border: isAct ? '2px solid #7c3aed' : '2px solid #cbd5e1',
                        background: isAct ? '#7c3aed' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff'
                      }}
                    >
                      {isAct && <Check size={11} strokeWidth={3} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: isAct ? '#4c1d95' : '#334155' }}>
                        {sm.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, color: isAct ? '#7c3aed' : '#94a3b8' }}>
                      {isAct ? 'Aktif' : 'Off'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION C: PENCATATAN PENJUALAN AKTUAL & BALIK MODAL */}
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
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#4c1d95', margin: 0 }}>
                  Catatan Penjualan & Realisasi Balik Modal
                </h4>
                <p style={{ fontSize: '0.74rem', color: '#6d28d9', margin: 0 }}>
                  Catat setiap kali ada unit terjual khusus di bisnis ini
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddSale}
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

            {/* Realization Ribbon */}
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
                  {activeProject.totalPcsSold || 0} unit
                </div>
                <div style={{ fontSize: '0.68rem', color: '#7c3aed' }}>
                  Sisa {activeProject.remainingUnits || 0} unit
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#6d28d9' }}>OMZET AKTUAL</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#581c87', marginTop: '0.1rem' }}>
                  {formatIdr(activeProject.totalActualRevenue || 0)}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#7c3aed' }}>
                  Uang riil masuk
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#6d28d9' }}>BALIK MODAL (BEP)</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: activeProject.isCapitalRecovered ? '#047857' : '#b45309', marginTop: '0.1rem' }}>
                  {activeProject.bepPercent || 0}%
                </div>
                <div style={{ fontSize: '0.68rem', color: activeProject.isCapitalRecovered ? '#059669' : '#b45309' }}>
                  {activeProject.isCapitalRecovered ? '✓ Modal Sudah Tertutup' : `Butuh ${Math.max(0, (activeProject.bepUnits || 0) - (activeProject.totalPcsSold || 0))} unit lagi`}
                </div>
              </div>
            </div>

            {/* Sales Table */}
            {(activeProject.sales || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.82rem' }}>
                Belum ada catatan penjualan di bisnis ini. Klik <strong>"+ Catat Penjualan"</strong> di atas!
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
                    {(activeProject.sales || []).map(s => {
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
                              onClick={() => deleteBusinessSale(s.id, activeProject.id)}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                              title="Hapus penjualan ini"
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT MODAL & ONGKIR PER KG (FOR ACTIVE PROJECT) */}
      {/* ========================================================================= */}
      {isEditOpen && (
        <div className="modal-overlay" onClick={() => setIsEditOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Modal & Ongkir Per Kg ({activeProject?.name})</h3>
              <button className="modal-close-btn" onClick={() => setIsEditOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Modal Beli Barang (Rp):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editItemCost}
                    onChange={(e) => setEditItemCost(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Jumlah / Qty Barang (pcs):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editUnits}
                    onChange={(e) => setEditUnits(e.target.value)}
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Ongkir per Kg Fields */}
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '0.5rem' }}>
                  Hitungan Ongkir per Kg:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Berat Barang (Kg):</label>
                    <input
                      type="number"
                      className="form-input"
                      value={editWeightKg}
                      onChange={(e) => setEditWeightKg(e.target.value)}
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Tarif Ongkir per Kg (Rp):</label>
                    <input
                      type="number"
                      className="form-input"
                      value={editShippingPerKg}
                      onChange={(e) => setEditShippingPerKg(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 700, marginTop: '0.4rem' }}>
                  Total Ongkir: {formatIdr((parseFloat(editWeightKg) || 0) * (parseFloat(editShippingPerKg) || 0))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Packing / Lainnya (Rp):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editOtherCost}
                    onChange={(e) => setEditOtherCost(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Target Harga Jual (Rp):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editTargetPrice}
                    onChange={(e) => setEditTargetPrice(e.target.value)}
                    required
                    style={{ fontWeight: 800, color: '#581c87' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Catatan Tambahan:</label>
                <input
                  type="text"
                  className="form-input"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Misal: Catatan kargo atau ekspedisi"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-back-home"
                  onClick={() => setIsEditOpen(false)}
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
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CATAT PENJUALAN CEPAT (FOR ACTIVE PROJECT) */}
      {/* ========================================================================= */}
      {isAddSaleOpen && activeProject && (
        <div className="modal-overlay" onClick={() => setIsAddSaleOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Catat Penjualan ({activeProject.name})</h3>
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
                <label className="form-label">Pilih Jalur Penjualan:</label>
                <select
                  className="form-select"
                  value={saleMethod}
                  onChange={(e) => setSaleMethod(e.target.value)}
                >
                  {(activeProject.selectedSalesMethods || ['ready_stock']).map(mId => {
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
