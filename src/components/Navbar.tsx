"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import MobileNav from "./MobileNav";
import { useState } from "react";

export default function Navbar() {
  const { user, logout, openAuth } = useAuth();
  const [navSearch, setNavSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-4">
          <div className="flex h-[52px] items-center gap-4">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img src="/logo.png" alt="MarketSims" className="h-7 w-7" />
              <span className="text-[15px] font-bold text-zinc-900 hidden sm:block">
                MarketSims
              </span>
            </Link>

            <div className="flex-1 hidden md:block" />

            <div className="flex-1 md:w-full md:max-w-md md:flex-none">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (navSearch.trim()) {
                    router.push(`/?q=${encodeURIComponent(navSearch.trim())}`);
                  } else {
                    router.push("/");
                  }
                }}
              >
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={navSearch}
                    onChange={(e) => setNavSearch(e.target.value)}
                    placeholder="Search"
                    className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-[7px] pl-9 pr-4 text-[13px] text-zinc-600 placeholder:text-zinc-400 focus:border-zinc-300 focus:bg-white focus:outline-none"
                  />
                </div>
              </form>
            </div>

            <div className="hidden md:flex flex-1" />

            <div className="hidden md:flex items-center gap-3">
              {user && (
                <Link
                  href="/daily"
                  className="text-[13px] text-zinc-500 hover:text-zinc-800 font-medium"
                >
                  Daily
                </Link>
              )}
              {user && (
                <Link
                  href="/portfolio"
                  className="text-[13px] text-zinc-500 hover:text-zinc-800 font-medium"
                >
                  Portfolio
                </Link>
              )}
              <Link
                href="/leaderboard"
                className="text-[13px] text-zinc-500 hover:text-zinc-800 font-medium"
              >
                Leaderboard
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3 shrink-0">
              {user ? (
                <>
                  <span className="rounded-full bg-green-50 border border-green-200 px-3 py-1 text-[13px] font-semibold text-green-700">
                    ${user.balance.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <Link
                    href={`/profile/${user.username}`}
                    className="text-[13px] text-zinc-500 hover:text-zinc-800 font-medium"
                  >
                    {user.username}
                  </Link>
                  <button
                    onClick={logout}
                    className="text-[13px] text-zinc-400 hover:text-zinc-600"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openAuth("login")}
                    className="text-[13px] text-zinc-600 hover:text-zinc-900 font-medium"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => openAuth("signup")}
                    className="rounded-lg bg-blue-600 px-4 py-[6px] text-[13px] font-semibold text-white hover:bg-blue-700 transition"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-zinc-500 hover:text-zinc-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
      {mobileOpen && <MobileNav onClose={() => setMobileOpen(false)} />}
    </>
  );
}
