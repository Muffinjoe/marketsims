"use client";

import { useState, useEffect, useRef } from "react";

interface PricePoint {
  t: number;
  p: number;
}

const INTERVALS = [
  { label: "1H", value: "1h", fidelity: "60" },
  { label: "6H", value: "6h", fidelity: "60" },
  { label: "1D", value: "1d", fidelity: "100" },
  { label: "1W", value: "1w", fidelity: "100" },
  { label: "1M", value: "1m", fidelity: "100" },
  { label: "All", value: "all", fidelity: "200" },
];

export default function PriceChart({ tokenId }: { tokenId: string }) {
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [interval, setInterval] = useState("1w");
  const [loading, setLoading] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!tokenId) return;
    setLoading(true);
    const fidelity =
      INTERVALS.find((i) => i.value === interval)?.fidelity || "100";
    fetch(
      `/api/price-history?tokenId=${tokenId}&interval=${interval}&fidelity=${fidelity}`
    )
      .then((r) => r.json())
      .then((data) => {
        setHistory(data.history || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tokenId, interval]);

  if (!tokenId) return null;

  const W = 600;
  const H = 200;
  const PAD_X = 0;
  const PAD_Y = 16;

  const prices = history.map((h) => h.p);
  const minP = Math.max(0, Math.min(...(prices.length ? prices : [0])) - 0.02);
  const maxP = Math.min(1, Math.max(...(prices.length ? prices : [1])) + 0.02);
  const rangeP = maxP - minP || 0.1;

  const toX = (i: number) =>
    PAD_X + (i / Math.max(1, history.length - 1)) * (W - PAD_X * 2);
  const toY = (p: number) =>
    PAD_Y + (1 - (p - minP) / rangeP) * (H - PAD_Y * 2);

  const linePath = history
    .map((h, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(h.p).toFixed(1)}`)
    .join(" ");

  const areaPath = linePath
    ? `${linePath} L${toX(history.length - 1).toFixed(1)},${H} L${toX(0).toFixed(1)},${H} Z`
    : "";

  const firstPrice = history[0]?.p ?? 0;
  const lastPrice = history[history.length - 1]?.p ?? 0;
  const isUp = lastPrice >= firstPrice;
  const strokeColor = isUp ? "#22c55e" : "#ef4444";
  const fillColor = isUp ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)";

  const hoverPoint = hoverIndex !== null ? history[hoverIndex] : null;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || history.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    const idx = Math.round(ratio * (history.length - 1));
    setHoverIndex(Math.max(0, Math.min(history.length - 1, idx)));
  };

  return (
    <div className="card-glow p-5">
      {/* Interval tabs */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1">
          {INTERVALS.map((iv) => (
            <button
              key={iv.value}
              onClick={() => setInterval(iv.value)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                interval === iv.value
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {iv.label}
            </button>
          ))}
        </div>
        {hoverPoint && (
          <div className="text-right">
            <span className="text-sm font-bold" style={{ color: strokeColor }}>
              {(hoverPoint.p * 100).toFixed(1)}%
            </span>
            <span className="ml-2 text-[11px] text-zinc-400">
              {new Date(hoverPoint.t * 1000).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-[200px] flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
        </div>
      ) : history.length < 2 ? (
        <div className="h-[200px] flex items-center justify-center text-sm text-zinc-400">
          No price history available
        </div>
      ) : (
        <div className="relative">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-[200px] cursor-crosshair"
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverIndex(null)}
          >
            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map((frac) => {
              const y = PAD_Y + frac * (H - PAD_Y * 2);
              return (
                <line
                  key={frac}
                  x1={0}
                  y1={y}
                  x2={W}
                  y2={y}
                  stroke="#f4f4f5"
                  strokeWidth={1}
                />
              );
            })}

            {/* Area fill */}
            <path d={areaPath} fill={fillColor} />

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke={strokeColor}
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />

            {/* Hover line + dot */}
            {hoverIndex !== null && hoverPoint && (
              <>
                <line
                  x1={toX(hoverIndex)}
                  y1={PAD_Y}
                  x2={toX(hoverIndex)}
                  y2={H - PAD_Y}
                  stroke="#a1a1aa"
                  strokeWidth={1}
                  strokeDasharray="3,3"
                  vectorEffect="non-scaling-stroke"
                />
                <circle
                  cx={toX(hoverIndex)}
                  cy={toY(hoverPoint.p)}
                  r={4}
                  fill={strokeColor}
                  stroke="white"
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
              </>
            )}
          </svg>

          {/* Y-axis labels */}
          <div className="absolute top-0 right-1 flex flex-col justify-between h-[200px] py-3 pointer-events-none">
            <span className="text-[10px] text-zinc-400">
              {(maxP * 100).toFixed(0)}%
            </span>
            <span className="text-[10px] text-zinc-400">
              {(((maxP + minP) / 2) * 100).toFixed(0)}%
            </span>
            <span className="text-[10px] text-zinc-400">
              {(minP * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      {/* Time range labels */}
      {history.length >= 2 && !loading && (
        <div className="flex justify-between mt-1 text-[10px] text-zinc-400">
          <span>
            {new Date(history[0].t * 1000).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
          <span>
            {new Date(history[history.length - 1].t * 1000).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric" }
            )}
          </span>
        </div>
      )}
    </div>
  );
}
