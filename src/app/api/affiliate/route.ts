import { AFFILIATE_LINK } from "@/lib/dub";

export async function GET() {
  return Response.json({ link: AFFILIATE_LINK });
}
