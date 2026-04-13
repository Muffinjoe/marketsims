import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { referralCode: true },
  });

  const referrals = await prisma.user.count({
    where: { referredBy: session.userId },
  });

  return Response.json({
    referralCode: user?.referralCode,
    referralCount: referrals,
    bonusEarned: referrals * 1000,
  });
}
