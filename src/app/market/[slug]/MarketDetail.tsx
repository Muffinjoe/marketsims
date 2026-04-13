"use client";

import TradePanel from "@/components/TradePanel";
import PriceChart from "@/components/PriceChart";
import { useAuth } from "@/components/AuthProvider";
import type { PolymarketMarket } from "@/lib/polymarket";
import { marketUrl } from "@/lib/slugify";
import { pixelViewMarket } from "@/lib/pixel";
import Link from "next/link";
import { useState, useEffect } from "react";

interface RelatedMarket {
  id: string;
  question: string;
  slug: string;
  image: string;
  outcomePrices: number[];
  endDate: string;
}

export default function MarketDetail({ market }: { market: PolymarketMarket }) {
  const { user } = useAuth();
  const yesPrice = market.outcomePrices[0] ?? 0.5;
  const volume = Number(market.volume || 0);
  const [activeTab, setActiveTab] = useState<"rules" | "context">("rules");
  const [related, setRelated] = useState<RelatedMarket[]>([]);
  const affiliateLink = "https://polymarket.com?via=BHSpWG9";

  const formatVolume = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  };

  // Track market view
  useEffect(() => {
    pixelViewMarket(market.question);
  }, [market.question]);

  // Load related/trending markets
  useEffect(() => {
    fetch(`/api/markets?limit=10`)
      .then((r) => r.json())
      .then((data) => {
        const filtered = (data.markets || []).filter(
          (m: PolymarketMarket) => m.conditionId !== market.conditionId
        );
        setRelated(filtered.slice(0, 4));
      })
      .catch(() => {});
  }, [market.conditionId]);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* Left column */}
        <div className="space-y-4">
          {/* Market header card */}
          <div className="card-glow p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3.5">
                {market.image && (
                  <img
                    src={market.image}
                    alt=""
                    className="h-12 w-12 rounded-xl object-cover shrink-0"
                  />
                )}
                <div>
                  <h1 className="text-lg font-bold text-zinc-900 leading-tight">
                    {market.question}
                  </h1>
                  {market.endDate && (
                    <p className="mt-1 text-xs text-zinc-400">
                      {new Date(market.endDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <button className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                <button className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-4 flex items-center gap-6">
              <div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
                  Yes
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {(yesPrice * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
                  No
                </p>
                <p className="text-2xl font-bold text-red-500">
                  {((1 - yesPrice) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>

          {/* Price chart */}
          <PriceChart tokenId={market.clobTokenIds[0] || ""} />

          {/* Trade panel — mobile only (shows between chart and rules) */}
          <div className="lg:hidden">
            <TradePanel market={market} />
          </div>

          {/* Rules / Market Context tabs */}
          <div className="card-glow">
            <div className="flex border-b border-zinc-100">
              <button
                onClick={() => setActiveTab("rules")}
                className={`px-5 py-3 text-sm font-semibold transition border-b-2 ${
                  activeTab === "rules"
                    ? "border-zinc-900 text-zinc-900"
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                }`}
              >
                Rules
              </button>
              <button
                onClick={() => setActiveTab("context")}
                className={`px-5 py-3 text-sm font-semibold transition border-b-2 ${
                  activeTab === "context"
                    ? "border-zinc-900 text-zinc-900"
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                }`}
              >
                Market Context
              </button>
            </div>
            <div className="p-5">
              {activeTab === "rules" && market.description ? (
                <p className="whitespace-pre-wrap text-[13px] text-zinc-500 leading-relaxed">
                  {market.description}
                </p>
              ) : (
                <p className="text-[13px] text-zinc-400">
                  No additional context available for this market.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Trade panel — desktop only (mobile version is above rules) */}
          <div className="hidden lg:block">
            <TradePanel market={market} />
          </div>

          {/* Polymarket CTA — signed in only */}
          {user && (
            <a
              href={affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-blue-700 transition shadow-sm shadow-blue-600/20"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Try this market on Polymarket
            </a>
          )}

          {/* Related/trending markets */}
          {related.length > 0 && (
            <div className="card-glow p-4">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                Trending markets
              </h3>
              <div className="space-y-0">
                {related.map((r) => {
                  const rYes = r.outcomePrices[0] ?? 0.5;
                  return (
                    <Link
                      key={r.slug}
                      href={marketUrl(r.id, r.question)}
                      className="flex items-center gap-3 py-2.5 border-b border-zinc-50 last:border-0 hover:bg-zinc-50 -mx-1 px-1 rounded transition"
                    >
                      {r.image ? (
                        <img
                          src={r.image}
                          alt=""
                          className="h-8 w-8 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-zinc-100 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-zinc-700 line-clamp-2 leading-tight">
                          {r.question}
                        </p>
                        {r.endDate && (
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            {new Date(r.endDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-bold text-green-600">
                        {(rYes * 100).toFixed(0)}%
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
