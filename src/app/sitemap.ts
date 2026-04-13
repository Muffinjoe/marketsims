import type { MetadataRoute } from "next";

const BASE_URL = "https://marketsims.com";
const GAMMA_API = "https://gamma-api.polymarket.com";

function slugify(id: string, question: string): string {
  const slug = question
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-$/, "");
  return `${id}-${slug}`;
}

const CATEGORIES = [
  "politics",
  "sports",
  "crypto",
  "finance",
  "tech",
  "culture",
  "elections",
  "geopolitics",
  "economy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    // Core pages
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/daily`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  // Category landing pages
  for (const cat of CATEGORIES) {
    entries.push({
      url: `${BASE_URL}/?cat=${cat.charAt(0).toUpperCase() + cat.slice(1)}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  // Fetch top markets by volume across categories
  try {
    // Top trending markets
    const trendingRes = await fetch(
      `${GAMMA_API}/markets?active=true&closed=false&order=volume24hr&ascending=false&limit=100`,
      { next: { revalidate: 3600 } }
    );
    if (trendingRes.ok) {
      const markets = (await trendingRes.json()) as {
        id: string;
        question: string;
        volume24hr: number;
      }[];
      for (const m of markets) {
        entries.push({
          url: `${BASE_URL}/market/${slugify(m.id, m.question)}`,
          lastModified: new Date(),
          changeFrequency: "hourly",
          priority: m.volume24hr > 100000 ? 0.9 : 0.6,
        });
      }
    }

    // Top markets per category via events
    for (const cat of CATEGORIES) {
      const res = await fetch(
        `${GAMMA_API}/events?tag_slug=${cat}&active=true&closed=false&order=volume24hr&ascending=false&limit=20`,
        { next: { revalidate: 3600 } }
      );
      if (!res.ok) continue;
      const events = (await res.json()) as {
        markets?: { id: string; question: string }[];
      }[];
      for (const event of events) {
        const market = event.markets?.[0];
        if (market) {
          const url = `${BASE_URL}/market/${slugify(market.id, market.question)}`;
          // Avoid duplicates
          if (!entries.some((e) => e.url === url)) {
            entries.push({
              url,
              lastModified: new Date(),
              changeFrequency: "daily",
              priority: 0.5,
            });
          }
        }
      }
    }
  } catch {
    // Fall back to static pages only
  }

  return entries;
}
