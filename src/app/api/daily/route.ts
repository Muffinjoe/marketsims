import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { streak: true, lastPickDate: true },
  });

  // Count today's predictions
  const startOfDay = new Date(today + "T00:00:00Z");
  const endOfDay = new Date(today + "T23:59:59Z");
  const todayPicks = await prisma.activity.count({
    where: {
      userId: session.userId,
      type: "PICK",
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
  });

  const target = 3; // 3 predictions per day
  const completed = todayPicks >= target;
  const isActiveToday = user?.lastPickDate === today;

  return Response.json({
    streak: user?.streak || 0,
    todayPicks,
    target,
    completed,
    isActiveToday,
  });
}

// Called after a prediction to update streak
export async function POST() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { streak: true, lastPickDate: true },
  });

  if (!user) return Response.json({ error: "Not found" }, { status: 404 });

  // Count today's predictions
  const startOfDay = new Date(today + "T00:00:00Z");
  const endOfDay = new Date(today + "T23:59:59Z");
  const todayPicks = await prisma.activity.count({
    where: {
      userId: session.userId,
      type: "PICK",
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
  });

  const target = 3;
  if (todayPicks < target) {
    return Response.json({ streak: user.streak, todayPicks, target, completed: false });
  }

  // Challenge completed — update streak
  if (user.lastPickDate === today) {
    // Already counted today
    return Response.json({ streak: user.streak, todayPicks, target, completed: true });
  }

  let newStreak = 1;
  if (user.lastPickDate === yesterday) {
    newStreak = user.streak + 1;
  }

  // Bonus: $500 per streak day completed
  const bonus = 500;
  await prisma.user.update({
    where: { id: session.userId },
    data: {
      streak: newStreak,
      lastPickDate: today,
      balance: { increment: bonus },
    },
  });

  await prisma.transaction.create({
    data: {
      userId: session.userId,
      type: "DAILY_BONUS",
      amount: bonus,
    },
  });

  return Response.json({
    streak: newStreak,
    todayPicks,
    target,
    completed: true,
    bonus,
  });
}
