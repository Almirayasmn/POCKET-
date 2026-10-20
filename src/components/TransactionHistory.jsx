import React, { useState } from 'react';
import { usePocket } from '../context/PocketContext';
import { formatCny, formatIdr, formatDateIndo } from '../utils/formatters';
import { Search, Trash2, Receipt } from 'lucide-react';

export default function TransactionHistory({ onOpenAdd }) {
  const {
    transactions,
    yasmeenCategories,
    cowokuCategories,
    users,
    deleteTransaction,
    exchangeRate,
    activeUserView,
    selectedMonth
  } = usePocket();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');
  const [selectedScopeFilter, setSelectedScopeFilter] = useState('all');

  const allCategories = [...yasmeenCategories, ...cowokuCategories];

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    // Month filter
    if (selectedMonth && !tx.date.startsWith(selectedMonth)) {
      return false;
    }

    // Active user view filter
    if (activeUserView === 'yasmeen' && tx.paidBy !== 'yasmeen') return false;
    if (activeUserView === 'cowoku' && tx.paidBy !== 'cowoku') return false;

    // Scope filter (pribadi vs bersama)
    if (selectedScopeFilter === 'pribadi' && tx.scope === 'bersama') return false;
    if (selectedScopeFilter === 'bersama' && tx.scope !== 'bersama') return false;

    // Category filter
    if (selectedCatFilter !== 'all' && tx.category !== selectedCatFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (tx.title || '').toLowerCase().includes(q);
      const matchNotes = (tx.notes || '').toLowerCase().includes(q);
      const catObj = allCategories.find(c => c.id === tx.category);
      const matchCat = (catObj?.name || '').toLowerCase().includes(q);
      if (!matchTitle && !matchNotes && !matchCat) return false;
    }

    return true;
  });

  const handleDelete = (id, title) => {
    if (window.confirm(`Hapus catatan "${title}"?`)) {
      deleteTransaction(id);
    }
  };

  const getCategoryDetails = (catId) => {
    return allCategories.find(c => c.id === catId) || { name: catId, icon: '💸' };
  };

  return (
    <section className="glass-panel tx-section">
      <div className="section-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h2 className="section-title">
            <Receipt size={20} color={activeUserView === 'cowoku' ? '#3b82f6' : '#ec4899'} />
            Catatan Harian Pengeluaran (Daily Diary)
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {filteredTransactions.length} transaksi tercatat untuk{' '}
            {activeUserView === 'cowoku' ? 'Cowoku di Indonesia' : activeUserView === 'yasmeen' ? 'Yasmeen di China' : 'Berdua'}
          </p>
        </div>

        <button
          className="btn-control"
          onClick={onOpenAdd}
          style={{
            background: activeUserView === 'cowoku' ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-full)'
          }}
        >
          + Catat Pengeluaran
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="tx-filter-bar">
        {/* Search */}
        <div className="search-input-wrap">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Cari jajan, bensin, kafe, barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Scope Filter */}
        <select
          className="btn-control"
          value={selectedScopeFilter}
          onChange={(e) => setSelectedScopeFilter(e.target.value)}
          style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--card-border)' }}
        >
          <option value="all">Semua Tipe</option>
          <option value="pribadi">Pribadi</option>
          <option value="bersama">Bareng / Split 50:50</option>
        </select>

        {/* Category Filter */}
        <select
          className="btn-control"
          value={selectedCatFilter}
          onChange={(e) => setSelectedCatFilter(e.target.value)}
          style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--card-border)' }}
        >
          <option value="all">Semua Kategori</option>
          {(activeUserView === 'cowoku' ? cowokuCategories : activeUserView === 'yasmeen' ? yasmeenCategories : allCategories).map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Transaction Items */}
      {filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            {activeUserView === 'cowoku' ? '🛵' : '🍜'}
          </div>
          <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>
            Belum ada pengeluaran tercatat
          </p>
          <p style={{ fontSize: '0.85rem' }}>
            Klik "+ Catat Pengeluaran" setiap habis jajan, makan, atau bayar sesuatu!
          </p>
        </div>
      ) : (
        <div className="tx-list">
          {filteredTransactions.map(tx => {
            const cat = getCategoryDetails(tx.category);
            const isYasmeen = tx.paidBy === 'yasmeen';
            const payerName = users[tx.paidBy]?.name || tx.paidBy;

            return (
              <div key={tx.id} className="tx-item">
                <div className="tx-left">
                  <div className="tx-category-badge" title={cat.name}>
                    {cat.icon}
                  </div>

                  <div className="tx-details">
                    <h4>
                      {tx.title}
                      {tx.scope === 'bersama' && (
                        <span className="badge-tag badge-bersama">
                          👥 Bareng (Split)
                        </span>
                      )}
                    </h4>

                    <div className="tx-meta-tags">
                      <span>{formatDateIndo(tx.date)}</span>
                      <span>•</span>
                      <span className={`badge-tag ${isYasmeen ? 'badge-yasmeen' : 'badge-cowoku'}`}>
                        {isYasmeen ? '🌸 ' : '🦊 '}Dibayar {payerName}
                      </span>
                      {tx.paymentMethod && (
                        <>
                          <span>•</span>
                          <span className="badge-tag">{tx.paymentMethod}</span>
                        </>
                      )}
                      {tx.notes && (
                        <>
                          <span>•</span>
                          <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>"{tx.notes}"</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="tx-right">
                  <div className="tx-amount-box">
                    {/* Primary currency based on who paid or input */}
                    {tx.paidBy === 'cowoku' || tx.inputCurrency === 'IDR' ? (
                      <>
                        <div className="tx-amount-cny" style={{ color: '#f43f5e' }}>
                          -{formatIdr(tx.amountIdr || tx.amountCny * exchangeRate)}
                        </div>
                        <div className="tx-amount-idr">
                          ≈ {formatCny(tx.amountCny)}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="tx-amount-cny">
                          -{formatCny(tx.amountCny)}
                        </div>
                        <div className="tx-amount-idr">
                          ≈ {formatIdr(tx.amountIdr || tx.amountCny * exchangeRate)}
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    className="tx-delete-btn"
                    onClick={() => handleDelete(tx.id, tx.title)}
                    title="Hapus transaksi ini"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
