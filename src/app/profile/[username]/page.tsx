"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FollowButton from "@/components/FollowButton";
import UsePickButton from "@/components/UsePickButton";
import ShareButton from "@/components/ShareButton";
import { computeAchievements, type Achievement } from "@/lib/achievements";

interface ProfileData {
  username: string;
  joinedAt: string;
  stats: {
    totalValue: number;
    totalPicks: number;
    winRate: number;
    activePicks: number;
    streak: number;
  };
  activePicks: {
    id: string;
    conditionId: string;
    marketSlug: string;
    question: string;
    outcome: string;
    shares: number;
    avgPrice: number;
  }[];
  settledPicks: {
    id: string;
    question: string;
    outcome: string;
    shares: number;
    avgPrice: number;
    won: boolean;
  }[];
  followersCount: number;
  followingCount: number;
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/players/${username}`).then((r) => r.json()),
      fetch(`/api/follow?username=${username}`).then((r) => r.json()),
    ]).then(([profileData, followData]) => {
      if (profileData.error) {
        setProfile(null);
      } else {
        setProfile(profileData);
      }
      setIsFollowing(followData.isFollowing || false);
      setLoading(false);
    });
  }, [username]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="h-40 animate-pulse rounded-xl bg-zinc-100" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-zinc-900">Player not found</h2>
      </div>
    );
  }

  const { stats } = profile;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Profile header */}
      <div className="card-glow p-5 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl font-bold text-blue-600">
                {profile.username[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900">
                @{profile.username}
              </h1>
              <p className="text-[12px] text-zinc-400 mt-0.5">
                Joined{" "}
                {new Date(profile.joinedAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <div className="flex items-center gap-3 mt-1 text-[12px]">
                <span className="text-zinc-500">
                  <strong className="text-zinc-900">
                    {profile.followersCount}
                  </strong>{" "}
                  followers
                </span>
                <span className="text-zinc-500">
                  <strong className="text-zinc-900">
                    {profile.followingCount}
                  </strong>{" "}
                  following
                </span>
              </div>
            </div>
          </div>
          <FollowButton
            username={profile.username}
            initialFollowing={isFollowing}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="card-glow p-3.5 text-center">
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
            Value
          </p>
          <p className="text-lg font-bold text-zinc-900 mt-0.5">
            ${stats.totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="card-glow p-3.5 text-center">
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
            Win Rate
          </p>
          <p className="text-lg font-bold text-green-600 mt-0.5">
            {stats.winRate}%
          </p>
        </div>
        <div className="card-glow p-3.5 text-center">
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
            Streak
          </p>
          <p className="text-lg font-bold text-zinc-900 mt-0.5">
            {stats.streak > 0 ? `${stats.streak}W` : "0"}
          </p>
        </div>
        <div className="card-glow p-3.5 text-center">
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
            Predictions
          </p>
          <p className="text-lg font-bold text-zinc-900 mt-0.5">
            {stats.totalPicks}
          </p>
        </div>
      </div>

      {/* Achievements */}
      <AchievementsBadges stats={stats} followersCount={profile.followersCount} />

      {/* Active picks */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-semibold text-zinc-900">
            Active Picks ({stats.activePicks})
          </h2>
          <ShareButton
            text={`Check out @${profile.username}'s predictions on MarketSims — ${stats.winRate}% win rate!`}
            compact
          />
        </div>
        {profile.activePicks.length === 0 ? (
          <div className="card-glow p-6 text-center">
            <p className="text-[13px] text-zinc-400">No active picks</p>
          </div>
        ) : (
          <div className="space-y-2">
            {profile.activePicks.map((p) => (
              <div
                key={p.id}
                className="card-glow p-4 flex items-center justify-between"
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
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-[13px] font-semibold text-green-600">
                    {p.outcome}
                  </span>
                  <UsePickButton
                    username={profile.username}
                    conditionId={p.conditionId}
                    outcome={p.outcome}
                    question={p.question}
                    shares={p.shares}
                    avgPrice={p.avgPrice}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settled picks */}
      {profile.settledPicks.length > 0 && (
        <div>
          <h2 className="text-[15px] font-semibold text-zinc-900 mb-3">
            Settled
          </h2>
          <div className="space-y-2">
            {profile.settledPicks.map((p) => (
              <div
                key={p.id}
                className={`card-glow p-4 flex items-center justify-between ${
                  p.won ? "!border-green-200" : "!border-red-200"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-zinc-900 line-clamp-1">
                    {p.question}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {p.shares.toFixed(1)} {p.outcome} shares
                  </p>
                </div>
                <span
                  className={`text-[13px] font-bold shrink-0 ml-3 ${
                    p.won ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {p.won ? "Won" : "Lost"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AchievementsBadges({
  stats,
  followersCount,
}: {
  stats: ProfileData["stats"];
  followersCount: number;
}) {
  const achievements = computeAchievements({
    ...stats,
    followersCount,
  });
  const earned = achievements.filter((a) => a.earned);
  const locked = achievements.filter((a) => !a.earned);

  return (
    <div className="mb-6">
      <h2 className="text-[15px] font-semibold text-zinc-900 mb-3">
        Achievements ({earned.length}/{achievements.length})
      </h2>
      <div className="flex flex-wrap gap-2">
        {earned.map((a) => (
          <div
            key={a.id}
            className="card-glow px-3 py-2 flex items-center gap-2"
            title={a.description}
          >
            <span className="text-base">{a.icon}</span>
            <span className="text-[12px] font-semibold text-zinc-900">
              {a.name}
            </span>
          </div>
        ))}
        {locked.slice(0, 4).map((a) => (
          <div
            key={a.id}
            className="rounded-xl border border-dashed border-zinc-200 px-3 py-2 flex items-center gap-2 opacity-40"
            title={a.description}
          >
            <span className="text-base grayscale">{a.icon}</span>
            <span className="text-[12px] font-medium text-zinc-400">
              {a.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
