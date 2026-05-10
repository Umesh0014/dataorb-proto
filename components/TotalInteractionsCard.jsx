"use client";

import StatCard from "./StatCard";

const SPARKLINE_DATA = [
  { month: "Jun", value: 320 },
  { month: "Jul", value: 290 },
  { month: "Aug", value: 310 },
  { month: "Sep", value: 280 },
  { month: "Oct", value: 300 },
  { month: "Nov", value: 310 },
  { month: "Dec", value: 330 },
  { month: "Jan", value: 420 },
  { month: "Feb", value: 680 },
  { month: "Mar", value: 920 },
  { month: "Apr", value: 840 },
  { month: "May", value: 1050 },
];

function Sparkline({ data, width = 420, height = 64 }) {
  const padX = 4, padY = 6;
  const w = width - padX * 2, h = height - padY * 2;
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;

  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * w,
    y: padY + h - ((d.value - min) / range) * h,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#245BFF" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#245BFF" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkFill)" />
      <path d={linePath} fill="none" stroke="#245BFF" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#FFFFFF" stroke="#245BFF" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

export default function TotalInteractionsCard() {
  return (
    <StatCard
      size="lg"
      label={
        <>
          Total Interactions{" "}
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 16,
              color: "rgba(0,0,0,0.38)",
              fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
              cursor: "pointer",
              verticalAlign: "middle",
              marginLeft: 4,
            }}
          >
            info
          </span>
        </>
      }
      value="7135"
      trailing={<Sparkline data={SPARKLINE_DATA} width={420} height={64} />}
    />
  );
}
