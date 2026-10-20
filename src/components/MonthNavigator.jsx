import React from 'react';
import { usePocket } from '../context/PocketContext';
import { ChevronLeft, ChevronRight, Calendar, Download } from 'lucide-react';

export const ALL_MONTH_OPTIONS = [
  { value: '2026-11', label: 'November 2026' },
  { value: '2026-12', label: 'Desember 2026' },
  { value: '2027-01', label: 'Januari 2027' },
  { value: '2027-02', label: 'Februari 2027' },
  { value: '2027-03', label: 'Maret 2027' },
  { value: '2027-04', label: 'April 2027' },
  { value: '2027-05', label: 'Mei 2027' },
  { value: '2027-06', label: 'Juni 2027' },
  { value: '2027-07', label: 'Juli 2027' },
  { value: '2027-08', label: 'Agustus 2027' },
  { value: '2027-09', label: 'September 2027' },
  { value: '2027-10', label: 'Oktober 2027' },
  { value: '2027-11', label: 'November 2027' },
  { value: '2027-12', label: 'Desember 2027' },
];

export default function MonthNavigator({ onExportExcel = null, isYasmeen = false }) {
  const { selectedMonth, setSelectedMonth } = usePocket();

  const currentIndex = ALL_MONTH_OPTIONS.findIndex(m => m.value === selectedMonth);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedMonth(ALL_MONTH_OPTIONS[currentIndex - 1].value);
    }
  };

  const handleNext = () => {
    if (currentIndex < ALL_MONTH_OPTIONS.length - 1) {
      setSelectedMonth(ALL_MONTH_OPTIONS[currentIndex + 1].value);
    }
  };

  return (
    <div
      className="pastel-card"
      style={{
        padding: '0.8rem 1.2rem',
        marginBottom: '1.4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.8rem',
        background: 'rgba(255, 255, 255, 0.9)'
      }}
    >
      {/* Month Switcher Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={handlePrev}
          disabled={currentIndex <= 0}
          className="btn-back-home"
          style={{ padding: '0.45rem', opacity: currentIndex <= 0 ? 0.4 : 1 }}
          title="Bulan Sebelumnya"
        >
          <ChevronLeft size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }}>
          <Calendar size={15} color="var(--text-dim)" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              fontWeight: 800,
              fontSize: '0.95rem',
              color: 'var(--text-main)',
              border: 'none',
              background: 'transparent',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {ALL_MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex >= ALL_MONTH_OPTIONS.length - 1}
          className="btn-back-home"
          style={{ padding: '0.45rem', opacity: currentIndex >= ALL_MONTH_OPTIONS.length - 1 ? 0.4 : 1 }}
          title="Bulan Berikutnya"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Export Button */}
      {onExportExcel && (
        <button
          onClick={onExportExcel}
          className="btn-back-home"
          style={{
            padding: '0.45rem 0.85rem',
            background: 'var(--pastel-green-soft)',
            borderColor: '#a7f3d0',
            color: '#047857',
            fontWeight: 700
          }}
          title="Download laporan bulanan dalam format Excel XLS"
        >
          <Download size={14} />
          <span>Unduh Data XLS</span>
        </button>
      )}
    </div>
  );
}
