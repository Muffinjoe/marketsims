"use client";

import { pixelShare } from "@/lib/pixel";

export default function ShareButton({
  text,
  compact,
}: {
  text: string;
  compact?: boolean;
}) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${text}\n\nMake your own predictions at MarketSims.com`;

  const shareToX = () => {
    pixelShare();
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "width=550,height=420"
    );
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${text} — ${url}`);
  };

  if (compact) {
    return (
      <button
        onClick={shareToX}
        className="rounded-md bg-zinc-100 p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 transition"
        title="Share on X"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="flex gap-1.5">
      <button
        onClick={shareToX}
        className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-zinc-800 transition"
      >
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share
      </button>
      <button
        onClick={copyLink}
        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-[11px] font-semibold text-zinc-500 hover:bg-zinc-50 transition"
      >
        Copy link
      </button>
    </div>
  );
}
