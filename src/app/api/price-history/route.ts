export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tokenId = searchParams.get("tokenId");
  const interval = searchParams.get("interval") || "1w";
  const fidelity = searchParams.get("fidelity") || "100";

  if (!tokenId) {
    return Response.json({ error: "tokenId required" }, { status: 400 });
  }

  const res = await fetch(
    `https://clob.polymarket.com/prices-history?market=${tokenId}&interval=${interval}&fidelity=${fidelity}`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) {
    return Response.json({ history: [] });
  }

  const data = await res.json();
  return Response.json(data);
}
