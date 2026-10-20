import React, { useState } from 'react';
import { usePocket } from '../context/PocketContext';
import CategoryIcon from './CategoryIcon';
import { formatCny, formatIdr } from '../utils/formatters';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Check,
  Tag,
  Sparkles,
  Sliders
} from 'lucide-react';

const AVAILABLE_ICONS = [
  'Utensils',
  'Coffee',
  'CupSoda',
  'Train',
  'Bike',
  'Plane',
  'ShoppingBag',
  'Luggage',
  'Shirt',
  'Zap',
  'Wifi',
  'HeartPulse',
  'Pill',
  'Coins',
  'CircleDollarSign',
  'Flame',
  'Cigarette',
  'Tag'
];

const PRESET_COLORS = [
  '#f472b6', // pink
  '#ec4899', // deep pink
  '#38bdf8', // sky blue
  '#0284c7', // deep blue
  '#10b981', // emerald green
  '#34d399', // mint green
  '#fbbf24', // amber
  '#f97316', // orange
  '#a855f7', // purple
  '#6366f1', // indigo
  '#f43f5e', // rose
  '#64748b'  // slate
];

export default function ManageCategoriesModal({ isOpen, onClose, userId = 'yasmeen' }) {
  const {
    yasmeenCategories,
    adziimaCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    exchangeRate,
    selectedMonth
  } = usePocket();

  const isAdziima = userId === 'adziima';
  const categories = isAdziima ? adziimaCategories : yasmeenCategories;
  const themeColor = isAdziima ? '#0284c7' : '#db2777';

  // Mode: 'list' | 'add' | 'edit'
  const [mode, setMode] = useState('list');
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [iconName, setIconName] = useState('Tag');
  const [color, setColor] = useState(isAdziima ? '#38bdf8' : '#f472b6');
  const [budget, setBudget] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setIconName('Tag');
    setColor(isAdziima ? '#38bdf8' : '#f472b6');
    setBudget('');
    setNote('');
    setMode('add');
  };

  const handleOpenEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.name || '');
    setIconName(cat.iconName || 'Tag');
    setColor(cat.color || (isAdziima ? '#0284c7' : '#db2777'));
    setBudget(isAdziima ? (cat.budgetIdr || 0).toString() : (cat.budgetCny || 0).toString());
    setNote(cat.note || '');
    setMode('edit');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (mode === 'add') {
      addCategory(userId, {
        name: name.trim(),
        iconName,
        color,
        budget: parseFloat(budget) || 0,
        note: note.trim()
      });
    } else if (mode === 'edit' && editingId) {
      updateCategory(userId, editingId, {
        name: name.trim(),
        iconName,
        color,
        budget: parseFloat(budget) || 0,
        note: note.trim()
      });
    }

    setMode('list');
    setEditingId(null);
  };

  const handleDelete = (cat) => {
    if (window.confirm(`Hapus pos "${cat.name}"? Catatan transaksi yang sudah ada tetap aman.`)) {
      deleteCategory(userId, cat.id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: isAdziima ? '#e0f2fe' : '#fce7f3',
                color: themeColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sliders size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: themeColor }}>
                Kelola Pos Anggaran
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: 0 }}>
                {isAdziima ? 'Pos Keuangan Adziima (Rp)' : 'Pos Keuangan Yasmeen (¥)'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* View Mode: List vs Form */}
        {mode === 'list' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Daftar Pos ({categories.length} Pos Aktif)
              </span>
              <button
                type="button"
                onClick={handleOpenAdd}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: isAdziima ? '#0284c7' : '#db2777',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.45rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <Plus size={14} />
                <span>Tambah Pos Baru</span>
              </button>
            </div>

            {/* Category Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '55vh', overflowY: 'auto', paddingRight: '0.2rem' }}>
              {categories.map((cat) => {
                const bVal = isAdziima ? (cat.budgetIdr || 0) : (cat.budgetCny || 0);
                return (
                  <div
                    key={cat.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0.9rem',
                      background: '#ffffff',
                      border: '1px solid var(--card-border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      gap: '0.6rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 'var(--radius-md)',
                          background: `${cat.color || themeColor}18`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <CategoryIcon name={cat.iconName} size={18} color={cat.color || themeColor} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {cat.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: themeColor }}>
                            Budget: {isAdziima ? formatIdr(bVal) : formatCny(bVal)}
                          </span>
                          {cat.note && <span>• {cat.note}</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cat)}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid var(--card-border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.35rem 0.55rem',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.78rem',
                          fontWeight: 600
                        }}
                        title="Edit Pos"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(cat)}
                        style={{
                          background: '#fff1f2',
                          border: '1px solid #fecdd3',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.35rem 0.55rem',
                          cursor: 'pointer',
                          color: '#e11d48',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Hapus Pos"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Add / Edit Form */
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--card-border-subtle)' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: themeColor }}>
                {mode === 'add' ? '✨ Tambah Pos Baru' : `✏️ Edit Pos: ${name}`}
              </span>
              <button
                type="button"
                onClick={() => setMode('list')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Kembali ke Daftar
              </button>
            </div>

            {/* Nama Pos */}
            <div className="form-group">
              <label className="form-label">Nama Pos / Label Kategori *</label>
              <input
                type="text"
                className="form-input"
                placeholder={isAdziima ? 'Contoh: Belanja Bulanan, Servis Motor, Gym...' : 'Contoh: Skincare, Buah & Cemilan, Buku...'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Budget Anggaran */}
            <div className="form-group">
              <label className="form-label">
                Alokasi Budget Bulanan {isAdziima ? '(Rupiah Rp)' : '(Yuan ¥)'}
              </label>
              <input
                type="number"
                step="any"
                className="form-input"
                placeholder={isAdziima ? 'Contoh: 150000' : 'Contoh: 150'}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem', display: 'block' }}>
                Boleh diisi 0 jika pos ini tidak ada target budget tetap.
              </span>
            </div>

            {/* Ikon Picker */}
            <div className="form-group">
              <label className="form-label">Pilih Ikon Pos</label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
                  gap: '0.4rem',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  padding: '0.3rem',
                  border: '1px solid var(--card-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  background: '#f8fafc'
                }}
              >
                {AVAILABLE_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIconName(ic)}
                    style={{
                      height: 38,
                      borderRadius: 'var(--radius-sm)',
                      border: iconName === ic ? `2px solid ${color}` : '1px solid transparent',
                      background: iconName === ic ? '#ffffff' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: iconName === ic ? 'var(--shadow-xs)' : 'none'
                    }}
                  >
                    <CategoryIcon name={ic} size={18} color={iconName === ic ? color : '#64748b'} />
                  </button>
                ))}
              </div>
            </div>

            {/* Warna Tag */}
            <div className="form-group">
              <label className="form-label">Warna Ikon / Tag</label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: c,
                      border: color === c ? '2.5px solid #000' : '2px solid #ffffff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Catatan Pos */}
            <div className="form-group">
              <label className="form-label">Catatan Pos (Opsional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Misal: Batas maksimal per minggu atau keterangan penting..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* Submit & Cancel Buttons */}
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.2rem' }}>
              <button
                type="button"
                onClick={() => setMode('list')}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--card-border-subtle)',
                  background: '#f8fafc',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>

              <button
                type="submit"
                style={{
                  flex: 2,
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: isAdziima ? '#0284c7' : '#db2777',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {mode === 'add' ? 'Simpan Pos Baru' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
