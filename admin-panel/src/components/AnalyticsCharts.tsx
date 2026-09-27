import { useState } from 'react';

interface ChartDataPoint {
  label: string;
  value: number;
}

export function DonationActivityChart() {
  const [activeFilter, setActiveFilter] = useState<'Today' | '7 Days' | '30 Days' | 'This Year'>('7 Days');

  // Interactive mock datasets representing platform rescue volumes
  const datasets: Record<'Today' | '7 Days' | '30 Days' | 'This Year', ChartDataPoint[]> = {
    'Today': [
      { label: '08:00', value: 12 },
      { label: '10:00', value: 18 },
      { label: '12:00', value: 29 },
      { label: '14:00', value: 15 },
      { label: '16:00', value: 22 },
      { label: '18:00', value: 35 },
      { label: '20:00', value: 19 },
    ],
    '7 Days': [
      { label: 'Mon', value: 42 },
      { label: 'Tue', value: 58 },
      { label: 'Wed', value: 49 },
      { label: 'Thu', value: 72 },
      { label: 'Fri', value: 65 },
      { label: 'Sat', value: 88 },
      { label: 'Sun', value: 76 },
    ],
    '30 Days': [
      { label: 'Week 1', value: 180 },
      { label: 'Week 2', value: 240 },
      { label: 'Week 3', value: 310 },
      { label: 'Week 4', value: 285 },
    ],
    'This Year': [
      { label: 'Q1', value: 920 },
      { label: 'Q2', value: 1450 },
      { label: 'Q3', value: 1890 },
      { label: 'Q4', value: 2240 },
    ],
  };

  const points = datasets[activeFilter];
  const maxVal = Math.max(...points.map((p) => p.value), 10);
  
  // Custom interactive SVG line & background path builder
  const chartHeight = 120;
  const chartWidth = 326;
  const paddingX = 20;
  const stepX = (chartWidth - paddingX * 2) / (points.length - 1 || 1);

  // Map data to SVG coordinates
  const coords = points.map((p, idx) => {
    const x = paddingX + idx * stepX;
    // Keep space at the top (10px) and bottom (15px)
    const y = chartHeight - 15 - ((p.value / maxVal) * (chartHeight - 30));
    return { x, y, ...p };
  });

  // SVG Line path string
  const linePath = coords.reduce((acc, c, idx) => {
    return acc + (idx === 0 ? `M ${c.x} ${c.y}` : ` L ${c.x} ${c.y}`);
  }, '');

  // SVG Closed area path string for gradient fill
  const areaPath = coords.length > 0
    ? `${linePath} L ${coords[coords.length - 1].x} ${chartHeight - 15} L ${coords[0].x} ${chartHeight - 15} Z`
    : '';

  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#F0F2F1] shadow-xs">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-[#17201A]">Donation Activity</h3>
        <div className="flex bg-[#F1F3F2] rounded-lg p-0.5 text-[10px] font-medium text-[#6B7280]">
          {(['Today', '7 Days', '30 Days', 'This Year'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setHoveredPoint(null);
              }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeFilter === filter
                  ? 'bg-white text-[#16A34A] shadow-xs font-semibold'
                  : 'hover:text-[#17201A]'
              }`}
            >
              {filter === 'This Year' ? 'Year' : filter}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        {/* Dynamic Tooltip */}
        {hoveredPoint !== null && coords[hoveredPoint] && (
          <div
            className="absolute bg-[#17201A] text-white text-[10px] px-2 py-1 rounded shadow-md pointer-events-none transition-all duration-150 z-10"
            style={{
              left: `${Math.min(chartWidth - 80, Math.max(10, coords[hoveredPoint].x - 30))}px`,
              top: `${coords[hoveredPoint].y - 32}px`,
            }}
          >
            <span className="font-semibold">{coords[hoveredPoint].value} meals</span>
          </div>
        )}

        {/* Custom SVG Line Chart */}
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-[120px] overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16A34A" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#16A34A" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="15" x2={chartWidth} y2="15" stroke="#F0F2F1" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="52" x2={chartWidth} y2="52" stroke="#F0F2F1" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="90" x2={chartWidth} y2="90" stroke="#F0F2F1" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1={chartHeight - 15} x2={chartWidth} y2={chartHeight - 15} stroke="#E5E7E6" strokeWidth="1" />

          {/* Area under the line */}
          {areaPath && <path d={areaPath} fill="url(#chartGradient)" className="transition-all duration-300" />}

          {/* Main Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#16A34A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          )}

          {/* Interactive Target Nodes */}
          {coords.map((c, idx) => (
            <g key={idx} className="cursor-pointer">
              <circle
                cx={c.x}
                cy={c.y}
                r={hoveredPoint === idx ? '6' : '3.5'}
                fill={hoveredPoint === idx ? '#16A34A' : '#FFFFFF'}
                stroke="#16A34A"
                strokeWidth={hoveredPoint === idx ? '3' : '2'}
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
                onTouchStart={() => setHoveredPoint(idx)}
                className="transition-all duration-150"
              />
              {/* Invisible touch extender */}
              <circle
                cx={c.x}
                cy={c.y}
                r="15"
                fill="transparent"
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
                onTouchStart={() => setHoveredPoint(idx)}
              />
            </g>
          ))}
        </svg>

        {/* X Axis Labels */}
        <div className="flex justify-between px-2 mt-1 text-[10px] font-medium text-[#6B7280]">
          {points.map((p, idx) => (
            <span key={idx} className="w-8 text-center truncate">
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FoodTypeDistributionChart() {
  // Hardcoded percentages specified: Vegetarian 68%, Non-Vegetarian 24%, Vegan 8%
  const categories = [
    { label: 'Vegetarian', value: 68, color: '#16A34A', bgLight: '#DCFCE7' },
    { label: 'Non-Vegetarian', value: 24, color: '#F59E0B', bgLight: '#FEF3C7' },
    { label: 'Vegan', value: 8, color: '#2563EB', bgLight: '#DBEAFE' },
  ];

  // For a perfect mini donut chart: radius = 30, stroke-width = 10, center = 50,50
  // Circumference = 2 * PI * r = ~188.5
  const radius = 30;
  const strokeWidth = 10;
  const center = 50;
  const circ = 2 * Math.PI * radius; // 188.49

  let accumulatedPercent = 0;

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#F0F2F1] shadow-xs">
      <h3 className="text-sm font-semibold text-[#17201A] mb-3">Food Type Distribution</h3>
      
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Left side: Animated Circular SVG Donut */}
        <div className="col-span-5 flex justify-center relative">
          <svg viewBox="0 0 100 100" className="w-[85px] h-[85px] transform -rotate-90">
            {categories.map((cat, idx) => {
              const dashArray = `${(cat.value / 100) * circ} ${circ}`;
              const dashOffset = -(accumulatedPercent / 100) * circ;
              accumulatedPercent += cat.value;

              return (
                <circle
                  key={idx}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  strokeLinecap={cat.value > 5 ? 'round' : 'butt'}
                  className="transition-all duration-500 ease-out"
                />
              );
            })}
            {/* Inner cutout circle to finalize donut structure */}
            <circle cx={center} cy={center} r={radius - strokeWidth / 2 - 1} fill="#FFFFFF" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[14px] font-bold text-[#17201A]">100%</span>
            <span className="text-[8px] text-[#6B7280] font-medium uppercase tracking-wider">Saved</span>
          </div>
        </div>

        {/* Right side: Detailed Legends & Proportions */}
        <div className="col-span-7 space-y-2">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-[11px] font-medium text-[#17201A] truncate">{cat.label}</span>
              </div>
              <span className="text-[11px] font-semibold text-[#17201A] bg-gray-50 px-1.5 py-0.5 rounded">
                {cat.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AreaAnalyticsChart() {
  const areas = [
    { name: 'Chidambaram', value: 2450, percentage: 80, color: '#16A34A' },
    { name: 'Chennai', value: 1840, percentage: 60, color: '#2563EB' },
    { name: 'Cuddalore', value: 920, percentage: 30, color: '#F59E0B' },
    { name: 'Puducherry', value: 610, percentage: 20, color: '#EF4444' },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#F0F2F1] shadow-xs">
      <h3 className="text-sm font-semibold text-[#17201A] mb-3">Donations by Area</h3>
      <div className="space-y-3">
        {areas.map((area, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between items-center text-[11px] font-medium">
              <span className="text-[#17201A]">{area.name}</span>
              <span className="text-[#6B7280] font-semibold">{area.value.toLocaleString()} meals</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${area.percentage}%`,
                  backgroundColor: area.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
