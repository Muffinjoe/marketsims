"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import ShareButton from "./ShareButton";
import { pixelPrediction } from "@/lib/pixel";
import type { PolymarketMarket } from "@/lib/polymarket";

export default function TradePanel({ market }: { market: PolymarketMarket }) {
  const { user, refreshUser, openAuth } = useAuth();
  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [outcome, setOutcome] = useState<string>(market.outcomes[0] || "Yes");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const outcomeIndex = market.outcomes.indexOf(outcome);
  const price = market.outcomePrices[outcomeIndex >= 0 ? outcomeIndex : 0] ?? 0.5;
  const amountNum = Number(amount) || 0;
  const shares = amountNum > 0 ? amountNum / price : 0;
  const potentialWin = shares;

  const handleTrade = async () => {
    if (!user) {
      openAuth();
      return;
    }
    if (amountNum <= 0) return;

    setSubmitting(true);
    setMessage("");

    const side = tab === "buy" ? "BUY" : "SELL";
    const sharesToTrade = tab === "buy" ? shares : amountNum;

    const res = await fetch("/api/trade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conditionId: market.conditionId,
        marketSlug: market.slug,
        question: market.question,
        outcome,
        shares: sharesToTrade,
        price,
        side,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error);
    } else {
      setMessage(
        `${side === "BUY" ? "Predicted" : "Cashed out"} ${sharesToTrade.toFixed(1)} ${outcome} shares`
      );
      setAmount("");
      refreshUser();
      // Update daily challenge streak + track pixel
      if (side === "BUY") {
        fetch("/api/daily", { method: "POST" }).catch(() => {});
        pixelPrediction(market.question);
      }
    }
    setSubmitting(false);
  };

  const addAmount = (add: number) => {
    setAmount(String((amountNum || 0) + add));
  };

  return (
    <div className="card-glow overflow-hidden">
      {/* Market mini-header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
        {market.image && (
          <img
            src={market.image}
            alt=""
            className="h-7 w-7 rounded-md object-cover"
          />
        )}
        <span className="text-[13px] font-medium text-zinc-700">
          {market.endDate
            ? new Date(market.endDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })
            : market.question.slice(0, 30)}
        </span>
      </div>

      {/* Predict / Sell tabs */}
      <div className="flex items-end border-b border-zinc-100 px-4">
        <button
          onClick={() => setTab("buy")}
          className={`pb-2 mr-4 text-[13px] font-semibold transition border-b-2 ${
            tab === "buy"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          Predict
        </button>
        <button
          onClick={() => setTab("sell")}
          className={`pb-2 mr-4 text-[13px] font-semibold transition border-b-2 ${
            tab === "sell"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          Cash out
        </button>
        <div className="flex-1" />
      </div>

      <div className="p-4">
        {/* Outcome buttons */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {market.outcomes.map((o, i) => {
            const p = market.outcomePrices[i] ?? 0;
            const selected = outcome === o;
            return (
              <button
                key={o}
                onClick={() => setOutcome(o)}
                className={`rounded-lg py-2.5 text-[13px] font-bold transition ${
                  selected
                    ? i === 0
                      ? "bg-green-500 text-white"
                      : "bg-zinc-800 text-white"
                    : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {o} {(p * 100).toFixed(0)}&cent;
              </button>
            );
          })}
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
              if (!user) { openAuth(); return; }
              setAmount(String(Math.floor(user.balance)));
            }}
            className="flex-1 rounded-lg border border-zinc-200 py-1.5 text-[11px] font-semibold text-zinc-500 hover:bg-zinc-50 transition"
          >
            Max
          </button>
        </div>

        {/* To win section */}
        {amountNum > 0 && (
          <div className="mb-4 border-t border-zinc-100 pt-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-medium text-zinc-700">To win</span>
                  <span className="text-sm">&#x1F340;</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[11px] text-zinc-400">
                    Avg. Price {(price * 100).toFixed(0)}&cent;
                  </span>
                  <svg className="h-3 w-3 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth={2} />
                    <path strokeLinecap="round" strokeWidth={2} d="M12 16v-4m0-4h.01" />
                  </svg>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">
                ${potentialWin.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Trade button */}
        <button
          onClick={handleTrade}
          disabled={submitting || amountNum <= 0}
          className="w-full rounded-xl bg-green-500 py-3 text-[14px] font-bold text-white hover:bg-green-600 transition disabled:opacity-40 disabled:hover:bg-green-500"
        >
          {submitting ? "..." : "Make prediction"}
        </button>

        {/* Terms */}
        <p className="mt-2.5 text-center text-[10px] text-zinc-400">
          No real money involved. For entertainment purposes only. See{" "}
          <span className="underline">Terms of Use</span>
        </p>

        {user && (
          <p className="mt-1.5 text-center text-[11px] text-zinc-400">
            Balance:{" "}
            <span className="font-semibold text-zinc-600">
              ${user.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </p>
        )}

        {message && (
          <div
            className={`mt-3 rounded-lg p-2.5 text-[12px] font-medium ${
              message.includes("Predicted") || message.includes("Cashed out")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            <p className="text-center">{message}</p>
            {message.includes("Predicted") && (
              <div className="mt-2 flex justify-center">
                <ShareButton
                  text={`I predicted ${outcome} on "${market.question}" on MarketSims!`}
                  compact
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
