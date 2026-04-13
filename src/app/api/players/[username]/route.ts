import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      username: true,
      balance: true,
      createdAt: true,
      positions: {
        orderBy: { updatedAt: "desc" },
      },
      followers: true,
      following: true,
    },
  });

  if (!user) {
    return Response.json({ error: "Player not found" }, { status: 404 });
  }

  const allPositions = user.positions;
  const resolved = allPositions.filter((p) => p.resolved);
  const wins = resolved.filter((p) => p.won);
  const active = allPositions.filter((p) => !p.resolved);
  const invested = active.reduce((s, p) => s + p.shares * p.avgPrice, 0);

  // Calculate streak
  let streak = 0;
  const sortedResolved = resolved.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  for (const p of sortedResolved) {
    if (p.won) streak++;
    else break;
  }

  return Response.json({
    username: user.username,
    joinedAt: user.createdAt,
    stats: {
      totalValue: user.balance + invested,
      totalPicks: allPositions.length,
      winRate:
        resolved.length > 0
          ? Math.round((wins.length / resolved.length) * 100)
          : 0,
      activePicks: active.length,
      streak,
    },
    activePicks: active.map((p) => ({
      id: p.id,
      conditionId: p.conditionId,
      marketSlug: p.marketSlug,
      question: p.question,
      outcome: p.outcome,
      shares: p.shares,
      avgPrice: p.avgPrice,
    })),
    settledPicks: resolved.slice(0, 20).map((p) => ({
      id: p.id,
      question: p.question,
      outcome: p.outcome,
      shares: p.shares,
      avgPrice: p.avgPrice,
      won: p.won,
    })),
    followersCount: user.followers.length,
    followingCount: user.following.length,
  });
}
