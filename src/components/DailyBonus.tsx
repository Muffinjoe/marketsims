"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthProvider";
import { pixelDailyBonus } from "@/lib/pixel";

const EMOJIS = ["🎉", "💰", "🤑", "✨", "🎊", "⭐", "🔥", "💎", "🏆", "🎯"];

interface Particle {
  id: number;
  emoji: string;
  x: number;
  delay: number;
  duration: number;
}

export default function DailyBonus() {
  const { user, refreshUser } = useAuth();
  const [state, setState] = useState<"checking" | "ready" | "spinning" | "won" | "claimed">("checking");
  const [amount, setAmount] = useState(0);
  const [label, setLabel] = useState("");
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!user) return;

    // Don't show daily bonus if user just signed up (within last 60 seconds)
    const joined = new Date(user.createdAt || 0).getTime();
    if (Date.now() - joined < 60000) {
      setState("claimed");
      return;
    }

    fetch("/api/login-bonus")
      .then((r) => r.json())
      .then((data) => {
        if (data.alreadyClaimed) {
          setState("claimed");
          setAmount(data.amount);
        } else {
          setState("ready");
        }
      })
      .catch(() => setState("claimed"));
  }, [user]);

  const claim = useCallback(async () => {
    setState("spinning");

    // Spin animation — build suspense
    await new Promise((r) => setTimeout(r, 3000));

    const res = await fetch("/api/login-bonus", { method: "POST" });
    const data = await res.json();

    if (data.alreadyClaimed) {
      setState("claimed");
      setAmount(data.amount);
      return;
    }

    setAmount(data.amount);
    setLabel(data.label);
    setState("won");
    pixelDailyBonus();
    refreshUser();

    // Launch celebration particles
    const newParticles: Particle[] = Array.from({ length: 35 }, (_, i) => ({
      id: i,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 2.5 + Math.random() * 2,
    }));
    setParticles(newParticles);

    setTimeout(() => setParticles([]), 6000);
  }, [refreshUser]);

  if (!user || state === "claimed" || state === "checking") return null;

  return (
    <>
      {/* Celebration particles */}
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute text-2xl animate-bounce"
              style={{
                left: `${p.x}%`,
                top: "-20px",
                animation: `fall ${p.duration}s ease-in ${p.delay}s forwards`,
              }}
            >
              {p.emoji}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center">
          {state === "ready" && (
            <>
              <div className="text-5xl mb-4">🎁</div>
              <h2 className="text-xl font-bold text-zinc-900">
                Daily Bonus!
              </h2>
              <p className="mt-2 text-[13px] text-zinc-500">
                Claim your free virtual cash for logging in today
              </p>
              <button
                onClick={claim}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 text-[15px] font-bold text-white hover:from-blue-700 hover:to-purple-700 transition shadow-lg shadow-blue-600/20"
              >
                Open Bonus
              </button>
            </>
          )}

          {state === "spinning" && (
            <>
              <div className="text-5xl mb-4 animate-bounce">🎰</div>
              <h2 className="text-xl font-bold text-zinc-900">
                Rolling...
              </h2>
              <div className="mt-4 flex justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-16 w-16 rounded-xl bg-gradient-to-b from-zinc-100 to-zinc-200 flex items-center justify-center overflow-hidden"
                  >
                    <div
                      className="text-2xl"
                      style={{
                        animation: `slot ${0.1 + i * 0.05}s ease-in-out infinite`,
                      }}
                    >
                      💰
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {state === "won" && (
            <>
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-xl font-bold text-zinc-900">
                You won!
              </h2>
              <p className="mt-3 text-4xl font-black text-green-600">
                +{label || `$${amount}`}
              </p>
              <p className="mt-2 text-[13px] text-zinc-500">
                Added to your virtual balance
              </p>
              <button
                onClick={() => setState("claimed")}
                className="mt-5 w-full rounded-xl bg-green-500 py-3 text-[14px] font-bold text-white hover:bg-green-600 transition"
              >
                Collect & Play
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes slot {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </>
  );
}
