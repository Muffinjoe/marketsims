import { prisma } from "@/lib/db";
import { sendDigestEmail } from "@/lib/email";

export async function GET() {
  // Find all positions resolved in the last 3 days that haven't been emailed
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  const resolvedPositions = await prisma.position.findMany({
    where: {
      resolved: true,
      updatedAt: { gte: threeDaysAgo },
    },
    include: {
      user: { select: { id: true, email: true, username: true } },
    },
  });

  if (resolvedPositions.length === 0) {
    return Response.json({ sent: 0 });
  }

  // Group by user
  const byUser = new Map<
    string,
    {
      email: string;
      username: string;
      results: { question: string; outcome: string; shares: number; won: boolean; payout: number }[];
    }
  >();

  for (const pos of resolvedPositions) {
    const existing = byUser.get(pos.userId);
    const result = {
      question: pos.question,
      outcome: pos.outcome,
      shares: pos.shares,
      won: pos.won ?? false,
      payout: pos.won ? pos.shares : 0,
    };

    if (existing) {
      existing.results.push(result);
    } else {
      byUser.set(pos.userId, {
        email: pos.user.email,
        username: pos.user.username,
        results: [result],
      });
    }
  }

  // Check which users already got a digest recently
  const recentDigests = await prisma.transaction.findMany({
    where: {
      type: "DIGEST_SENT",
      createdAt: { gte: threeDaysAgo },
    },
    select: { userId: true },
  });
  const recentlyEmailed = new Set(recentDigests.map((t) => t.userId));

  let sent = 0;
  for (const [userId, data] of byUser) {
    if (recentlyEmailed.has(userId)) continue;

    await sendDigestEmail({
      to: data.email,
      username: data.username,
      results: data.results,
    });

    // Mark digest as sent
    await prisma.transaction.create({
      data: {
        userId,
        type: "DIGEST_SENT",
        amount: 0,
      },
    });

    sent++;
  }

  return Response.json({ sent });
}
