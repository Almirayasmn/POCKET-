import React, { useState, useEffect } from 'react';
import { usePocket } from '../context/PocketContext';
import {
  PRESETS_YASMEEN,
  PRESETS_ADZIIMA,
  PAYMENT_METHODS_YASMEEN,
  PAYMENT_METHODS_ADZIIMA
} from '../data/initialData';
import { formatCny, formatIdr } from '../utils/formatters';
import CategoryIcon from './CategoryIcon';
import confetti from 'canvas-confetti';
import { X, Plus, Check, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export default function QuickAddModal({ isOpen, onClose, editingTx = null, defaultType = 'Keluar' }) {
  const {
    activeView,
    addTransaction,
    updateTransaction,
    yasmeenCategories,
    adziimaCategories,
    exchangeRate,
    selectedMonth,
    setSelectedMonth
  } = usePocket();

  const isAdziima = activeView === 'adziima';
  const currentCategories = isAdziima ? adziimaCategories : yasmeenCategories;
  const currentPresets = isAdziima ? PRESETS_ADZIIMA : PRESETS_YASMEEN;
  const currentPaymentMethods = isAdziima ? PAYMENT_METHODS_ADZIIMA : PAYMENT_METHODS_YASMEEN;

  const [type, setType] = useState('Keluar'); // 'Keluar' | 'Masuk'
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [inputCurrency, setInputCurrency] = useState(isAdziima ? 'IDR' : 'CNY');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return today.startsWith(selectedMonth || '2026-11') ? today : `${selectedMonth || '2026-11'}-01`;
  });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingTx) {
        setType(editingTx.type || 'Keluar');
        setTitle(editingTx.title || '');
        setAmount(
          isAdziima
            ? (editingTx.amountIdr || 0).toString()
            : (editingTx.amountCny || 0).toString()
        );
        setInputCurrency(isAdziima ? 'IDR' : (editingTx.inputCurrency || 'CNY'));
        setCategory(editingTx.category || (isAdziima ? 'makan_harian' : 'makan'));
        setPaymentMethod(editingTx.paymentMethod || (isAdziima ? 'QRIS' : 'WeChat Pay'));
        setDate(editingTx.date || new Date().toISOString().split('T')[0]);
        setNotes(editingTx.notes || '');
      } else {
        const today = new Date().toISOString().split('T')[0];
        const initialDate = today.startsWith(selectedMonth || '2026-11') ? today : `${selectedMonth || '2026-11'}-01`;
        setType(defaultType || 'Keluar');
        setTitle('');
        setAmount('');
        setInputCurrency(isAdziima ? 'IDR' : 'CNY');
        setPaymentMethod(currentPaymentMethods[0] || (isAdziima ? 'QRIS' : 'WeChat Pay'));
        setCategory(currentCategories[0]?.id || (isAdziima ? 'makan_harian' : 'makan'));
        setDate(initialDate);
        setNotes('');
      }
    }
  }, [isOpen, editingTx, isAdziima, selectedMonth, defaultType]);

  if (!isOpen) return null;

  const handleSelectPreset = (p) => {
    setTitle(p.title);
    setAmount(p.amount.toString());
    setInputCurrency(isAdziima ? 'IDR' : p.currency);
    setCategory(p.category);
    setType('Keluar');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Masukkan nominal yang valid!');
      return;
    }

    const finalCat = category || currentCategories[0]?.id || (isAdziima ? 'makan_harian' : 'makan');
    const finalMethod = paymentMethod || currentPaymentMethods[0] || (isAdziima ? 'QRIS' : 'WeChat Pay');
    const catObj = currentCategories.find(c => c.id === finalCat);

    const payload = {
      title: title.trim() || catObj?.name || (type === 'Masuk' ? 'Pemasukan' : 'Pengeluaran'),
      amount: parseFloat(amount),
      inputCurrency: isAdziima ? 'IDR' : inputCurrency,
      category: finalCat,
      type,
      paymentMethod: finalMethod,
      date: date || `${selectedMonth}-01`,
      notes: notes.trim()
    };

    const targetUser = isAdziima ? 'adziima' : 'yasmeen';

    if (editingTx) {
      updateTransaction(targetUser, editingTx.id, payload);
    } else {
      addTransaction(targetUser, payload);

      // Automatically sync selectedMonth if user picked a date in a different month
      const txMonth = (date || selectedMonth).slice(0, 7);
      if (txMonth && txMonth !== selectedMonth) {
        setSelectedMonth(txMonth);
      }

      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: isAdziima ? ['#38bdf8', '#0284c7', '#bae6fd'] : ['#f472b6', '#db2777', '#fbcfe8']
        });
      } catch (err) {
        // ignore
      }
    }

    onClose();
  };

  const numAmount = parseFloat(amount) || 0;
  let previewText = '';
  if (numAmount > 0 && !isAdziima) {
    if (inputCurrency === 'CNY') {
      previewText = `≈ ${formatIdr(numAmount * exchangeRate)}`;
    } else {
      previewText = `≈ ${formatCny(numAmount / exchangeRate)}`;
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: isAdziima ? '#0284c7' : '#db2777' }}>
              {isAdziima ? 'Adziima' : 'Yasmeen'}
            </span>
            <h3>
              {editingTx
                ? 'Edit Transaksi'
                : isAdziima
                ? 'Catat Transaksi (Rp)'
                : 'Catat Transaksi (¥)'}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Transaction Type Tabs: Pengeluaran vs Pemasukan */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
          <button
            type="button"
            className="user-pill"
            style={{
              flex: 1,
              justifyContent: 'center',
              background: type === 'Keluar' ? '#fff' : 'var(--bg-subtle)',
              border: `2px solid ${type === 'Keluar' ? '#f43f5e' : 'var(--card-border-subtle)'}`,
              color: type === 'Keluar' ? '#e11d48' : 'var(--text-muted)'
            }}
            onClick={() => setType('Keluar')}
          >
            <ArrowDownCircle size={15} />
            <span>Pengeluaran (Keluar)</span>
          </button>

          <button
            type="button"
            className="user-pill"
            style={{
              flex: 1,
              justifyContent: 'center',
              background: type === 'Masuk' ? '#fff' : 'var(--bg-subtle)',
              border: `2px solid ${type === 'Masuk' ? '#10b981' : 'var(--card-border-subtle)'}`,
              color: type === 'Masuk' ? '#059669' : 'var(--text-muted)'
            }}
            onClick={() => setType('Masuk')}
          >
            <ArrowUpCircle size={15} />
            <span>Pemasukan (Masuk)</span>
          </button>
        </div>

        {/* Presets (Only when adding expense) */}
        {!editingTx && type === 'Keluar' && (
          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Pilihan Cepat 1-Klik:
            </div>
            <div className="preset-chips-list">
              {currentPresets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  className="preset-chip"
                  onClick={() => handleSelectPreset(p)}
                >
                  <CategoryIcon name={p.iconName} size={13} color="currentColor" />
                  <span>
                    {p.title} ({p.currency === 'IDR' ? `Rp ${p.amount.toLocaleString('id-ID')}` : `¥${p.amount}`})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Amount */}
          <div className="form-group">
            <label className="form-label">
              Nominal {isAdziima ? '(Rupiah Rp)' : '(Yuan ¥ / Rp)'} *
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                step="any"
                className="form-input"
                placeholder={isAdziima ? 'Contoh: 25000' : 'Contoh: 15'}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
              />
              {!isAdziima && (
                <button
                  type="button"
                  style={{
                    padding: '0 0.8rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--card-border-subtle)',
                    background: '#fdf2f8',
                    color: '#db2777',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  onClick={() => setInputCurrency(inputCurrency === 'CNY' ? 'IDR' : 'CNY')}
                >
                  {inputCurrency === 'CNY' ? '¥ Yuan' : 'Rp IDR'}
                </button>
              )}
            </div>
            {previewText && (
              <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '0.3rem' }}>
                {previewText}
              </div>
            )}
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Keterangan Transaksi *</label>
            <input
              type="text"
              className="form-input"
              placeholder={type === 'Masuk' ? 'Contoh: Gaji, Kiriman orang tua, Freelance...' : isAdziima ? 'Contoh: Nasi padang, Bensin, Belanja mingguan...' : 'Contoh: Kantin GXPC, Mixue, Metro...'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Category Picker */}
          <div className="form-group">
            <label className="form-label">Kategori Pos</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.4rem', maxHeight: '160px', overflowY: 'auto', padding: '0.2rem' }}>
              {currentCategories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: `1.5px solid ${category === cat.id ? (isAdziima ? '#38bdf8' : '#f472b6') : 'var(--card-border-subtle)'}`,
                    background: category === cat.id ? (isAdziima ? 'var(--pastel-blue-soft)' : 'var(--pastel-pink-soft)') : '#ffffff',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <CategoryIcon name={cat.iconName} size={15} color={cat.color} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Metode Pembayaran</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {currentPaymentMethods.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tanggal</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Catatan Tambahan (Opsional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Catatan kecil..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={`submit-btn ${isAdziima ? 'blue' : 'pink'}`}
          >
            <Check size={18} />
            <span>{editingTx ? 'Perbarui Transaksi' : 'Simpan Transaksi'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
