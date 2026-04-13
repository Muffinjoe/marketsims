"use client";

import Link from "next/link";
import type { PolymarketMarket } from "@/lib/polymarket";
import { marketUrl } from "@/lib/slugify";

// Try to extract the subject name from a "Will X win/be..." question
function extractSubject(question: string): string | null {
  // "Will Spain win the 2026 FIFA World Cup?" → "Spain"
  // "Will the Oklahoma City Thunder win the 2026 NBA Finals?" → "Oklahoma City Thunder"
  const patterns = [
    /^Will (?:the )?(.+?) (?:win|be|reach|hit|dip|make)/i,
    /^Will (.+?)\?/i,
  ];
  for (const p of patterns) {
    const m = question.match(p);
    if (m && m[1] && m[1].length < 40) return m[1];
  }
  return null;
}

export default function MarketCard({ market }: { market: PolymarketMarket }) {
  const volume = Number(market.volume || 0);
  const outcomes = market.outcomes.map((name, i) => ({
    name,
    price: market.outcomePrices[i] ?? 0,
    pct: ((market.outcomePrices[i] ?? 0) * 100).toFixed(0),
  }));

  const formatVolume = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(0)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  };

  const isYesNo =
    outcomes.length === 2 &&
    outcomes[0].name === "Yes" &&
    outcomes[1].name === "No";

  const isUpDown =
    outcomes.length === 2 &&
    ((outcomes[0].name === "Up" && outcomes[1].name === "Down") ||
      (outcomes[0].name === "Over" && outcomes[1].name === "Under"));

  // Head-to-head: two outcomes that are NOT Yes/No or Up/Down (e.g. team names)
  const isVs =
    outcomes.length === 2 && !isYesNo && !isUpDown;

  // For Yes/No sports cards, extract subject from question
  const subject = isYesNo ? extractSubject(market.question) : null;

  return (
    <Link
      href={marketUrl(market.id, market.question)}
      className="flex flex-col card-glow px-4 py-3.5 h-full"
    >
      {/* Header */}
      <div className="flex items-start gap-2.5 mb-3">
        {market.image ? (
          <img
            src={market.image}
            alt=""
            className="h-9 w-9 rounded-lg object-cover shrink-0 mt-0.5"
          />
        ) : (
          <div className="h-9 w-9 rounded-lg bg-zinc-100 shrink-0 mt-0.5" />
        )}
        <h3 className="text-[13px] font-semibold text-zinc-900 leading-[1.3] line-clamp-2 flex-1">
          {market.question}
        </h3>
      </div>

      {/* Card body */}
      <div className="mt-auto">
        {isVs ? (
          /* Head-to-head matchup — team name buttons */
          <div className="grid grid-cols-2 gap-2 mb-2">
            {outcomes.map((o, i) => (
              <div
                key={o.name}
                className={`rounded-lg py-2 px-2 text-center border ${
                  i === 0
                    ? "bg-green-50 border-green-200"
                    : "bg-zinc-50 border-zinc-200"
                }`}
              >
                <span
                  className={`text-[12px] font-bold block truncate ${
                    i === 0 ? "text-green-700" : "text-zinc-700"
                  }`}
                >
                  {o.name}
                </span>
                <span
                  className={`text-[11px] font-medium ${
                    i === 0 ? "text-green-600" : "text-zinc-500"
                  }`}
                >
                  {o.pct}%
                </span>
              </div>
            ))}
          </div>
        ) : isUpDown ? (
          /* Up/Down — colored buttons */
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="rounded-lg bg-green-50 border border-green-200 py-2 px-3 text-center">
              <span className="text-[12px] font-bold text-green-700">
                {outcomes[0].name}
              </span>
              <span className="text-[11px] text-green-600 ml-1">
                {outcomes[0].pct}%
              </span>
            </div>
            <div className="rounded-lg bg-red-50 border border-red-200 py-2 px-3 text-center">
              <span className="text-[12px] font-bold text-red-600">
                {outcomes[1].name}
              </span>
              <span className="text-[11px] text-red-500 ml-1">
                {outcomes[1].pct}%
              </span>
            </div>
          </div>
        ) : isYesNo && subject ? (
          /* Yes/No with extractable subject (sports/elections) — show subject name + pct + Yes/No */
          <div className="space-y-1.5 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-zinc-600 truncate flex-1 min-w-0">
                {subject}
              </span>
              <span className="text-[12px] font-bold text-zinc-900 shrink-0">
                {outcomes[0].pct}%
              </span>
              <div className="flex gap-1 shrink-0">
                <span className="inline-flex items-center justify-center rounded px-2 py-[2px] text-[10px] font-semibold border border-green-200 bg-green-50 text-green-700">
                  Yes
                </span>
                <span className="inline-flex items-center justify-center rounded px-2 py-[2px] text-[10px] font-semibold border border-red-200 bg-red-50 text-red-600">
                  No
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Default Yes/No — percentage + buttons */
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-zinc-900">
              {outcomes[0].pct}%
            </span>
            <div className="flex gap-1.5">
              <span className="inline-flex items-center justify-center rounded px-3 py-[4px] text-[11px] font-semibold border border-green-200 bg-green-50 text-green-700">
                Yes
              </span>
              <span className="inline-flex items-center justify-center rounded px-3 py-[4px] text-[11px] font-semibold border border-red-200 bg-red-50 text-red-600">
                No
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
        <span className="text-[11px] text-zinc-400 font-medium">
          {formatVolume(volume)} Vol.
        </span>
        <svg
          className="h-3.5 w-3.5 text-zinc-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      </div>
    </Link>
  );
}
