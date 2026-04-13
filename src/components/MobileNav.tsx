"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function MobileNav({ onClose }: { onClose: () => void }) {
  const { user, logout, openAuth } = useAuth();

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 lg:hidden"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
          <span className="text-[15px] font-bold text-zinc-900">Menu</span>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-1">
          <Link
            href="/"
            onClick={onClose}
            className="block rounded-lg px-3 py-2.5 text-[14px] font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Markets
          </Link>
          <Link
            href="/leaderboard"
            onClick={onClose}
            className="block rounded-lg px-3 py-2.5 text-[14px] font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Leaderboard
          </Link>
          {user && (
            <>
              <Link
                href="/portfolio"
                onClick={onClose}
                className="block rounded-lg px-3 py-2.5 text-[14px] font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Portfolio
              </Link>
              <Link
                href={`/profile/${user.username}`}
                onClick={onClose}
                className="block rounded-lg px-3 py-2.5 text-[14px] font-medium text-zinc-700 hover:bg-zinc-50"
              >
                My Profile
              </Link>
              <Link
                href="/daily"
                onClick={onClose}
                className="block rounded-lg px-3 py-2.5 text-[14px] font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Daily Challenge
              </Link>
            </>
          )}
        </div>

        {user ? (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-medium text-zinc-700">
                {user.username}
              </span>
              <span className="rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-[12px] font-semibold text-green-700">
                ${user.balance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>
            </div>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full rounded-lg border border-zinc-200 py-2 text-[13px] font-medium text-zinc-500 hover:bg-zinc-50"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-100 space-y-2">
            <button
              onClick={() => {
                openAuth("signup");
                onClose();
              }}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-[13px] font-semibold text-white hover:bg-blue-700"
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                openAuth("login");
                onClose();
              }}
              className="w-full rounded-lg border border-zinc-200 py-2.5 text-[13px] font-medium text-zinc-600 hover:bg-zinc-50"
            >
              Log In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
