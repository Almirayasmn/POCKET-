import React, { useState } from 'react';
import { formatIdr } from '../utils/formatters';
import {
  TrendingUp,
  Calendar,
  Sparkles,
  Info,
  ArrowUpRight,
  ShieldCheck
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
  const [timeframe, setTimeframe] = useState('month'); // 'week' | 'month' | 'year'
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

  // SVG Chart Geometry
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 45;
  const paddingTop = 25;
  const paddingBottom = 40;

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
        padding: '1.25rem 1.25rem 1rem',
        marginTop: '1.2rem',
        boxShadow: '0 4px 16px rgba(245, 158, 11, 0.08)'
      }}
    >
      {/* Header and Filter Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.8rem',
          marginBottom: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309', fontWeight: 800, fontSize: '1rem' }}>
            <TrendingUp size={18} />
            <span>Tren Harga Emas Batangan Galeri 24</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: '0.15rem 0 0' }}>
            Grafik pergerakan harga emas pecahan 1 gram resmi Galeri 24 Pegadaian
          </p>
        </div>

        {/* Timeframe Switcher */}
        <div
          style={{
            display: 'inline-flex',
            background: '#fef9c3',
            padding: '3px',
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
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
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
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
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
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            1 Tahun
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.6rem',
          marginBottom: '1rem',
          background: '#fffbeb',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #fef08a'
        }}
      >
        <div>
          <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 700 }}>
            HARGA DISOROT ({activePoint.label.split('(')[0]})
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#92400e', fontFamily: 'var(--font-display)' }}>
            {formatIdr(activePoint.price)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 700 }}>
            PERUBAHAN ({timeframe === 'week' ? '7 Hari' : timeframe === 'month' ? '30 Hari' : '1 Tahun'})
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: isPositive ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <span>{isPositive ? `+${diffPercent}%` : `${diffPercent}%`}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>({formatIdr(Math.abs(diffAmount))})</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 700 }}>
            TERTINGGI / TERENDAH
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 700, marginTop: '0.2rem' }}>
            <span>H: {formatIdr(maxPrice)}</span> • <span style={{ color: 'var(--text-dim)' }}>L: {formatIdr(minPrice)}</span>
          </div>
        </div>
      </div>

      {/* Interactive Responsive SVG Line Chart */}
      <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block', minWidth: '320px' }}
        >
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="goldLine" x1="0" y1="0" x2="1" y2="0">
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
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={paddingTop + chartInnerHeight / 2}
            x2={svgWidth - paddingX}
            y2={paddingTop + chartInnerHeight / 2}
            stroke="#fef08a"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={svgHeight - paddingBottom}
            x2={svgWidth - paddingX}
            y2={svgHeight - paddingBottom}
            stroke="#e2e8f0"
            strokeWidth="1.5"
          />

          {/* Area Fill */}
          <path d={areaPathD} fill="url(#goldGradient)" />

          {/* Line Stroke */}
          <path
            d={linePathD}
            fill="none"
            stroke="url(#goldLine)"
            strokeWidth="3.5"
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
                <circle cx={p.x} cy={p.y} r="16" fill="transparent" />

                {/* Visible dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  fill="#ffffff"
                  stroke={isHovered ? '#b45309' : '#f59e0b'}
                  strokeWidth={isHovered ? 3.5 : 2.5}
                  style={{ transition: 'all 0.15s ease' }}
                />

                {/* X-axis date labels */}
                {(timeframe === 'week' || idx % 2 === 0 || idx === points.length - 1) && (
                  <text
                    x={p.x}
                    y={svgHeight - paddingBottom + 18}
                    textAnchor="middle"
                    fill="#92400e"
                    fontSize="11"
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
              strokeDasharray="3 3"
              strokeWidth="1.5"
              pointerEvents="none"
            />
          )}
        </svg>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span>💡 Geser / tap titik pada grafik untuk melihat harga di tanggal tersebut.</span>
        <span style={{ color: '#b45309', fontWeight: 700 }}>
          Harga Buyback Pegadaian: {formatIdr(buybackPrice)} / gr
        </span>
      </div>
    </div>
  );
}
