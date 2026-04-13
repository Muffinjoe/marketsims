import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { username } = await req.json();
  if (!username) {
    return Response.json({ error: "Username required" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) {
    return Response.json({ error: "Player not found" }, { status: 404 });
  }

  if (target.id === session.userId) {
    return Response.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: session.userId,
        followingId: target.id,
      },
    },
    create: { followerId: session.userId, followingId: target.id },
    update: {},
  });

  const followersCount = await prisma.follow.count({
    where: { followingId: target.id },
  });

  return Response.json({ ok: true, followersCount });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { username } = await req.json();
  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) {
    return Response.json({ error: "Player not found" }, { status: 404 });
  }

  await prisma.follow.deleteMany({
    where: { followerId: session.userId, followingId: target.id },
  });

  return Response.json({ ok: true });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  if (!username) {
    return Response.json({ error: "Username required" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) {
    return Response.json({ error: "Player not found" }, { status: 404 });
  }

  const session = await getSession();
  let isFollowing = false;
  if (session) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.userId,
          followingId: target.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  const followersCount = await prisma.follow.count({
    where: { followingId: target.id },
  });
  const followingCount = await prisma.follow.count({
    where: { followerId: target.id },
  });

  return Response.json({ isFollowing, followersCount, followingCount });
}
