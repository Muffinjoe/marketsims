import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const follows = await prisma.follow.findMany({
    where: { followerId: session.userId },
    include: {
      following: {
        select: {
          username: true,
          balance: true,
          positions: {
            select: { shares: true, avgPrice: true, resolved: true, won: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const players = follows.map((f) => {
    const u = f.following;
    const resolved = u.positions.filter((p) => p.resolved);
    const wins = resolved.filter((p) => p.won);
    const invested = u.positions
      .filter((p) => !p.resolved)
      .reduce((sum, p) => sum + p.shares * p.avgPrice, 0);
    return {
      username: u.username,
      totalValue: u.balance + invested,
      activePicks: u.positions.filter((p) => !p.resolved).length,
      winRate: resolved.length > 0 ? Math.round((wins.length / resolved.length) * 100) : 0,
    };
  });

  return Response.json({ players });
}
