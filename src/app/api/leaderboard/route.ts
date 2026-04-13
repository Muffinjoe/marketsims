import { prisma } from "@/lib/db";

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      username: true,
      balance: true,
      createdAt: true,
      positions: {
        select: { shares: true, avgPrice: true },
      },
    },
    orderBy: { balance: "desc" },
    take: 50,
  });

  const leaderboard = users.map((u) => {
    const invested = u.positions.reduce(
      (sum, p) => sum + p.shares * p.avgPrice,
      0
    );
    return {
      username: u.username,
      balance: u.balance,
      invested,
      totalValue: u.balance + invested,
      joinedAt: u.createdAt,
    };
  });

  leaderboard.sort((a, b) => b.totalValue - a.totalValue);

  return Response.json({ leaderboard });
}
