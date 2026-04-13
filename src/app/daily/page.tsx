"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

interface DailyData {
  streak: number;
  todayPicks: number;
  target: number;
  completed: boolean;
}

export default function DailyChallengePage() {
  const { user, openAuth } = useAuth();
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetch("/api/daily")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-zinc-900">Daily Challenge</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Sign up to start your prediction streak.
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

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="h-60 animate-pulse rounded-xl bg-zinc-100" />
      </div>
    );
  }

  const progress = Math.min(data.todayPicks / data.target, 1);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold text-zinc-900">Daily Challenge</h1>
      <p className="text-sm text-zinc-500 mt-1">
        Make {data.target} predictions every day to build your streak and earn
        bonus virtual cash.
      </p>

      {/* Streak card */}
      <div className="card-glow p-6 mt-5 text-center">
        <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
          Current Streak
        </p>
        <p className="text-5xl font-bold text-zinc-900 mt-1">
          {data.streak}
          <span className="text-2xl ml-1">
            {data.streak > 0 ? "🔥" : ""}
          </span>
        </p>
        <p className="text-[12px] text-zinc-400 mt-1">
          {data.streak === 0
            ? "Start your streak today!"
            : `${data.streak} day${data.streak === 1 ? "" : "s"} in a row`}
        </p>
      </div>

      {/* Today's progress */}
      <div className="card-glow p-5 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-semibold text-zinc-900">
            Today&apos;s Challenge
          </h3>
          {data.completed && (
            <span className="rounded-full bg-green-100 border border-green-200 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
              Completed!
            </span>
          )}
        </div>

        <p className="text-[13px] text-zinc-600 mb-3">
          Make {data.target} predictions today
        </p>

        {/* Progress bar */}
        <div className="h-3 rounded-full bg-zinc-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              data.completed ? "bg-green-500" : "bg-blue-500"
            }`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="mt-2 text-[12px] text-zinc-400">
          {data.todayPicks} / {data.target} predictions
        </p>

        {!data.completed && (
          <Link
            href="/"
            className="mt-4 inline-flex items-center rounded-xl bg-blue-600 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-blue-700 transition"
          >
            Browse markets to predict
          </Link>
        )}

        {data.completed && (
          <p className="mt-3 text-[13px] text-green-600 font-medium">
            +$500 bonus earned today! Come back tomorrow to keep your streak.
          </p>
        )}
      </div>

      {/* Rewards info */}
      <div className="card-glow p-5 mt-4">
        <h3 className="text-[14px] font-semibold text-zinc-900 mb-3">
          Streak Rewards
        </h3>
        <div className="space-y-2 text-[13px]">
          <div className="flex justify-between text-zinc-600">
            <span>Complete daily challenge</span>
            <span className="font-semibold text-green-600">+$500</span>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Bonus per streak day</span>
            <span className="font-semibold text-green-600">+$500</span>
          </div>
          <div className="flex justify-between text-zinc-500 pt-2 border-t border-zinc-100">
            <span>7-day streak total</span>
            <span className="font-bold text-green-600">+$3,500</span>
          </div>
        </div>
      </div>
    </div>
  );
}
