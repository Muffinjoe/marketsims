"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MarketCard from "@/components/MarketCard";
import { useAuth } from "@/components/AuthProvider";
import type { PolymarketMarket } from "@/lib/polymarket";

const CATEGORIES = [
  "Trending",
  "Breaking",
  "Ending",
  "New",
  "Politics",
  "Sports",
  "Crypto",
  "Finance",
  "Geopolitics",
  "Tech",
  "Culture",
  "Economy",
  "Weather",
  "Elections",
];

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, openAuth } = useAuth();
  const [markets, setMarkets] = useState<PolymarketMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(
    searchParams.get("cat") || "Trending"
  );
  const tabsRef = useRef<HTMLDivElement>(null);

  // Sync URL params to state
  useEffect(() => {
    const q = searchParams.get("q");
    const cat = searchParams.get("cat");
    if (q) setSearch(q);
    if (cat && CATEGORIES.includes(cat)) setCategory(cat);
  }, [searchParams]);

  // Update URL when category changes (so back button works)
  const changeCategory = (cat: string) => {
    setCategory(cat);
    setSearch("");
    router.replace(`/?cat=${cat}`, { scroll: false });
  };

  const PAGE_SIZE = 40;

  const fetchMarkets = useCallback(async () => {
    setLoading(true);
    setHasMore(true);
    const params = new URLSearchParams();
    if (search) {
      params.set("q", search);
    } else {
      params.set("category", category);
    }
    params.set("limit", String(PAGE_SIZE));

    const res = await fetch(`/api/markets?${params}`);
    const data = await res.json();
    const results = data.markets || [];
    setMarkets(results);
    setHasMore(results.length >= PAGE_SIZE);
    setLoading(false);
  }, [search, category]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const params = new URLSearchParams();
    if (search) {
      params.set("q", search);
    } else {
      params.set("category", category);
    }
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(markets.length));

    const res = await fetch(`/api/markets?${params}`);
    const data = await res.json();
    const results = data.markets || [];
    setMarkets((prev) => [...prev, ...results]);
    setHasMore(results.length >= PAGE_SIZE);
    setLoadingMore(false);
  };

  useEffect(() => {
    const timer = setTimeout(fetchMarkets, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchMarkets, search]);

  return (
    <div>
      {/* Hero — only for logged-out users */}
      {!user && (
        <div className="mx-auto max-w-[1400px] px-4 pt-8 pb-6">
          <div className="card-glow px-6 py-8 sm:px-10 sm:py-10 text-center">
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest mb-3">
              MarketSims
            </p>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight sm:text-3xl">
              Practice prediction markets with fake money
            </h1>
            <p className="mt-2 text-[15px] text-zinc-500 italic">
              Think you can beat the crowd?
            </p>
            <button
              onClick={() => openAuth("signup")}
              className="mt-5 inline-flex items-center rounded-xl bg-blue-600 px-7 py-3 text-[14px] font-bold text-white hover:bg-blue-700 transition shadow-sm shadow-blue-600/20"
            >
              Start playing free
            </button>
            <p className="mt-2.5 text-[12px] text-zinc-500">
              Start with <strong className="text-zinc-700">$10,000 in virtual cash</strong>.
            </p>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              847 predictions made today
            </p>
          </div>
        </div>
      )}

      {/* Category nav bar */}
      <div className="border-b border-zinc-100">
        <div className="mx-auto max-w-[1400px] px-4">
          <div
            ref={tabsRef}
            className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide"
          >
            <span className="shrink-0 mr-1 text-zinc-400">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => changeCategory(cat)}
                className={`shrink-0 px-3 py-2.5 text-[13px] font-medium transition border-b-2 ${
                  category === cat && !search
                    ? "border-zinc-900 text-zinc-900"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-4">
        {/* Markets header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {search ? (
              <h2 className="text-[15px] font-semibold text-zinc-900">
                Results for &ldquo;{search}&rdquo;
              </h2>
            ) : (
              <h2 className="text-[13px] text-zinc-400 font-medium flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Live markets updated in real time
              </h2>
            )}
          </div>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs text-zinc-400 hover:text-zinc-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Market grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-[160px] animate-pulse rounded-xl bg-zinc-100"
              />
            ))}
          </div>
        ) : markets.length === 0 ? (
          <p className="py-20 text-center text-sm text-zinc-400">
            No markets found
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {markets.map((m) => (
                <MarketCard key={m.conditionId || m.id} market={m} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded-xl border border-zinc-200 bg-white px-8 py-2.5 text-[13px] font-semibold text-zinc-600 hover:bg-zinc-50 transition disabled:opacity-50"
                >
                  {loadingMore ? "Loading..." : "Load more markets"}
                </button>
              </div>
            )}

            <p className="mt-4 text-center text-[11px] text-zinc-400">
              Showing {markets.length} markets
            </p>
          </>
        )}
      </div>
    </div>
  );
}
