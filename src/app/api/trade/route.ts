import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { conditionId, marketSlug, question, outcome, shares, price, side } =
    await req.json();

  if (!conditionId || !outcome || !shares || !price || !side) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  if (side === "BUY") {
    const cost = shares * price;
    if (cost > user.balance) {
      return Response.json({ error: "Insufficient balance" }, { status: 400 });
    }

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
          marketSlug: marketSlug || "",
          question: question || "",
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
        marketSlug,
        question,
        outcome,
        shares,
        price,
      },
    });

    // Record activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "PICK",
        conditionId,
        marketSlug,
        question,
        outcome,
        shares,
        price,
      },
    });

    const updated = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true },
    });

    return Response.json({ ok: true, balance: updated?.balance });
  }

  if (side === "SELL") {
    const position = await prisma.position.findUnique({
      where: {
        userId_conditionId_outcome: {
          userId: user.id,
          conditionId,
          outcome,
        },
      },
    });

    if (!position || position.shares < shares) {
      return Response.json(
        { error: "Insufficient shares" },
        { status: 400 }
      );
    }

    const proceeds = shares * price;

    // Add balance
    await prisma.user.update({
      where: { id: user.id },
      data: { balance: { increment: proceeds } },
    });

    // Update position
    const remaining = position.shares - shares;
    if (remaining <= 0.001) {
      await prisma.position.delete({ where: { id: position.id } });
    } else {
      await prisma.position.update({
        where: { id: position.id },
        data: { shares: remaining },
      });
    }

    // Record transaction
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "SELL",
        amount: proceeds,
        conditionId,
        marketSlug,
        question,
        outcome,
        shares,
        price,
      },
    });

    // Record activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "CASH_OUT",
        conditionId,
        marketSlug,
        question,
        outcome,
        shares,
        price,
      },
    });

    const updated = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true },
    });

    return Response.json({ ok: true, balance: updated?.balance });
  }

  return Response.json({ error: "Invalid side" }, { status: 400 });
}
