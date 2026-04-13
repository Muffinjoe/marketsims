"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Player {
  username: string;
  totalValue: number;
  activePicks: number;
  winRate: number;
}

export default function FollowedPlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/follow/list")
      .then((r) => r.json())
      .then((data) => {
        setPlayers(data.players || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 w-44 shrink-0 animate-pulse rounded-xl bg-zinc-100"
          />
        ))}
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="card-glow p-6 text-center">
        <p className="text-[13px] text-zinc-400">
          You&apos;re not following anyone yet.{" "}
          <Link
            href="/leaderboard"
            className="font-medium text-blue-600 hover:underline"
          >
            Find top players
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
      {players.map((p) => (
        <Link
          key={p.username}
          href={`/profile/${p.username}`}
          className="card-glow p-3.5 shrink-0 w-44 hover:border-blue-200 transition"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-blue-600">
                {p.username[0].toUpperCase()}
              </span>
            </div>
            <span className="text-[13px] font-semibold text-zinc-900 truncate">
              {p.username}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Win rate</span>
            <span className="font-semibold text-green-600">{p.winRate}%</span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-0.5">
            <span className="text-zinc-400">Active picks</span>
            <span className="font-medium text-zinc-700">{p.activePicks}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
