"use client";

import { useState } from "react";

interface Stats {
  overview: {
    totalUsers: number;
    usersToday: number;
    usersThisWeek: number;
    usersThisMonth: number;
    totalPredictions: number;
    predictionsToday: number;
    predictionsThisWeek: number;
    totalPositions: number;
    resolvedPositions: number;
    openPositions: number;
    totalFollows: number;
    totalActivities: number;
  };
  recentSignups: {
    username: string;
    email: string;
    balance: number;
    createdAt: string;
  }[];
  topUsers: {
    username: string;
    totalValue: number;
    winRate: number;
    totalPicks: number;
  }[];
  dailySignups: { date: string; count: number }[];
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Wrong password");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setStats(data);
      setAuthed(true);
    } catch (err) {
      setError("Failed to connect. Try again.");
    }
    setLoading(false);
  };

  const refresh = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setStats(data);
    setLoading(false);
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-sm card-glow p-6">
          <h1 className="text-lg font-bold text-zinc-900 mb-4">Admin</h1>
          {error && (
            <p className="mb-3 text-[13px] text-red-600 font-medium">{error}</p>
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Password"
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
          />
          <button
            onClick={login}
            disabled={loading}
            className="mt-3 w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "..." : "Log in"}
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;
  const { overview } = stats;

  const maxSignup = Math.max(...stats.dailySignups.map((d) => d.count), 1);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Admin Dashboard</h1>
        <button
          onClick={refresh}
          disabled={loading}
          className="rounded-lg border border-zinc-200 px-4 py-1.5 text-[13px] font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
        >
          {loading ? "..." : "Refresh"}
        </button>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Users" value={overview.totalUsers} />
        <StatCard label="Today" value={overview.usersToday} highlight />
        <StatCard label="This Week" value={overview.usersThisWeek} />
        <StatCard label="This Month" value={overview.usersThisMonth} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Predictions" value={overview.totalPredictions} />
        <StatCard label="Today" value={overview.predictionsToday} highlight />
        <StatCard label="This Week" value={overview.predictionsThisWeek} />
        <StatCard label="Open Positions" value={overview.openPositions} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Resolved" value={overview.resolvedPositions} />
        <StatCard label="Follows" value={overview.totalFollows} />
        <StatCard label="Activities" value={overview.totalActivities} />
      </div>

      {/* Daily signups chart */}
      <div className="card-glow p-5 mb-6">
        <h2 className="text-[14px] font-semibold text-zinc-900 mb-4">
          Signups (14 days)
        </h2>
        <div className="flex items-end gap-1 h-32">
          {stats.dailySignups.map((d) => (
            <div
              key={d.date}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <span className="text-[10px] text-zinc-500 font-medium">
                {d.count > 0 ? d.count : ""}
              </span>
              <div
                className="w-full rounded-t bg-blue-500 min-h-[2px]"
                style={{
                  height: `${Math.max((d.count / maxSignup) * 100, 2)}%`,
                }}
              />
              <span className="text-[9px] text-zinc-400">
                {d.date.slice(5)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent signups */}
        <div className="card-glow overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-100">
            <h2 className="text-[14px] font-semibold text-zinc-900">
              Recent Signups
            </h2>
          </div>
          <div className="divide-y divide-zinc-50">
            {stats.recentSignups.map((u) => (
              <div key={u.username} className="px-4 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-zinc-900">
                    {u.username}
                  </p>
                  <p className="text-[11px] text-zinc-400">{u.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-medium text-zinc-700">
                    ${u.balance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    {new Date(u.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top users */}
        <div className="card-glow overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-100">
            <h2 className="text-[14px] font-semibold text-zinc-900">
              Top Players
            </h2>
          </div>
          <div className="divide-y divide-zinc-50">
            {stats.topUsers.map((u, i) => (
              <div key={u.username} className="px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-[13px] font-bold text-zinc-400 w-5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[13px] font-medium text-zinc-900">
                      {u.username}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {u.totalPicks} picks &middot; {u.winRate}% win rate
                    </p>
                  </div>
                </div>
                <span className="text-[13px] font-semibold text-green-600">
                  ${u.totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="card-glow p-3.5">
      <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
        {label}
      </p>
      <p
        className={`text-xl font-bold mt-0.5 ${
          highlight ? "text-blue-600" : "text-zinc-900"
        }`}
      >
        {value.toLocaleString()}
      </p>
    </div>
  );
}
