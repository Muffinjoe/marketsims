"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import type { PolymarketEvent, PolymarketMarket } from "@/lib/polymarket";
import Link from "next/link";

export default function EventDetail({ event }: { event: PolymarketEvent }) {
  const { user, refreshUser, openAuth } = useAuth();
  const [selected, setSelected] = useState<PolymarketMarket>(event.markets[0]);
  const [amount, setAmount] = useState("");
  const [outcome, setOutcome] = useState<"Yes" | "No">("Yes");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const amountNum = Number(amount) || 0;
  const price = selected.outcomePrices[outcome === "Yes" ? 0 : 1] ?? 0.5;
  const shares = amountNum > 0 ? amountNum / price : 0;
  const potentialWin = shares;

  const handleTrade = async () => {
    if (!user) {
      openAuth("signup");
      return;
    }
    if (amountNum <= 0) return;

    setSubmitting(true);
    setMessage("");

    const res = await fetch("/api/trade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conditionId: selected.conditionId,
        marketSlug: selected.slug,
        question: selected.question,
        outcome,
        shares,
        price,
        side: "BUY",
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error);
    } else {
      setMessage(
        `Predicted ${outcome} with ${shares.toFixed(1)} shares`
      );
      setAmount("");
      refreshUser();
    }
    setSubmitting(false);
  };

  const addAmount = (add: number) => {
    setAmount(String((amountNum || 0) + add));
  };

  const formatVolume = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  };

  const totalVolume = event.markets.reduce(
    (sum, m) => sum + Number(m.volume || 0),
    0
  );

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-5">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-600"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* Left column */}
        <div className="space-y-4">
          {/* Event header */}
          <div className="card-glow p-5">
            <div className="flex items-start gap-3.5">
              {event.image && (
                <img
                  src={event.image}
                  alt=""
                  className="h-12 w-12 rounded-xl object-cover shrink-0"
                />
              )}
              <div>
                <h1 className="text-lg font-bold text-zinc-900 leading-tight">
                  {event.title}
                </h1>
                <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400">
                  <span>{formatVolume(totalVolume)} Vol.</span>
                  <span>{event.markets.length} outcomes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Candidates list */}
          <div className="card-glow overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_80px_100px_100px] gap-2 px-5 py-3 border-b border-zinc-100 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              <span>Outcome</span>
              <span className="text-right">Chance</span>
              <span className="text-center">Yes</span>
              <span className="text-center">No</span>
            </div>

            {event.markets.map((m) => {
              const yesPrice = m.outcomePrices[0] ?? 0;
              const noPrice = m.outcomePrices[1] ?? 0;
              // Extract candidate name from groupItemTitle or question
              const name =
                m.question
                  .replace(/^Will the next .+ be /, "")
                  .replace(/^Will /, "")
                  .replace(/\?$/, "")
                  .replace(/ win .+$/, "")
                  .replace(/ be the .+$/, "") || m.question;
              const isSelected = selected?.id === m.id;
              const vol = Number(m.volume || 0);

              return (
                <div
                  key={m.id}
                  className={`grid grid-cols-[1fr_80px_100px_100px] gap-2 items-center px-5 py-3 border-b border-zinc-50 last:border-0 transition cursor-pointer ${
                    isSelected ? "bg-blue-50" : "hover:bg-zinc-50"
                  }`}
                  onClick={() => {
                    setSelected(m);
                    setOutcome("Yes");
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {m.image && (
                      <img
                        src={m.image}
                        alt=""
                        className="h-7 w-7 rounded-md object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-zinc-900 truncate">
                        {name}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {formatVolume(vol)} Vol.
                      </p>
                    </div>
                  </div>

                  <span className="text-[15px] font-bold text-zinc-900 text-right">
                    {(yesPrice * 100).toFixed(0)}%
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(m);
                      setOutcome("Yes");
                    }}
                    className={`rounded-md py-1.5 text-[12px] font-semibold transition ${
                      isSelected && outcome === "Yes"
                        ? "bg-green-500 text-white"
                        : "bg-green-50 border border-green-200 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    Yes {(yesPrice * 100).toFixed(0)}&cent;
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(m);
                      setOutcome("No");
                    }}
                    className={`rounded-md py-1.5 text-[12px] font-semibold transition ${
                      isSelected && outcome === "No"
                        ? "bg-red-500 text-white"
                        : "bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
                    }`}
                  >
                    No {(noPrice * 100).toFixed(0)}&cent;
                  </button>
                </div>
              );
            })}
          </div>

          {/* Description */}
          {event.description && (
            <div className="card-glow p-5">
              <h3 className="mb-2 text-sm font-semibold text-zinc-900">Rules</h3>
              <p className="whitespace-pre-wrap text-[13px] text-zinc-500 leading-relaxed">
                {event.description.slice(0, 1500)}
              </p>
            </div>
          )}
        </div>

        {/* Right column — trade panel */}
        <div className="space-y-4">
          <div className="card-glow overflow-hidden">
            {/* Selected candidate header */}
            <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
              {selected.image && (
                <img
                  src={selected.image}
                  alt=""
                  className="h-7 w-7 rounded-md object-cover"
                />
              )}
              <span className="text-[13px] font-semibold text-zinc-900 truncate">
                {selected.question
                  .replace(/^Will the next .+ be /, "")
                  .replace(/^Will /, "")
                  .replace(/\?$/, "")
                  .replace(/ win .+$/, "")}
              </span>
            </div>

            {/* Predict tab */}
            <div className="flex items-end border-b border-zinc-100 px-4">
              <span className="pb-2 mr-4 text-[13px] font-semibold border-b-2 border-zinc-900 text-zinc-900">
                Predict
              </span>
              <div className="flex-1" />
            </div>

            <div className="p-4">
              {/* Yes / No buttons */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                <button
                  onClick={() => setOutcome("Yes")}
                  className={`rounded-lg py-2.5 text-[13px] font-bold transition ${
                    outcome === "Yes"
                      ? "bg-green-500 text-white"
                      : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  Yes {(selected.outcomePrices[0] * 100).toFixed(0)}&cent;
                </button>
                <button
                  onClick={() => setOutcome("No")}
                  className={`rounded-lg py-2.5 text-[13px] font-bold transition ${
                    outcome === "No"
                      ? "bg-red-500 text-white"
                      : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  No {(selected.outcomePrices[1] * 100).toFixed(0)}&cent;
                </button>
              </div>

              {/* Amount */}
              <div className="mb-3">
                <span className="text-[13px] font-medium text-zinc-700">Amount</span>
                <div className="mt-1 flex items-baseline overflow-hidden">
                  <span className="text-2xl font-bold text-zinc-300 shrink-0">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9.]/g, "");
                      setAmount(v);
                    }}
                    placeholder="0"
                    className="w-full min-w-0 text-2xl font-bold text-zinc-900 text-right bg-transparent border-none outline-none placeholder:text-zinc-300 caret-zinc-900 ml-1"
                  />
                </div>
              </div>

              {/* Presets */}
              <div className="mb-5 flex gap-1.5">
                {[1, 5, 10, 100].map((p) => (
                  <button
                    key={p}
                    onClick={() => addAmount(p)}
                    className="flex-1 rounded-lg border border-zinc-200 py-1.5 text-[11px] font-semibold text-zinc-500 hover:bg-zinc-50 transition"
                  >
                    +${p}
                  </button>
                ))}
                <button
                  onClick={() => {
                    if (!user) { openAuth("signup"); return; }
                    setAmount(String(Math.floor(user.balance)));
                  }}
                  className="flex-1 rounded-lg border border-zinc-200 py-1.5 text-[11px] font-semibold text-zinc-500 hover:bg-zinc-50 transition"
                >
                  Max
                </button>
              </div>

              {/* To win */}
              {amountNum > 0 && (
                <div className="mb-4 border-t border-zinc-100 pt-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-medium text-zinc-700">To win</span>
                        <span className="text-sm">&#x1F340;</span>
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        Avg. Price {(price * 100).toFixed(0)}&cent;
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      ${potentialWin.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleTrade}
                disabled={submitting || amountNum <= 0}
                className="w-full rounded-xl bg-green-500 py-3 text-[14px] font-bold text-white hover:bg-green-600 transition disabled:opacity-40"
              >
                {submitting ? "..." : "Make prediction"}
              </button>

              <p className="mt-2.5 text-center text-[10px] text-zinc-400">
                No real money involved. For entertainment purposes only. See{" "}
                <span className="underline">Terms of Use</span>
              </p>

              {user && (
                <p className="mt-2 text-center text-[11px] text-zinc-400">
                  Balance:{" "}
                  <span className="font-semibold text-zinc-600">
                    ${user.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
              )}

              {message && (
                <div
                  className={`mt-3 rounded-lg p-2.5 text-center text-[12px] font-medium ${
                    message.includes("Predicted")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>
          </div>

          {/* Polymarket CTA — signed in only */}
          {user && (
            <a
              href="https://polymarket.com?via=BHSpWG9"
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
        </div>
      </div>
    </div>
  );
}
