"use client";

import { useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
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
        setError("Wrong password");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setStats(data);
      setAuthed(true);
    } catch {
      setError("Failed to connect");
    }
    setLoading(false);
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      setStats(data);
    } catch {
      setError("Failed to refresh");
    }
    setLoading(false);
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-sm card-glow p-6">
          <h1 className="text-lg font-bold text-zinc-900 mb-4">Admin</h1>
          {error && (
            <p className="mb-3 text-[13px] text-red-600 font-medium">
              {error}
            </p>
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
            {loading ? "Loading..." : "Log in"}
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const ov = (stats.overview || {}) as Record<string, number>;
  const signups = (stats.recentSignups || []) as {
    username: string;
    email: string;
    balance: number;
    createdAt: string;
  }[];
  const top = (stats.topUsers || []) as {
    username: string;
    totalValue: number;
    winRate: number;
    totalPicks: number;
  }[];
  const daily = (stats.dailySignups || []) as {
    date: string;
    count: number;
  }[];
  const maxDaily = Math.max(...daily.map((d) => d.count), 1);

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

      {/* Users */}
      <h2 className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
        Users
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Stat label="Total" value={ov.totalUsers || 0} />
        <Stat label="Today" value={ov.usersToday || 0} blue />
        <Stat label="This Week" value={ov.usersThisWeek || 0} />
        <Stat label="This Month" value={ov.usersThisMonth || 0} />
      </div>

      {/* Predictions */}
      <h2 className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
        Predictions
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Stat label="Total" value={ov.totalPredictions || 0} />
        <Stat label="Today" value={ov.predictionsToday || 0} blue />
        <Stat label="This Week" value={ov.predictionsThisWeek || 0} />
        <Stat label="Open" value={ov.openPositions || 0} />
      </div>

      {/* Other */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="Resolved" value={ov.resolvedPositions || 0} />
        <Stat label="Follows" value={ov.totalFollows || 0} />
        <Stat
          label="Positions"
          value={ov.totalPositions || 0}
        />
      </div>

      {/* Daily chart */}
      {daily.length > 0 && (
        <div className="card-glow p-5 mb-6">
          <h2 className="text-[14px] font-semibold text-zinc-900 mb-4">
            Signups (14 days)
          </h2>
          <div className="flex items-end gap-1 h-32">
            {daily.map((d) => (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center gap-1"
              >
                {d.count > 0 && (
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {d.count}
                  </span>
                )}
                <div
                  className="w-full rounded-t bg-blue-500"
                  style={{
                    height: `${Math.max((d.count / maxDaily) * 100, 3)}%`,
                  }}
                />
                <span className="text-[9px] text-zinc-400">
                  {d.date.slice(8)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent signups */}
        <div className="card-glow overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-100">
            <h2 className="text-[14px] font-semibold text-zinc-900">
              Recent Signups
            </h2>
          </div>
          {signups.map((u) => (
            <div
              key={u.username}
              className="px-4 py-2.5 flex items-center justify-between border-b border-zinc-50 last:border-0"
            >
              <div>
                <p className="text-[13px] font-medium text-zinc-900">
                  {u.username}
                </p>
                <p className="text-[11px] text-zinc-400">{u.email}</p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-medium text-zinc-700">
                  $
                  {(u.balance || 0).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {new Date(u.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
          {signups.length === 0 && (
            <p className="p-4 text-[13px] text-zinc-400">No signups yet</p>
          )}
        </div>

        {/* Top players */}
        <div className="card-glow overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-100">
            <h2 className="text-[14px] font-semibold text-zinc-900">
              Top Players
            </h2>
          </div>
          {top.map((u, i) => (
            <div
              key={u.username}
              className="px-4 py-2.5 flex items-center justify-between border-b border-zinc-50 last:border-0"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[13px] font-bold text-zinc-400 w-5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[13px] font-medium text-zinc-900">
                    {u.username}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    {u.totalPicks} picks &middot; {u.winRate}% win
                  </p>
                </div>
              </div>
              <span className="text-[13px] font-semibold text-green-600">
                $
                {(u.totalValue || 0).toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          ))}
          {top.length === 0 && (
            <p className="p-4 text-[13px] text-zinc-400">No players yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  blue,
}: {
  label: string;
  value: number;
  blue?: boolean;
}) {
  return (
    <div className="card-glow p-3.5">
      <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
        {label}
      </p>
      <p
        className={`text-xl font-bold mt-0.5 ${
          blue ? "text-blue-600" : "text-zinc-900"
        }`}
      >
        {(value || 0).toLocaleString()}
      </p>
    </div>
  );
}
