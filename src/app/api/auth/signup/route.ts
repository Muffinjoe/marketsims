import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { email, username, password, referralCode } = await req.json();

  if (!email || !username || !password) {
    return Response.json({ error: "All fields required" }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return Response.json(
      { error: "Email or username already taken" },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);
  const userReferralCode =
    username.toLowerCase().replace(/[^a-z0-9]/g, "") +
    Math.random().toString(36).slice(2, 6);

  let referredByUser = null;
  if (referralCode) {
    referredByUser = await prisma.user.findUnique({
      where: { referralCode },
    });
  }

  const startingBalance = referredByUser ? 11000 : 10000;

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashed,
      balance: startingBalance,
      referralCode: userReferralCode,
      referredBy: referredByUser?.id || null,
      transactions: {
        create: referredByUser
          ? [
              { type: "SIGNUP_BONUS", amount: 10000 },
              { type: "REFERRAL_BONUS", amount: 1000 },
            ]
          : { type: "SIGNUP_BONUS", amount: 10000 },
      },
    },
  });

  // Give referrer $1,000 bonus
  if (referredByUser) {
    await prisma.user.update({
      where: { id: referredByUser.id },
      data: { balance: { increment: 1000 } },
    });
    await prisma.transaction.create({
      data: {
        userId: referredByUser.id,
        type: "REFERRAL_BONUS",
        amount: 1000,
      },
    });
  }

  // Send welcome email
  sendWelcomeEmail({ to: email, username }).catch(() => {});

  const token = signToken(user.id);
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });

  return Response.json({
    id: user.id,
    email: user.email,
    username: user.username,
    balance: user.balance,
    referralCode: user.referralCode,
  });
}
