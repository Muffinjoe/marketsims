import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const positions = await prisma.position.findMany({
    where: { userId: session.userId },
    orderBy: { updatedAt: "desc" },
  });

  return Response.json({ positions });
}
