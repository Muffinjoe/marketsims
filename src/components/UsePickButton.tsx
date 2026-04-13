"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";

interface Props {
  username: string;
  conditionId: string;
  outcome: string;
  question: string;
  shares: number;
  avgPrice: number;
}

export default function UsePickButton({
  username,
  conditionId,
  outcome,
  question,
  shares: sourceShares,
  avgPrice,
}: Props) {
  const { user, openAuth, refreshUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [sourceAllocation, setSourceAllocation] = useState<number | null>(null);

  // Calculate what % of their portfolio this pick represents
  useEffect(() => {
    if (!showModal) return;
    fetch(`/api/players/${username}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.stats) {
          const pickValue = sourceShares * avgPrice;
          const totalValue = data.stats.totalValue || 10000;
          const pct = (pickValue / totalValue) * 100;
          setSourceAllocation(pct);
          // Auto-suggest the same % of your balance
          if (user) {
            const suggested = Math.floor(user.balance * (pct / 100));
            setAmount(String(Math.max(1, suggested)));
          }
        }
      })
      .catch(() => {});
  }, [showModal, username, sourceShares, avgPrice, user]);

  const handleMirror = async () => {
    if (!user) {
      openAuth("signup");
      return;
    }
    setSubmitting(true);
    setMessage("");

    const res = await fetch("/api/mirror", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        conditionId,
        outcome,
        amount: Number(amount),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error);
    } else {
      setMessage("Pick copied!");
      refreshUser();
      setTimeout(() => setShowModal(false), 1200);
    }
    setSubmitting(false);
  };

  const amountNum = Number(amount) || 0;
  const yourShares = avgPrice > 0 ? amountNum / avgPrice : 0;

  return (
    <>
      <button
        onClick={() => {
          if (!user) {
            openAuth("signup");
            return;
          }
          setShowModal(true);
        }}
        className="rounded-md bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-100 transition"
      >
        Use pick
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-[15px] font-bold text-zinc-900 mb-1">
              Use @{username}&apos;s pick
            </h3>
            <p className="text-[12px] text-zinc-500 mb-3 line-clamp-2">
              {outcome} on &ldquo;{question}&rdquo;
            </p>

            {/* Source player's allocation */}
            {sourceAllocation !== null && (
              <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-3 mb-4 text-[12px]">
                <div className="flex justify-between text-zinc-500">
                  <span>@{username} allocated</span>
                  <span className="font-semibold text-zinc-700">
                    {sourceAllocation.toFixed(1)}% of their portfolio
                  </span>
                </div>
                <div className="flex justify-between text-zinc-500 mt-1">
                  <span>Their position</span>
                  <span className="font-medium text-zinc-700">
                    {sourceShares.toFixed(1)} shares @ {(avgPrice * 100).toFixed(0)}&cent;
                  </span>
                </div>
              </div>
            )}

            <label className="text-[13px] font-medium text-zinc-700">
              Your amount
            </label>
            <div className="mt-1 flex items-baseline overflow-hidden mb-2">
              <span className="text-xl font-bold text-zinc-300 shrink-0">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value.replace(/[^0-9.]/g, ""))
                }
                placeholder="0"
                className="w-full min-w-0 text-xl font-bold text-zinc-900 text-right bg-transparent border-none outline-none caret-zinc-900 ml-1"
              />
            </div>

            {/* Quick adjust */}
            <div className="flex gap-1.5 mb-3">
              <button
                onClick={() => setAmount(String(Math.max(1, Math.floor(amountNum / 2))))}
                className="flex-1 rounded-lg border border-zinc-200 py-1.5 text-[11px] font-semibold text-zinc-500 hover:bg-zinc-50 transition"
              >
                Half
              </button>
              <button
                onClick={() => {
                  if (sourceAllocation && user)
                    setAmount(String(Math.max(1, Math.floor(user.balance * sourceAllocation / 100))));
                }}
                className="flex-1 rounded-lg border border-blue-200 bg-blue-50 py-1.5 text-[11px] font-semibold text-blue-600 hover:bg-blue-100 transition"
              >
                Match {sourceAllocation?.toFixed(0) || "—"}%
              </button>
              <button
                onClick={() => setAmount(String(Math.floor(amountNum * 2)))}
                className="flex-1 rounded-lg border border-zinc-200 py-1.5 text-[11px] font-semibold text-zinc-500 hover:bg-zinc-50 transition"
              >
                Double
              </button>
            </div>

            {amountNum > 0 && (
              <div className="text-[12px] text-zinc-500 mb-3 flex justify-between">
                <span>You&apos;ll get</span>
                <span className="font-semibold text-zinc-700">
                  {yourShares.toFixed(1)} shares ({user ? ((amountNum / user.balance) * 100).toFixed(1) : 0}% of your balance)
                </span>
              </div>
            )}

            <button
              onClick={handleMirror}
              disabled={submitting || amountNum <= 0}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-[14px] font-bold text-white hover:bg-blue-700 transition disabled:opacity-40"
            >
              {submitting ? "..." : "Use this pick"}
            </button>

            {message && (
              <p
                className={`mt-2 text-center text-[12px] font-medium ${
                  message.includes("copied")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
