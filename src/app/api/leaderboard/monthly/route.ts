import { prisma } from "@/lib/db";

export async function GET() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const monthName = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Get all users who made picks this month
  const activities = await prisma.activity.findMany({
    where: {
      type: "PICK",
      createdAt: { gte: startOfMonth, lte: endOfMonth },
    },
    select: { userId: true },
  });

  const activeUserIds = [...new Set(activities.map((a) => a.userId))];

  if (activeUserIds.length === 0) {
    return Response.json({ month: monthName, leaderboard: [], prizes: [] });
  }

  // Get user data for active players
  const users = await prisma.user.findMany({
    where: { id: { in: activeUserIds } },
    select: {
      id: true,
      username: true,
      balance: true,
      positions: {
        select: { shares: true, avgPrice: true, resolved: true, won: true },
      },
      activities: {
        where: {
          type: "PICK",
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
        select: { id: true },
      },
    },
  });

  const leaderboard = users
    .map((u) => {
      const invested = u.positions
        .filter((p) => !p.resolved)
        .reduce((s, p) => s + p.shares * p.avgPrice, 0);
      const resolved = u.positions.filter((p) => p.resolved);
      const wins = resolved.filter((p) => p.won);

      return {
        username: u.username,
        totalValue: u.balance + invested,
        monthlyPicks: u.activities.length,
        winRate:
          resolved.length > 0
            ? Math.round((wins.length / resolved.length) * 100)
            : 0,
      };
    })
    .sort((a, b) => b.totalValue - a.totalValue);

  const daysLeft = Math.ceil(
    (endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const prizes = [
    { place: 1, label: "1st Place", reward: "$25,000 virtual cash", emoji: "🥇" },
    { place: 2, label: "2nd Place", reward: "$15,000 virtual cash", emoji: "🥈" },
    { place: 3, label: "3rd Place", reward: "$10,000 virtual cash", emoji: "🥉" },
    { place: 4, label: "4th–10th", reward: "$5,000 virtual cash", emoji: "🏅" },
  ];

  return Response.json({
    month: monthName,
    daysLeft,
    leaderboard: leaderboard.slice(0, 50),
    prizes,
  });
}
