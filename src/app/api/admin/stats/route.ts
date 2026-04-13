import { prisma } from "@/lib/db";

const ADMIN_PASSWORD = "Lampost12!";

export async function POST(req: Request) {
  const { password } = await req.json();
  if (password !== ADMIN_PASSWORD) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const today = new Date(now.toISOString().slice(0, 10) + "T00:00:00Z");
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const monthAgo = new Date(Date.now() - 30 * 86400000);

  // Run queries sequentially to avoid connection pool exhaustion
  const totalUsers = await prisma.user.count();
  const usersToday = await prisma.user.count({ where: { createdAt: { gte: today } } });
  const usersThisWeek = await prisma.user.count({ where: { createdAt: { gte: weekAgo } } });
  const usersThisMonth = await prisma.user.count({ where: { createdAt: { gte: monthAgo } } });

  const totalPredictions = await prisma.activity.count({ where: { type: "PICK" } });
  const predictionsToday = await prisma.activity.count({ where: { type: "PICK", createdAt: { gte: today } } });
  const predictionsThisWeek = await prisma.activity.count({ where: { type: "PICK", createdAt: { gte: weekAgo } } });

  const totalPositions = await prisma.position.count();
  const resolvedPositions = await prisma.position.count({ where: { resolved: true } });
  const totalFollows = await prisma.follow.count();

  const recentSignups = await prisma.user.findMany({
    select: { username: true, email: true, balance: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const topUsers = await prisma.user.findMany({
    select: {
      username: true,
      balance: true,
      positions: {
        select: { shares: true, avgPrice: true, resolved: true, won: true },
      },
    },
    orderBy: { balance: "desc" },
    take: 10,
  });

  const recentUsers = await prisma.user.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 14 * 86400000) } },
    select: { createdAt: true },
  });

  // Aggregate daily signups
  const dailyMap = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    dailyMap.set(d, 0);
  }
  for (const u of recentUsers) {
    const d = u.createdAt.toISOString().slice(0, 10);
    dailyMap.set(d, (dailyMap.get(d) || 0) + 1);
  }

  const topUsersFormatted = topUsers.map((u) => {
    const invested = u.positions
      .filter((p) => !p.resolved)
      .reduce((s, p) => s + p.shares * p.avgPrice, 0);
    const resolved = u.positions.filter((p) => p.resolved);
    const wins = resolved.filter((p) => p.won);
    return {
      username: u.username,
      totalValue: u.balance + invested,
      winRate: resolved.length > 0 ? Math.round((wins.length / resolved.length) * 100) : 0,
      totalPicks: u.positions.length,
    };
  });

  return Response.json({
    overview: {
      totalUsers,
      usersToday,
      usersThisWeek,
      usersThisMonth,
      totalPredictions,
      predictionsToday,
      predictionsThisWeek,
      totalPositions,
      resolvedPositions,
      openPositions: totalPositions - resolvedPositions,
      totalFollows,
    },
    recentSignups,
    topUsers: topUsersFormatted,
    dailySignups: Array.from(dailyMap.entries()).map(([date, count]) => ({
      date,
      count,
    })),
  });
}
