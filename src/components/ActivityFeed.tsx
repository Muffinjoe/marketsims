"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface FeedItem {
  id: string;
  username: string;
  type: string;
  question: string;
  outcome: string;
  shares: number;
  price: number;
  createdAt: string;
}

export default function ActivityFeed() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/feed")
      .then((r) => r.json())
      .then((data) => {
        setFeed(data.feed || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-zinc-100" />
        ))}
      </div>
    );
  }

  if (feed.length === 0) {
    return (
      <div className="card-glow p-6 text-center">
        <p className="text-[13px] text-zinc-400">
          Follow players to see their picks here.
        </p>
      </div>
    );
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-2">
      {feed.map((item) => (
        <div key={item.id} className="card-glow p-3.5">
          <div className="flex items-start gap-2">
            <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] font-bold text-blue-600">
                {item.username[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-zinc-700">
                <Link
                  href={`/profile/${item.username}`}
                  className="font-semibold text-zinc-900 hover:underline"
                >
                  @{item.username}
                </Link>{" "}
                {item.type === "PICK" && (
                  <>
                    predicted{" "}
                    <span className="font-medium text-green-600">
                      {item.outcome}
                    </span>{" "}
                    on
                  </>
                )}
                {item.type === "CASH_OUT" && (
                  <>
                    cashed out{" "}
                    <span className="font-medium">{item.outcome}</span> on
                  </>
                )}
                {item.type === "MIRROR" && (
                  <>
                    used a pick on{" "}
                    <span className="font-medium">{item.outcome}</span> for
                  </>
                )}{" "}
                <span className="text-zinc-600">
                  &ldquo;{item.question?.slice(0, 60)}
                  {(item.question?.length || 0) > 60 ? "..." : ""}&rdquo;
                </span>
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {item.shares?.toFixed(1)} shares @ {((item.price || 0) * 100).toFixed(0)}
                &cent; &middot; {timeAgo(item.createdAt)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
