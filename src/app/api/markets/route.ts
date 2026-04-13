import { getMarkets, searchMarkets, getMarketsByTag } from "@/lib/polymarket";

// Map frontend category names to API params
const CATEGORY_CONFIG: Record<
  string,
  { type: "sort" | "tag" | "ending"; value: string }
> = {
  Trending: { type: "sort", value: "volume24hr" },
  Breaking: { type: "sort", value: "competitive" },
  Ending: { type: "ending", value: "endDate" },
  New: { type: "sort", value: "startDate" },
  Politics: { type: "tag", value: "politics" },
  Sports: { type: "tag", value: "sports" },
  Crypto: { type: "tag", value: "crypto" },
  Finance: { type: "tag", value: "finance" },
  Geopolitics: { type: "tag", value: "geopolitics" },
  Tech: { type: "tag", value: "tech" },
  Culture: { type: "tag", value: "culture" },
  Economy: { type: "tag", value: "economy" },
  Weather: { type: "tag", value: "weather" },
  Elections: { type: "tag", value: "elections" },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const category = searchParams.get("category") || "Trending";
  const limit = Number(searchParams.get("limit") || 20);
  const offset = Number(searchParams.get("offset") || 0);

  // Search query
  if (query) {
    const markets = await searchMarkets(query);
    return Response.json({ markets });
  }

  const config = CATEGORY_CONFIG[category];

  // Ending soon — fetch more, filter to future end dates, sort by soonest
  if (config?.type === "ending") {
    const all = await getMarkets({
      limit: 200,
      offset: 0,
      active: true,
      closed: false,
      order: "endDate",
      ascending: true,
    });

    const now = new Date();
    const ending = all
      .filter((m) => {
        if (!m.endDate) return false;
        const end = new Date(m.endDate);
        return end > now;
      })
      .slice(offset, offset + limit);

    return Response.json({ markets: ending });
  }

  // Tag-based categories — use events API
  if (config?.type === "tag") {
    const markets = await getMarketsByTag(config.value, limit, offset);
    return Response.json({ markets });
  }

  // Sort-based categories (Trending, Breaking, New)
  const order = config?.value || "volume24hr";
  const markets = await getMarkets({
    limit,
    offset,
    active: true,
    closed: false,
    order,
    ascending: false,
  });

  return Response.json({ markets });
}
