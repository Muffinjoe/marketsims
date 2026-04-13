"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { marketUrl } from "@/lib/slugify";
import Link from "next/link";
import FollowedPlayers from "@/components/FollowedPlayers";
import ActivityFeed from "@/components/ActivityFeed";

interface Position {
  id: string;
  conditionId: string;
  marketSlug: string;
  question: string;
  outcome: string;
  shares: number;
  avgPrice: number;
  resolved: boolean;
  won: boolean | null;
}

interface ReferralInfo {
  referralCode: string;
  referralCount: number;
  bonusEarned: number;
}

export default function PortfolioPage() {
  const { user, refreshUser, openAuth } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [referral, setReferral] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Trigger resolution check, then load positions
    setResolving(true);
    fetch("/api/resolve", { method: "POST" })
      .then((r) => r.json())
      .then((result) => {
        if (result.resolved > 0) refreshUser();
        setResolving(false);
      })
      .catch(() => setResolving(false));

    Promise.all([
      fetch("/api/positions").then((r) => r.json()),
      fetch("/api/referral").then((r) => r.json()),
    ]).then(([posData, refData]) => {
      setPositions(posData.positions || []);
      setReferral(refData);
      setLoading(false);
    });
  }, [user, refreshUser]);

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-zinc-900">
          Sign in to view your portfolio
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Create an account to start predicting with $10,000 in virtual cash.
        </p>
        <button
          onClick={() => openAuth("signup")}
          className="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Sign Up
        </button>
      </div>
    );
  }

  const openPositions = positions.filter((p) => !p.resolved);
  const resolvedPositions = positions.filter((p) => p.resolved);
  const totalInvested = openPositions.reduce(
    (sum, p) => sum + p.shares * p.avgPrice,
    0
  );
  const totalWon = resolvedPositions
    .filter((p) => p.won)
    .reduce((sum, p) => sum + p.shares, 0);
  const totalLost = resolvedPositions
    .filter((p) => !p.won)
    .reduce((sum, p) => sum + p.shares * p.avgPrice, 0);
  const totalValue = user.balance + totalInvested;

  const copyReferral = () => {
    if (!referral) return;
    navigator.clipboard.writeText(referral.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold text-zinc-900">Portfolio</h1>

      {resolving && (
        <div className="mt-2 text-xs text-zinc-400 flex items-center gap-1.5">
          <div className="h-3 w-3 animate-spin rounded-full border border-zinc-300 border-t-zinc-600" />
          Checking for resolved markets...
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        <div className="card-glow p-4">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
            Cash
          </p>
          <p className="text-xl font-bold text-zinc-900 mt-1">
            ${user.balance.toFixed(2)}
          </p>
        </div>
        <div className="card-glow p-4">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
            Invested
          </p>
          <p className="text-xl font-bold text-zinc-900 mt-1">
            ${totalInvested.toFixed(2)}
          </p>
        </div>
        <div className="card-glow p-4">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
            Total Value
          </p>
          <p className="text-xl font-bold text-zinc-900 mt-1">
            ${totalValue.toFixed(2)}
          </p>
          <p
            className={`text-[11px] font-medium ${
              totalValue >= 10000 ? "text-green-600" : "text-red-600"
            }`}
          >
            {totalValue >= 10000 ? "+" : ""}
            {((totalValue / 10000 - 1) * 100).toFixed(1)}% all time
          </p>
        </div>
        <div className="card-glow p-4">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
            Won / Lost
          </p>
          <p className="text-xl font-bold text-zinc-900 mt-1">
            <span className="text-green-600">${totalWon.toFixed(0)}</span>
            {" / "}
            <span className="text-red-500">${totalLost.toFixed(0)}</span>
          </p>
        </div>
      </div>

      {/* Referral section */}
      {referral && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">
            Invite friends &mdash; you both get $1,000 bonus
          </h3>
          <p className="mt-1 text-xs text-blue-700">
            Share your code. When someone enters it at signup, you both get an
            extra $1,000 in virtual cash.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-mono font-semibold text-zinc-900 border border-blue-200 text-center tracking-wider">
              {referral.referralCode}
            </code>
            <button
              onClick={copyReferral}
              className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
            >
              {copied ? "Copied!" : "Copy code"}
            </button>
          </div>
          {referral.referralCount > 0 && (
            <p className="mt-2 text-xs text-blue-700">
              {referral.referralCount} referral(s) &mdash; $
              {referral.bonusEarned.toLocaleString()} earned
            </p>
          )}
        </div>
      )}

      {/* Open Positions */}
      <div className="mt-6">
        <h2 className="mb-3 text-[15px] font-semibold text-zinc-900">
          Open Positions
        </h2>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-zinc-100"
              />
            ))}
          </div>
        ) : openPositions.length === 0 ? (
          <div className="card-glow p-8 text-center">
            <p className="text-sm text-zinc-500">
              No open positions.{" "}
              <Link
                href="/"
                className="font-medium text-blue-600 hover:underline"
              >
                Browse markets
              </Link>{" "}
              to start predicting.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {openPositions.map((p) => (
              <Link
                key={p.id}
                href={`/market/${p.marketSlug}`}
                className="flex items-center justify-between card-glow p-4 transition hover:border-zinc-300"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-zinc-900 line-clamp-1">
                    {p.question}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {p.shares.toFixed(1)} {p.outcome} shares @{" "}
                    {(p.avgPrice * 100).toFixed(0)}&cent;
                  </p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-[13px] font-semibold text-zinc-900">
                    ${(p.shares * p.avgPrice).toFixed(2)}
                  </p>
                  <p className="text-[11px] font-medium text-green-600">
                    {p.outcome}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Positions */}
      {resolvedPositions.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-[15px] font-semibold text-zinc-900">
            Settled
          </h2>
          <div className="space-y-2">
            {resolvedPositions.map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between rounded-xl border p-4 ${
                  p.won
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-zinc-900 line-clamp-1">
                    {p.question}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {p.shares.toFixed(1)} {p.outcome} shares @{" "}
                    {(p.avgPrice * 100).toFixed(0)}&cent;
                  </p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  {p.won ? (
                    <>
                      <p className="text-[13px] font-bold text-green-700">
                        +${p.shares.toFixed(2)}
                      </p>
                      <p className="text-[11px] font-medium text-green-600">
                        Won
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[13px] font-bold text-red-600">
                        -${(p.shares * p.avgPrice).toFixed(2)}
                      </p>
                      <p className="text-[11px] font-medium text-red-500">
                        Lost
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Players you follow */}
      <div className="mt-6">
        <h2 className="mb-3 text-[15px] font-semibold text-zinc-900">
          Players You Follow
        </h2>
        <FollowedPlayers />
      </div>

      {/* Activity feed */}
      <div className="mt-6">
        <h2 className="mb-3 text-[15px] font-semibold text-zinc-900">
          Feed
        </h2>
        <ActivityFeed />
      </div>
    </div>
  );
}
