import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get IDs of users we follow
  const follows = await prisma.follow.findMany({
    where: { followerId: session.userId },
    select: { followingId: true },
  });

  const followingIds = follows.map((f) => f.followingId);
  if (followingIds.length === 0) {
    return Response.json({ feed: [] });
  }

  const activities = await prisma.activity.findMany({
    where: { userId: { in: followingIds } },
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return Response.json({
    feed: activities.map((a) => ({
      id: a.id,
      username: a.user.username,
      type: a.type,
      question: a.question,
      outcome: a.outcome,
      shares: a.shares,
      price: a.price,
      conditionId: a.conditionId,
      marketSlug: a.marketSlug,
      createdAt: a.createdAt,
    })),
  });
}
