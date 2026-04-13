const GAMMA_API = "https://gamma-api.polymarket.com";

export interface PolymarketMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  description: string;
  outcomes: string[];
  outcomePrices: number[];
  endDate: string;
  image: string;
  volume: string;
  volume24hr: number;
  liquidity: string;
  active: boolean;
  closed: boolean;
  bestBid: number;
  bestAsk: number;
  clobTokenIds: string[];
}

function parseMarket(raw: Record<string, unknown>): PolymarketMarket {
  return {
    id: raw.id as string,
    question: raw.question as string,
    conditionId: raw.conditionId as string,
    slug: raw.slug as string,
    description: (raw.description as string) || "",
    outcomes: JSON.parse((raw.outcomes as string) || '["Yes","No"]'),
    outcomePrices: JSON.parse(
      (raw.outcomePrices as string) || "[0.5,0.5]"
    ).map(Number),
    endDate: raw.endDate as string,
    image: raw.image as string,
    volume: raw.volume as string,
    volume24hr: (raw.volume24hr as number) || 0,
    liquidity: raw.liquidity as string,
    active: raw.active as boolean,
    closed: raw.closed as boolean,
    bestBid: raw.bestBid as number,
    bestAsk: raw.bestAsk as number,
    clobTokenIds: JSON.parse((raw.clobTokenIds as string) || "[]"),
  };
}

export async function getMarkets(params?: {
  limit?: number;
  offset?: number;
  active?: boolean;
  closed?: boolean;
  order?: string;
  ascending?: boolean;
  tag?: string;
}): Promise<PolymarketMarket[]> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));
  if (params?.active !== undefined)
    searchParams.set("active", String(params.active));
  if (params?.closed !== undefined)
    searchParams.set("closed", String(params.closed));
  if (params?.order) searchParams.set("order", params.order);
  if (params?.ascending !== undefined)
    searchParams.set("ascending", String(params.ascending));
  if (params?.tag) searchParams.set("tag", params.tag);

  const res = await fetch(`${GAMMA_API}/markets?${searchParams}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch markets");
  const data = await res.json();
  return (data as Record<string, unknown>[]).map(parseMarket);
}

export interface PolymarketEvent {
  id: string;
  title: string;
  slug: string;
  image: string;
  description: string;
  markets: PolymarketMarket[];
}

export async function getEvent(
  marketId: string
): Promise<PolymarketEvent | null> {
  // Fetch market via list API to get the events field
  let eventId: string | null = null;

  if (/^\d+$/.test(marketId)) {
    const res = await fetch(`${GAMMA_API}/markets?id=${marketId}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const events = data[0].events as { id: string }[] | undefined;
        if (events && events.length > 0) {
          eventId = String(events[0].id);
        }
      }
    }
  }

  if (!eventId) return null;

  // Fetch the full event with all its markets
  const res = await fetch(`${GAMMA_API}/events?id=${eventId}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const events = await res.json();
  if (!Array.isArray(events) || events.length === 0) return null;

  const event = events[0] as Record<string, unknown>;
  const eventMarkets = (event.markets as Record<string, unknown>[]) || [];

  return {
    id: event.id as string,
    title: event.title as string,
    slug: event.slug as string,
    image: (event.image as string) || "",
    description: (event.description as string) || "",
    markets: eventMarkets
      .map(parseMarket)
      .filter((m) => m.active && !m.closed)
      .sort((a, b) => b.outcomePrices[0] - a.outcomePrices[0]),
  };
}

export async function getMarket(
  idOrSlug: string
): Promise<PolymarketMarket | null> {
  // Try by numeric ID first (most reliable)
  if (/^\d+$/.test(idOrSlug)) {
    const res = await fetch(`${GAMMA_API}/markets/${idOrSlug}`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.id) return parseMarket(data);
    }
  }

  // Try by conditionId
  if (idOrSlug.startsWith("0x")) {
    const res = await fetch(
      `${GAMMA_API}/markets?conditionId=${idOrSlug}`,
      { next: { revalidate: 30 } }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return parseMarket(data[0]);
    }
  }

  // Try exact slug match
  const res = await fetch(`${GAMMA_API}/markets?slug=${idOrSlug}`, {
    next: { revalidate: 30 },
  });
  if (res.ok) {
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return parseMarket(data[0]);
  }

  return null;
}

export async function searchMarkets(
  query: string
): Promise<PolymarketMarket[]> {
  const res = await fetch(
    `${GAMMA_API}/markets?slug_contains=${encodeURIComponent(query)}&active=true&limit=20`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data as Record<string, unknown>[]).map(parseMarket);
}

export async function getMarketsByTag(
  tagSlug: string,
  limit: number = 20,
  offset: number = 0
): Promise<PolymarketMarket[]> {
  // Events API supports tag_slug filtering
  const eventsLimit = limit + Math.floor(offset / 1); // fetch enough events
  const res = await fetch(
    `${GAMMA_API}/events?tag_slug=${tagSlug}&active=true&closed=false&order=volume24hr&ascending=false&limit=${eventsLimit}&offset=${offset}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return [];
  const events = await res.json();

  // Extract markets from events — prefer matchup-style (non-Yes/No) outcomes
  const markets: PolymarketMarket[] = [];
  for (const event of events as Record<string, unknown>[]) {
    const eventMarkets = event.markets as Record<string, unknown>[] | undefined;
    if (!eventMarkets || eventMarkets.length === 0) continue;

    // Look for a market with non-Yes/No outcomes (matchups, team names, etc.)
    const matchup = eventMarkets.find((m) => {
      const outcomes = JSON.parse((m.outcomes as string) || '["Yes","No"]');
      return outcomes[0] !== "Yes" && outcomes[0] !== "No";
    });

    if (matchup) {
      markets.push(parseMarket(matchup));
    } else {
      // Fall back to first market (Yes/No sub-market)
      markets.push(parseMarket(eventMarkets[0]));
    }

    if (markets.length >= limit) break;
  }
  return markets.slice(0, limit);
}
