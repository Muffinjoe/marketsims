"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-100 mt-12">
      <div className="mx-auto max-w-[1400px] px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="MarketSims" className="h-6 w-6" />
              <span className="text-[14px] font-bold text-zinc-900">
                MarketSims
              </span>
            </div>
            <p className="mt-2 text-[12px] text-zinc-400 max-w-xs">
              A prediction game using virtual money. Real data from
              Polymarket, zero financial risk.
            </p>
          </div>

          <div className="flex gap-8">
            <div>
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Platform
              </p>
              <div className="flex flex-col gap-1.5">
                <Link
                  href="/"
                  className="text-[13px] text-zinc-500 hover:text-zinc-800"
                >
                  Markets
                </Link>
                <Link
                  href="/leaderboard"
                  className="text-[13px] text-zinc-500 hover:text-zinc-800"
                >
                  Leaderboard
                </Link>
                <Link
                  href="/portfolio"
                  className="text-[13px] text-zinc-500 hover:text-zinc-800"
                >
                  Portfolio
                </Link>
                <Link
                  href="/daily"
                  className="text-[13px] text-zinc-500 hover:text-zinc-800"
                >
                  Daily Challenge
                </Link>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Resources
              </p>
              <div className="flex flex-col gap-1.5">
                <a
                  href="https://polymarket.com?via=BHSpWG9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-zinc-500 hover:text-zinc-800"
                >
                  Polymarket
                </a>
                <a
                  href="https://polymarket.com?via=BHSpWG9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-zinc-500 hover:text-zinc-800"
                >
                  View Polymarket
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-50 flex items-center justify-between">
          <p className="text-[11px] text-zinc-400">
            &copy; {new Date().getFullYear()} MarketSims. Not affiliated with
            Polymarket.
          </p>
          <p className="text-[11px] text-zinc-400">
            No real money involved. For entertainment purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
