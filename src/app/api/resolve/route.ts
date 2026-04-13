import { resolvePositions } from "@/lib/resolver";

// Trigger resolution check — can be called by cron or on portfolio load
export async function POST() {
  const result = await resolvePositions();
  return Response.json(result);
}

// Also allow GET for easy testing/cron
export async function GET() {
  const result = await resolvePositions();
  return Response.json(result);
}
