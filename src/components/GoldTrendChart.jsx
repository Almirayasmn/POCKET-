import React, { useState } from 'react';
import { formatIdr } from '../utils/formatters';
import {
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';

// Historical Galeri 24 Gold Price Datasets (Pegadaian)
const WEEK_DATA = [
  { date: '14 Okt', price: 2490000, label: '14 Okt 2026' },
  { date: '15 Okt', price: 2495000, label: '15 Okt 2026' },
  { date: '16 Okt', price: 2502000, label: '16 Okt 2026' },
  { date: '17 Okt', price: 2500000, label: '17 Okt 2026' },
  { date: '18 Okt', price: 2505000, label: '18 Okt 2026' },
  { date: '19 Okt', price: 2508000, label: '19 Okt 2026' },
  { date: '20 Okt', price: 2510000, label: '20 Okt 2026 (Hari Ini)' }
];

const MONTH_DATA = [
  { date: '21 Sep', price: 2420000, label: '21 Sep 2026' },
  { date: '25 Sep', price: 2435000, label: '25 Sep 2026' },
  { date: '28 Sep', price: 2445000, label: '28 Sep 2026' },
  { date: '02 Okt', price: 2460000, label: '02 Okt 2026' },
  { date: '06 Okt', price: 2455000, label: '06 Okt 2026' },
  { date: '09 Okt', price: 2478000, label: '09 Okt 2026' },
  { date: '13 Okt', price: 2485000, label: '13 Okt 2026' },
  { date: '16 Okt', price: 2502000, label: '16 Okt 2026' },
  { date: '20 Okt', price: 2510000, label: '20 Okt 2026 (Hari Ini)' }
];

const YEAR_DATA = [
  { date: 'Nov 25', price: 1980000, label: 'November 2025' },
  { date: 'Des 25', price: 2040000, label: 'Desember 2025' },
  { date: 'Jan 26', price: 2110000, label: 'Januari 2026' },
  { date: 'Feb 26', price: 2170000, label: 'Februari 2026' },
  { date: 'Mar 26', price: 2220000, label: 'Maret 2026' },
  { date: 'Apr 26', price: 2290000, label: 'April 2026' },
  { date: 'Mei 26', price: 2310000, label: 'Mei 2026' },
  { date: 'Jun 26', price: 2350000, label: 'Juni 2026' },
  { date: 'Jul 26', price: 2390000, label: 'Juli 2026' },
  { date: 'Agu 26', price: 2440000, label: 'Agustus 2026' },
  { date: 'Sep 26', price: 2470000, label: 'September 2026' },
  { date: 'Okt 26', price: 2510000, label: 'Oktober 2026' }
];

export default function GoldTrendChart({ currentPrice = 2510000, buybackPrice = 2363000 }) {
  const [timeframe, setTimeframe] = useState('year'); // default 1 Tahun
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const data = timeframe === 'week' ? WEEK_DATA : timeframe === 'month' ? MONTH_DATA : YEAR_DATA;

  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];

  const diffAmount = lastPrice - firstPrice;
  const diffPercent = Math.round(((diffAmount / firstPrice) * 100) * 10) / 10;
  const isPositive = diffAmount >= 0;

  // Sleek, Compact SVG Chart Geometry
  const svgWidth = 560;
  const svgHeight = 110;
  const paddingX = 35;
  const paddingTop = 14;
  const paddingBottom = 24;

  const chartInnerWidth = svgWidth - paddingX * 2;
  const chartInnerHeight = svgHeight - paddingTop - paddingBottom;
  const priceRange = maxPrice - minPrice || 1;

  // Convert data points to SVG coordinates
  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * chartInnerWidth;
    const y = paddingTop + chartInnerHeight - ((d.price - minPrice) / priceRange) * chartInnerHeight;
    return { ...d, x, y };
  });

  // Construct SVG Path
  const linePathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaPathD = `${linePathD} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`;

  const activePoint = hoveredPoint || points[points.length - 1];

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid #fde047',
        padding: '0.85rem 1rem 0.65rem',
        marginTop: '1rem',
        boxShadow: '0 2px 10px rgba(245, 158, 11, 0.06)'
      }}
    >
      {/* Header, Inline Stats, & Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#b45309', fontWeight: 800, fontSize: '0.88rem' }}>
            <TrendingUp size={15} />
            <span>Tren Harga Galeri 24</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#92400e', fontFamily: 'var(--font-display)' }}>
              {formatIdr(activePoint.price)}
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isPositive ? '#16a34a' : '#dc2626' }}>
              {isPositive ? `+${diffPercent}%` : `${diffPercent}%`}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              ({activePoint.label.split('(')[0].trim()})
            </span>
          </div>
        </div>

        {/* Compact Timeframe Switcher */}
        <div
          style={{
            display: 'inline-flex',
            background: '#fef9c3',
            padding: '2px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid #fde047'
          }}
        >
          <button
            type="button"
            onClick={() => { setTimeframe('week'); setHoveredPoint(null); }}
            style={{
              border: 'none',
              background: timeframe === 'week' ? '#f59e0b' : 'transparent',
              color: timeframe === 'week' ? '#ffffff' : '#92400e',
              padding: '0.22rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            1 Minggu
          </button>

          <button
            type="button"
            onClick={() => { setTimeframe('month'); setHoveredPoint(null); }}
            style={{
              border: 'none',
              background: timeframe === 'month' ? '#f59e0b' : 'transparent',
              color: timeframe === 'month' ? '#ffffff' : '#92400e',
              padding: '0.22rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            1 Bulan
          </button>

          <button
            type="button"
            onClick={() => { setTimeframe('year'); setHoveredPoint(null); }}
            style={{
              border: 'none',
              background: timeframe === 'year' ? '#f59e0b' : 'transparent',
              color: timeframe === 'year' ? '#ffffff' : '#92400e',
              padding: '0.22rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            1 Tahun
          </button>
        </div>
      </div>

      {/* Compact Responsive SVG Line Chart */}
      <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '125px' }}
        >
          <defs>
            <linearGradient id="goldGradientCompact" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="goldLineCompact" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={svgWidth - paddingX}
            y2={paddingTop}
            stroke="#fef08a"
            strokeDasharray="3 3"
            strokeWidth="0.8"
          />
          <line
            x1={paddingX}
            y1={svgHeight - paddingBottom}
            x2={svgWidth - paddingX}
            y2={svgHeight - paddingBottom}
            stroke="#f1f5f9"
            strokeWidth="1.2"
          />

          {/* Area Fill */}
          <path d={areaPathD} fill="url(#goldGradientCompact)" />

          {/* Line Stroke */}
          <path
            d={linePathD}
            fill="none"
            stroke="url(#goldLineCompact)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Dots */}
          {points.map((p, idx) => {
            const isHovered = activePoint.date === p.date;
            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredPoint(p)}
                onTouchStart={() => setHoveredPoint(p)}
                style={{ cursor: 'pointer' }}
              >
                {/* Hit target */}
                <circle cx={p.x} cy={p.y} r="12" fill="transparent" />

                {/* Visible dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 4.5 : 2.5}
                  fill="#ffffff"
                  stroke={isHovered ? '#b45309' : '#f59e0b'}
                  strokeWidth={isHovered ? 2.5 : 1.8}
                  style={{ transition: 'all 0.15s ease' }}
                />

                {/* X-axis date labels */}
                {(timeframe === 'week' || idx % 2 === 0 || idx === points.length - 1) && (
                  <text
                    x={p.x}
                    y={svgHeight - paddingBottom + 14}
                    textAnchor="middle"
                    fill="#92400e"
                    fontSize="9.5"
                    fontWeight={isHovered ? 800 : 600}
                  >
                    {p.date}
                  </text>
                )}
              </g>
            );
          })}

          {/* Active Highlight vertical guide line */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={paddingTop}
              x2={activePoint.x}
              y2={svgHeight - paddingBottom}
              stroke="#f59e0b"
              strokeDasharray="2 2"
              strokeWidth="1"
              pointerEvents="none"
            />
          )}
        </svg>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem', flexWrap: 'wrap', gap: '0.4rem' }}>
        <span>Geser/tap titik untuk lihat harga harian.</span>
        <span style={{ color: '#b45309', fontWeight: 600 }}>
          Buyback: {formatIdr(buybackPrice)}/gr
        </span>
      </div>
    </div>
  );
}
