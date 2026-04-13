"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

export default function FollowButton({
  username,
  initialFollowing,
}: {
  username: string;
  initialFollowing: boolean;
}) {
  const { user, openAuth } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(false);

  const isOwnProfile = user?.username === username;

  if (isOwnProfile) return null;

  const handleClick = async () => {
    if (!user) {
      openAuth("signup");
      return;
    }

    setLoading(true);
    if (following) {
      await fetch("/api/follow", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      setFollowing(false);
    } else {
      await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      setFollowing(true);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={loading}
      className={`rounded-lg px-4 py-1.5 text-[13px] font-semibold transition ${
        following
          ? hover
            ? "bg-red-50 border border-red-200 text-red-600"
            : "bg-zinc-100 border border-zinc-200 text-zinc-700"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      {following ? (hover ? "Unfollow" : "Following") : "Follow"}
    </button>
  );
}
