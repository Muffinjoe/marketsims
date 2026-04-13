import { getMarket, getEvent } from "@/lib/polymarket";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MarketDetail from "./MarketDetail";
import EventDetail from "./EventDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const idMatch = rawSlug.match(/^(\d+)/);
  const market = await getMarket(idMatch ? idMatch[1] : rawSlug);
  if (!market) return {};

  const yes = (market.outcomePrices[0] * 100).toFixed(0);
  const no = (market.outcomePrices[1] * 100).toFixed(0);

  return {
    title: `${market.question} | MarketSims`,
    description: `Yes ${yes}% / No ${no}% — Make your prediction on MarketSims`,
    openGraph: {
      title: market.question,
      description: `Yes ${yes}% / No ${no}% — Practice prediction markets with virtual money`,
      images: [
        `/api/og?title=${encodeURIComponent(market.question)}&yes=${yes}&no=${no}`,
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: market.question,
      description: `Yes ${yes}% / No ${no}%`,
      images: [
        `/api/og?title=${encodeURIComponent(market.question)}&yes=${yes}&no=${no}`,
      ],
    },
  };
}

export default async function MarketPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  // Extract numeric ID from SEO slug like "1854212-elon-musk-tweets"
  const idMatch = rawSlug.match(/^(\d+)/);
  const lookupId = idMatch ? idMatch[1] : rawSlug;
  const market = await getMarket(lookupId);
  if (!market) notFound();

  // If this is a multi-outcome (negRisk) market, show the event view
  if (market.slug) {
    const event = await getEvent(lookupId);
    if (event && event.markets.length > 2) {
      return <EventDetail event={event} />;
    }
  }

  return <MarketDetail market={market} />;
}
