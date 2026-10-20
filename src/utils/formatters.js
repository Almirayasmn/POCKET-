// Currency and Date Formatters

export function formatCny(val) {
  const num = typeof val === 'number' ? val : parseFloat(val) || 0;
  return '¥' + num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatIdr(val) {
  const num = typeof val === 'number' ? val : parseFloat(val) || 0;
  return 'Rp ' + Math.round(num).toLocaleString('id-ID');
}

export function formatDualCurrency(amountCny, rate, mode = 'dual') {
  const cny = typeof amountCny === 'number' ? amountCny : parseFloat(amountCny) || 0;
  const idr = cny * (rate || 2750);

  if (mode === 'cny') return formatCny(cny);
  if (mode === 'idr') return formatIdr(idr);

  return {
    primary: formatCny(cny),
    secondary: formatIdr(idr),
    cnyVal: cny,
    idrVal: idr
  };
}

export function formatDateIndo(dateStr) {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parseInt(parts[1]) - 1, parts[2]);
      return d.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  } catch (e) {
    console.error(e);
  }
  return dateStr;
}

export const MONTH_OPTIONS = [
  { value: '2026-10', label: 'Oktober 2026' },
  { value: '2026-11', label: 'November 2026 (Nanning)' },
  { value: '2026-12', label: 'Desember 2026' },
  { value: '2027-01', label: 'Januari 2027' },
  { value: '2027-02', label: 'Februari 2027' },
  { value: '2027-03', label: 'Maret 2027' },
];
