import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { username, conditionId, outcome, amount } = await req.json();

  if (!username || !conditionId || !outcome || !amount) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  // Verify source player holds this position
  const sourceUser = await prisma.user.findUnique({ where: { username } });
  if (!sourceUser) {
    return Response.json({ error: "Player not found" }, { status: 404 });
  }

  const sourcePosition = await prisma.position.findUnique({
    where: {
      userId_conditionId_outcome: {
        userId: sourceUser.id,
        conditionId,
        outcome,
      },
    },
  });

  if (!sourcePosition) {
    return Response.json(
      { error: "This player no longer holds this pick" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const price = sourcePosition.avgPrice;
  const cost = Number(amount);
  if (cost > user.balance) {
    return Response.json({ error: "Insufficient balance" }, { status: 400 });
  }

  const shares = cost / price;

  // Deduct balance
  await prisma.user.update({
    where: { id: user.id },
    data: { balance: { decrement: cost } },
  });

  // Upsert position
  const existing = await prisma.position.findUnique({
    where: {
      userId_conditionId_outcome: {
        userId: user.id,
        conditionId,
        outcome,
      },
    },
  });

  if (existing) {
    const totalShares = existing.shares + shares;
    const totalCost = existing.shares * existing.avgPrice + shares * price;
    await prisma.position.update({
      where: { id: existing.id },
      data: {
        shares: totalShares,
        avgPrice: totalCost / totalShares,
      },
    });
  } else {
    await prisma.position.create({
      data: {
        userId: user.id,
        conditionId,
        marketSlug: sourcePosition.marketSlug,
        question: sourcePosition.question,
        outcome,
        shares,
        avgPrice: price,
      },
    });
  }

  // Record transaction
  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: "BUY",
      amount: -cost,
      conditionId,
      marketSlug: sourcePosition.marketSlug,
      question: sourcePosition.question,
      outcome,
      shares,
      price,
    },
  });

  // Record activity
  await prisma.activity.create({
    data: {
      userId: user.id,
      type: "MIRROR",
      conditionId,
      marketSlug: sourcePosition.marketSlug,
      question: sourcePosition.question,
      outcome,
      shares,
      price,
      sourceUserId: sourceUser.id,
    },
  });

  const updated = await prisma.user.findUnique({
    where: { id: user.id },
    select: { balance: true },
  });

  return Response.json({ ok: true, balance: updated?.balance });
}
