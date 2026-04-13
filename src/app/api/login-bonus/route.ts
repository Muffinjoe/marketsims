import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const BONUS_TIERS = [
  { amount: 100, weight: 30, label: "$100" },
  { amount: 250, weight: 25, label: "$250" },
  { amount: 500, weight: 20, label: "$500" },
  { amount: 750, weight: 12, label: "$750" },
  { amount: 1000, weight: 8, label: "$1,000" },
  { amount: 2500, weight: 4, label: "$2,500" },
  { amount: 5000, weight: 1, label: "$5,000" },
];

function pickBonus() {
  const totalWeight = BONUS_TIERS.reduce((s, t) => s + t.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const tier of BONUS_TIERS) {
    roll -= tier.weight;
    if (roll <= 0) return tier;
  }
  return BONUS_TIERS[0];
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);

  // Check if already claimed today
  const startOfDay = new Date(today + "T00:00:00Z");
  const endOfDay = new Date(today + "T23:59:59Z");
  const existing = await prisma.transaction.findFirst({
    where: {
      userId: session.userId,
      type: "LOGIN_BONUS",
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
  });

  if (existing) {
    return Response.json({
      alreadyClaimed: true,
      amount: existing.amount,
    });
  }

  return Response.json({ alreadyClaimed: false });
}

export async function POST() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);

  // Check if already claimed today
  const startOfDay = new Date(today + "T00:00:00Z");
  const endOfDay = new Date(today + "T23:59:59Z");
  const existing = await prisma.transaction.findFirst({
    where: {
      userId: session.userId,
      type: "LOGIN_BONUS",
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
  });

  if (existing) {
    return Response.json({
      alreadyClaimed: true,
      amount: existing.amount,
    });
  }

  const bonus = pickBonus();

  await prisma.user.update({
    where: { id: session.userId },
    data: { balance: { increment: bonus.amount } },
  });

  await prisma.transaction.create({
    data: {
      userId: session.userId,
      type: "LOGIN_BONUS",
      amount: bonus.amount,
    },
  });

  return Response.json({
    alreadyClaimed: false,
    amount: bonus.amount,
    label: bonus.label,
  });
}
