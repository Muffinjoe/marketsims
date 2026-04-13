"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LeaderboardEntry {
  username: string;
  balance: number;
  invested: number;
  totalValue: number;
}

interface MonthlyEntry {
  username: string;
  totalValue: number;
  monthlyPicks: number;
  winRate: number;
}

interface Prize {
  place: number;
  label: string;
  reward: string;
  emoji: string;
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"monthly" | "alltime">("monthly");
  const [allTime, setAllTime] = useState<LeaderboardEntry[]>([]);
  const [monthly, setMonthly] = useState<MonthlyEntry[]>([]);
  const [monthName, setMonthName] = useState("");
  const [daysLeft, setDaysLeft] = useState(0);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/leaderboard").then((r) => r.json()),
      fetch("/api/leaderboard/monthly").then((r) => r.json()),
    ]).then(([allData, monthlyData]) => {
      setAllTime(allData.leaderboard || []);
      setMonthly(monthlyData.leaderboard || []);
      setMonthName(monthlyData.month || "");
      setDaysLeft(monthlyData.daysLeft || 0);
      setPrizes(monthlyData.prizes || []);
      setLoading(false);
    });
  }, []);

  const getMedal = (i: number) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return `#${i + 1}`;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold text-zinc-900">Leaderboard</h1>

      {/* Tabs */}
      <div className="mt-4 flex border-b border-zinc-100">
        <button
          onClick={() => setTab("monthly")}
          className={`pb-2 mr-6 text-[14px] font-semibold transition border-b-2 ${
            tab === "monthly"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setTab("alltime")}
          className={`pb-2 text-[14px] font-semibold transition border-b-2 ${
            tab === "alltime"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          All Time
        </button>
      </div>

      {/* Monthly prizes banner */}
      {tab === "monthly" && (
        <div className="mt-4 card-glow p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[15px] font-bold text-zinc-900">
                {monthName} Competition
              </h2>
              <p className="text-[12px] text-zinc-400 mt-0.5">
                {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
                Prize Pool
              </span>
              <p className="text-lg font-bold text-green-600">$55,000</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {prizes.map((p) => (
              <div
                key={p.place}
                className="rounded-lg bg-zinc-50 border border-zinc-100 p-2.5 text-center"
              >
                <span className="text-lg">{p.emoji}</span>
                <p className="text-[11px] font-semibold text-zinc-700 mt-0.5">
                  {p.label}
                </p>
                <p className="text-[10px] text-green-600 font-medium">
                  {p.reward}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard table */}
      <div className="mt-4">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-xl bg-zinc-100"
              />
            ))}
          </div>
        ) : tab === "monthly" ? (
          monthly.length === 0 ? (
            <div className="card-glow p-8 text-center">
              <p className="text-[13px] text-zinc-400">
                No predictions yet this month. Be the first!
              </p>
            </div>
          ) : (
            <div className="card-glow overflow-hidden">
              <div className="grid grid-cols-[50px_1fr_80px_80px_100px] gap-2 px-4 py-2.5 border-b border-zinc-100 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                <span>Rank</span>
                <span>Player</span>
                <span className="text-right">Picks</span>
                <span className="text-right">Win %</span>
                <span className="text-right">Value</span>
              </div>
              {monthly.map((entry, i) => (
                <div
                  key={entry.username}
                  className={`grid grid-cols-[50px_1fr_80px_80px_100px] gap-2 items-center px-4 py-3 border-b border-zinc-50 last:border-0 ${
                    i < 3 ? "bg-gradient-to-r from-yellow-50/50 to-transparent" : ""
                  }`}
                >
                  <span className="text-[14px] font-bold text-zinc-400">
                    {getMedal(i)}
                  </span>
                  <Link
                    href={`/profile/${entry.username}`}
                    className="text-[13px] font-medium text-blue-600 hover:underline flex items-center gap-2"
                  >
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-blue-600">
                        {entry.username[0].toUpperCase()}
                      </span>
                    </div>
                    {entry.username}
                  </Link>
                  <span className="text-right text-[13px] text-zinc-600">
                    {entry.monthlyPicks}
                  </span>
                  <span className="text-right text-[13px] font-medium text-green-600">
                    {entry.winRate}%
                  </span>
                  <span className="text-right text-[13px] font-semibold text-zinc-900">
                    ${entry.totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          )
        ) : allTime.length === 0 ? (
          <p className="py-12 text-center text-sm text-zinc-400">
            No players yet. Be the first!
          </p>
        ) : (
          <div className="card-glow overflow-hidden">
            <div className="grid grid-cols-[50px_1fr_80px_80px_100px] gap-2 px-4 py-2.5 border-b border-zinc-100 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              <span>Rank</span>
              <span>Player</span>
              <span className="text-right">Cash</span>
              <span className="text-right">Invested</span>
              <span className="text-right">Total</span>
            </div>
            {allTime.map((entry, i) => (
              <div
                key={entry.username}
                className={`grid grid-cols-[50px_1fr_80px_80px_100px] gap-2 items-center px-4 py-3 border-b border-zinc-50 last:border-0 ${
                  i < 3 ? "bg-gradient-to-r from-yellow-50/50 to-transparent" : ""
                }`}
              >
                <span className="text-[14px] font-bold text-zinc-400">
                  {getMedal(i)}
                </span>
                <Link
                  href={`/profile/${entry.username}`}
                  className="text-[13px] font-medium text-blue-600 hover:underline flex items-center gap-2"
                >
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-blue-600">
                      {entry.username[0].toUpperCase()}
                    </span>
                  </div>
                  {entry.username}
                </Link>
                <span className="text-right text-[13px] text-zinc-600">
                  ${entry.balance.toFixed(0)}
                </span>
                <span className="text-right text-[13px] text-zinc-600">
                  ${entry.invested.toFixed(0)}
                </span>
                <span className="text-right text-[13px] font-semibold text-zinc-900">
                  ${entry.totalValue.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
