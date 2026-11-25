import React, { useState, useMemo } from 'react';
import { TrendingUp, ExternalLink, Calendar, RefreshCw } from 'lucide-react';

export default function PegadaianGoldChart({
  history = [],
  currentSellPricePerGram = 2467000,
  currentBuybackPricePerGram = 2322000,
  lastUpdatedLabel,
  onRefresh,
  isRefreshing = false
}) {
  const [chartType, setChartType] = useState('beli');
  const [timeframe, setTimeframe] = useState('1m');
  const [hoverIndex, setHoverIndex] = useState(null);

  const baselineHistory = useMemo(() => {
    const today = new Date();
    const result = [];
    const basePrices = [
      2510000,
      2504000,
      2499000,
      2478000,
      2467000,
      2467000,
      currentSellPricePerGram || 2467000
    ];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const s = basePrices[6 - i] || currentSellPricePerGram || 2467000;
      const b = Math.round(s * 0.941);
      result.push({ date: dStr, sellPerGram: s, buybackPerGram: b });
    }
    return result;
  }, [currentSellPricePerGram]);

  const rawData = useMemo(() => {
    const base = history && history.length > 0 ? [...history] : [...baselineHistory];
    const normalized = base.map((p) => {
      let sGram = p.sellPerGram || p.sellPrice;
      let bGram = p.buybackPricePerGram || p.buybackPerGram || p.buybackPrice;
      if (!sGram && p.sellPer001g) sGram = p.sellPer001g * 100;
      if (!bGram && p.buybackPer001g) bGram = p.buybackPer001g * 100;
      return {
        date: p.date,
        sellPerGram: Number(sGram) || currentSellPricePerGram,
        buybackPerGram: Number(bGram) || currentBuybackPricePerGram
      };
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const hasToday = normalized.some((p) => p.date === todayStr);
    if (!hasToday && currentSellPricePerGram) {
      normalized.push({
        date: todayStr,
        sellPerGram: currentSellPricePerGram,
        buybackPerGram: currentBuybackPricePerGram || Math.round(currentSellPricePerGram * 0.941)
      });
    }
    return normalized;
  }, [history, baselineHistory, currentSellPricePerGram, currentBuybackPricePerGram]);

  const chartPoints = useMemo(() => {
    const sorted = [...rawData].sort((a, b) => new Date(a.date) - new Date(b.date));
    if (timeframe === '1w') return sorted.slice(-7);
    if (timeframe === '1m') return sorted.slice(-30);
    return sorted;
  }, [rawData, timeframe]);

  const values = chartPoints.map((p) => (chartType === 'beli' ? p.sellPerGram : p.buybackPerGram));
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const valRange = maxVal - minVal || 1;
  const paddingVal = valRange * 0.18;

  const chartMin = minVal - paddingVal;
  const chartMax = maxVal + paddingVal;
  const chartRange = chartMax - chartMin;

  const svgWidth = 560;
  const svgHeight = 140;
  const padX = 16;
  const padY = 16;
  const plotWidth = svgWidth - padX * 2;
  const plotHeight = svgHeight - padY * 2;

  const coords = chartPoints.map((pt, idx) => {
    const val = chartType === 'beli' ? pt.sellPerGram : pt.buybackPerGram;
    const x = padX + (idx / Math.max(1, chartPoints.length - 1)) * plotWidth;
    const y = padY + plotHeight - ((val - chartMin) / chartRange) * plotHeight;
    return { x, y, pt, val };
  });

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
    <div style={{ width: '100%' }}>
      {/* Header Row */}
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
            <TrendingUp size={15} color="#059669" />
            <h3 className="hq-section-title">Grafik Tren Emas Galeri 24</h3>
          </div>
          <p className="hq-section-subtitle">Data acuan langsung galeri24.co.id</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="hq-btn"
              style={{ padding: '0.32rem 0.65rem', fontSize: '0.74rem' }}
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Sync...' : 'Update'}</span>
            </button>
          )}
          <a
            href="https://galeri24.co.id/harga-emas"
            target="_blank"
            rel="noopener noreferrer"
            className="hq-btn"
            style={{ padding: '0.32rem 0.65rem', fontSize: '0.74rem' }}
          >
            <span>Web Resmi</span>
            <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Mode Tabs & Active Point Price Inline */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          paddingBottom: '0.85rem',
          marginBottom: '0.85rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div className="hq-segmented">
          <button
            type="button"
            onClick={() => setChartType('beli')}
            className={`hq-segmented-btn ${chartType === 'beli' ? 'active' : ''}`}
          >
            Harga Jual
          </button>
          <button
            type="button"
            onClick={() => setChartType('jual')}
            className={`hq-segmented-btn ${chartType === 'jual' ? 'active' : ''}`}
          >
            Buyback
          </button>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }} className="tabular-nums">
            Rp {Number(activeCoord?.val || currentSellPricePerGram || 2467000).toLocaleString('id-ID')} / gr
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <Calendar size={11} />
            <span>{formatShortDate(activeCoord?.pt?.date) || lastUpdatedLabel}</span>
          </div>
        </div>
      </div>

      {/* Full-Width Responsive SVG Chart */}
      <div style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible', maxHeight: '150px' }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="hqGoldChartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          <line x1={padX} y1={padY} x2={svgWidth - padX} y2={padY} stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" />
          <line x1={padX} y1={padY + plotHeight * 0.5} x2={svgWidth - padX} y2={padY + plotHeight * 0.5} stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" />
          <line x1={padX} y1={padY + plotHeight} x2={svgWidth - padX} y2={padY + plotHeight} stroke="#e2e8f0" strokeWidth="1" />

          {areaPath && <path d={areaPath} fill="url(#hqGoldChartGrad)" />}

          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#059669"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {activeCoord && (
            <line
              x1={activeCoord.x}
              y1={padY}
              x2={activeCoord.x}
              y2={padY + plotHeight}
              stroke="#059669"
              strokeDasharray="2 2"
              strokeWidth="1"
              opacity="0.6"
            />
          )}

          {activeCoord && (
            <g>
              <circle cx={activeCoord.x} cy={activeCoord.y} r="5" fill="#ffffff" stroke="#059669" strokeWidth="2.4" />
              <circle cx={activeCoord.x} cy={activeCoord.y} r="1.8" fill="#059669" />
            </g>
          )}

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

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.35rem 0.25rem 0',
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'var(--text-dim)'
          }}
        >
          {coords.length > 0 && (
            <>
              <span>{formatAxisDate(coords[0].pt?.date)}</span>
              {coords.length >= 4 && <span>{formatAxisDate(coords[Math.floor(coords.length * 0.33)].pt?.date)}</span>}
              {coords.length >= 4 && <span>{formatAxisDate(coords[Math.floor(coords.length * 0.66)].pt?.date)}</span>}
              <span style={{ color: '#059669', fontWeight: 700 }}>
                {formatAxisDate(coords[coords.length - 1].pt?.date)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Timeframe Row */}
      <div
        style={{
          display: 'flex',
          gap: '0.35rem',
          marginTop: '0.9rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-subtle)'
        }}
      >
        {[
          { id: '1w', label: '1 Minggu' },
          { id: '1m', label: '1 Bulan' },
          { id: '3m', label: '3 Bulan' },
          { id: '1y', label: '1 Tahun' }
        ].map((tf) => {
          const isActive = timeframe === tf.id;
          return (
            <button
              key={tf.id}
              type="button"
              onClick={() => {
                setTimeframe(tf.id);
                setHoverIndex(null);
              }}
              className={`hq-btn ${isActive ? 'hq-btn-green-soft' : ''}`}
              style={{ flex: 1, padding: '0.32rem 0.4rem', fontSize: '0.74rem' }}
            >
              {tf.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
