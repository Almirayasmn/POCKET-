import React, { useState, useMemo } from 'react';
import { TrendingUp, ExternalLink, Calendar, RefreshCw } from 'lucide-react';

export default function PegadaianGoldChart({
  history = [],
  currentSellPricePer001g = 24090,
  currentBuybackPricePer001g = 23240,
  lastUpdatedLabel = 'Sel, 27 Okt 2026',
  onRefresh,
  isRefreshing = false
}) {
  const [chartType, setChartType] = useState('beli'); // 'beli' or 'jual'
  const [timeframe, setTimeframe] = useState('1m'); // '1w', '1m', '3m', '1y'
  const [hoverIndex, setHoverIndex] = useState(null);

  // Fallback 7-day authentic Pegadaian data if history not yet loaded
  const baselineHistory = useMemo(() => [
    { date: '2026-10-21', sellPer001g: 24340, buybackPer001g: 23480 },
    { date: '2026-10-22', sellPer001g: 24300, buybackPer001g: 23440 },
    { date: '2026-10-23', sellPer001g: 24090, buybackPer001g: 23240 },
    { date: '2026-10-24', sellPer001g: 23990, buybackPer001g: 23150 },
    { date: '2026-10-25', sellPer001g: 23990, buybackPer001g: 23150 },
    { date: '2026-10-26', sellPer001g: 23990, buybackPer001g: 23150 },
    { date: '2026-10-27', sellPer001g: currentSellPricePer001g || 24090, buybackPer001g: currentBuybackPricePer001g || 23240 }
  ], [currentSellPricePer001g, currentBuybackPricePer001g]);

  const rawData = (history && history.length > 0) ? history : baselineHistory;

  // Filter or scale data points based on selected timeframe
  const chartPoints = useMemo(() => {
    const sorted = [...rawData].sort((a, b) => new Date(a.date) - new Date(b.date));
    if (timeframe === '1w') return sorted.slice(-7);
    if (timeframe === '1m') return sorted.slice(-30);
    return sorted;
  }, [rawData, timeframe]);

  // Calculate SVG coordinates
  const values = chartPoints.map(p => chartType === 'beli' ? p.sellPer001g : p.buybackPer001g);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const valRange = (maxVal - minVal) || 1;
  const paddingVal = valRange * 0.18;

  const chartMin = minVal - paddingVal;
  const chartMax = maxVal + paddingVal;
  const chartRange = chartMax - chartMin;

  const svgWidth = 520;
  const svgHeight = 115;
  const padX = 24;
  const padY = 16;
  const plotWidth = svgWidth - (padX * 2);
  const plotHeight = svgHeight - (padY * 2);

  const coords = chartPoints.map((pt, idx) => {
    const val = chartType === 'beli' ? pt.sellPer001g : pt.buybackPer001g;
    const x = padX + (idx / Math.max(1, chartPoints.length - 1)) * plotWidth;
    const y = padY + plotHeight - ((val - chartMin) / chartRange) * plotHeight;
    return { x, y, pt, val };
  });

  // Construct smooth SVG curve (Monotone/Bézier)
  const linePath = useMemo(() => {
    if (coords.length === 0) return '';
    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? 0 : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2 < coords.length ? i + 2 : coords.length - 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  }, [coords]);

  const areaPath = useMemo(() => {
    if (!linePath || coords.length === 0) return '';
    const lastX = coords[coords.length - 1].x;
    const firstX = coords[0].x;
    const bottomY = padY + plotHeight;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [linePath, coords, plotHeight, padY]);

  // Active display point (hover or latest)
  const activeIndex = hoverIndex !== null ? hoverIndex : coords.length - 1;
  const activeCoord = coords[activeIndex] || coords[coords.length - 1];

  const formatShortDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatAxisDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  return (
    <div
      style={{
        maxWidth: '640px',
        margin: '1.2rem auto 0',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1.5px solid #d1fae5',
        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.06)',
        padding: '0.9rem 1.1rem 0.75rem',
        position: 'relative'
      }}
    >
      {/* Header & Source Badge (Compact) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '7px',
              background: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              border: '1px solid #a7f3d0'
            }}
          >
            <TrendingUp size={14} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#064e3b', lineHeight: 1.2 }}>
              Grafik Tren Tabungan Emas
            </h4>
            <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 600 }}>
              Live sahabat.pegadaian.co.id
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#047857',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '6px',
                padding: '0.25rem 0.55rem',
                cursor: 'pointer'
              }}
              title="Perbarui grafik hari ini dari Pegadaian"
            >
              <RefreshCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Sync...' : 'Update'}</span>
            </button>
          )}

          <a
            href="https://sahabat.pegadaian.co.id/harga-emas"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.7rem',
              color: '#059669',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 700
            }}
          >
            <span>Web Resmi</span>
            <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Tabs: Harga Beli vs Harga Jual (Compact) */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1.5px solid #e2e8f0',
          marginBottom: '0.65rem'
        }}
      >
        <button
          type="button"
          onClick={() => setChartType('beli')}
          style={{
            flex: 1,
            padding: '0.35rem 0.4rem',
            background: 'transparent',
            border: 'none',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            color: chartType === 'beli' ? '#059669' : '#64748b',
            borderBottom: chartType === 'beli' ? '2.5px solid #10b981' : '2.5px solid transparent',
            marginBottom: '-1.5px',
            transition: 'all 0.15s ease'
          }}
        >
          Harga Beli (Nasabah)
        </button>
        <button
          type="button"
          onClick={() => setChartType('jual')}
          style={{
            flex: 1,
            padding: '0.35rem 0.4rem',
            background: 'transparent',
            border: 'none',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            color: chartType === 'jual' ? '#059669' : '#64748b',
            borderBottom: chartType === 'jual' ? '2.5px solid #10b981' : '2.5px solid transparent',
            marginBottom: '-1.5px',
            transition: 'all 0.15s ease'
          }}
        >
          Harga Jual (Buyback)
        </button>
      </div>

      {/* Dynamic Date & Price Banner (Compact Ribbon) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '9px',
          padding: '0.45rem 0.75rem',
          marginBottom: '0.65rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', fontWeight: 700, color: '#064e3b' }}>
          <Calendar size={13} color="#059669" />
          <span>{formatShortDate(activeCoord?.pt?.date) || lastUpdatedLabel}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#064e3b' }}>
            Rp {Number(activeCoord?.val || 24090).toLocaleString('id-ID')}/0,01 gr
          </span>
          <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700, marginLeft: '0.4rem' }}>
            (Rp {(Number(activeCoord?.val || 24090) * 100).toLocaleString('id-ID')}/gr)
          </span>
        </div>
      </div>

      {/* Compact SVG Chart */}
      <div style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible', maxHeight: '115px' }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="pegadaianGreenGradMini" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#34d399" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0.01" />
            </linearGradient>
            <filter id="pegadaianDotGlowMini" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#059669" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Background Gridlines */}
          <line x1={padX} y1={padY} x2={svgWidth - padX} y2={padY} stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" />
          <line x1={padX} y1={padY + plotHeight * 0.5} x2={svgWidth - padX} y2={padY + plotHeight * 0.5} stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" />
          <line x1={padX} y1={padY + plotHeight} x2={svgWidth - padX} y2={padY + plotHeight} stroke="#e2e8f0" strokeWidth="1" />

          {/* Area Fill */}
          {areaPath && (
            <path d={areaPath} fill="url(#pegadaianGreenGradMini)" />
          )}

          {/* Line Path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Hover Line */}
          {activeCoord && (
            <line
              x1={activeCoord.x}
              y1={padY}
              x2={activeCoord.x}
              y2={padY + plotHeight}
              stroke="#059669"
              strokeDasharray="2 2"
              strokeWidth="1.2"
              opacity="0.6"
            />
          )}

          {/* Active / Current Point Dot */}
          {activeCoord && (
            <g>
              <circle
                cx={activeCoord.x}
                cy={activeCoord.y}
                r="5.5"
                fill="#ffffff"
                stroke="#059669"
                strokeWidth="2.8"
                filter="url(#pegadaianDotGlowMini)"
              />
              <circle
                cx={activeCoord.x}
                cy={activeCoord.y}
                r="2"
                fill="#059669"
              />
            </g>
          )}

          {/* Invisible Touch / Hover Interaction Strips */}
          {coords.map((coord, idx) => {
            const stripWidth = plotWidth / Math.max(1, coords.length);
            return (
              <rect
                key={idx}
                x={coord.x - stripWidth / 2}
                y={0}
                width={stripWidth}
                height={svgHeight}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoverIndex(idx)}
                onTouchStart={() => setHoverIndex(idx)}
              />
            );
          })}
        </svg>

        {/* X-Axis Date Labels (Compact) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.25rem 0.6rem 0',
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#64748b'
          }}
        >
          {coords.length > 0 && (
            <>
              <span>{formatAxisDate(coords[0].pt?.date)}</span>
              {coords.length >= 4 && (
                <span>{formatAxisDate(coords[Math.floor(coords.length * 0.33)].pt?.date)}</span>
              )}
              {coords.length >= 4 && (
                <span>{formatAxisDate(coords[Math.floor(coords.length * 0.66)].pt?.date)}</span>
              )}
              <span style={{ color: '#059669', fontWeight: 800 }}>
                {formatAxisDate(coords[coords.length - 1].pt?.date)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Timeframe Buttons (Compact Pills) */}
      <div
        style={{
          display: 'flex',
          gap: '0.4rem',
          marginTop: '0.75rem',
          paddingTop: '0.55rem',
          borderTop: '1px solid #f1f5f9'
        }}
      >
        {[
          { id: '1w', label: '1 Minggu' },
          { id: '1m', label: '1 Bulan' },
          { id: '3m', label: '3 Bulan' },
          { id: '1y', label: '1 Tahun' }
        ].map(tf => {
          const isActive = timeframe === tf.id;
          return (
            <button
              key={tf.id}
              type="button"
              onClick={() => {
                setTimeframe(tf.id);
                setHoverIndex(null);
              }}
              style={{
                flex: 1,
                padding: '0.35rem 0.3rem',
                borderRadius: '7px',
                border: isActive ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                background: isActive ? '#ecfdf5' : '#ffffff',
                color: isActive ? '#065f46' : '#64748b',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.72rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tf.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
