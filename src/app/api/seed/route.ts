import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

const FAKE_USERS = [
  { username: "cryptoqueen", balance: 47200 },
  { username: "predictormax", balance: 38900 },
  { username: "marketwhiz", balance: 35600 },
  { username: "oracledan", balance: 31200 },
  { username: "betsmith", balance: 28800 },
  { username: "calleditsam", balance: 27400 },
  { username: "sharpshooter", balance: 26100 },
  { username: "oddsfinder", balance: 24800 },
  { username: "trendwatcher", balance: 23500 },
  { username: "luckyleo", balance: 22100 },
  { username: "probqueen", balance: 21700 },
  { username: "pickmaster99", balance: 20300 },
  { username: "insightjay", balance: 19800 },
  { username: "alphareader", balance: 18600 },
  { username: "eventedge", balance: 17900 },
  { username: "natesilver2", balance: 17200 },
  { username: "datacruncher", balance: 16800 },
  { username: "forecastfox", balance: 16100 },
  { username: "riskrunner", balance: 15600 },
  { username: "signalfinder", balance: 15200 },
  { username: "clutchcall", balance: 14700 },
  { username: "thecaller", balance: 14300 },
  { username: "pulsereader", balance: 13800 },
  { username: "coinflipking", balance: 13400 },
  { username: "edgehunter", balance: 13000 },
  { username: "smartmoney_", balance: 12600 },
  { username: "polyplayer", balance: 12200 },
  { username: "oddshacker", balance: 11800 },
  { username: "chartsensei", balance: 11500 },
  { username: "gambitgirl", balance: 11200 },
  { username: "truesight", balance: 10900 },
  { username: "callmaker", balance: 10700 },
  { username: "streakchaser", balance: 10500 },
  { username: "bayesian_bob", balance: 10300 },
  { username: "futuresight", balance: 10100 },
  { username: "readtheroom", balance: 9900 },
  { username: "contrarian42", balance: 9600 },
  { username: "yoloyogi", balance: 9400 },
  { username: "newsreader", balance: 9200 },
  { username: "crowdbeater", balance: 9000 },
  { username: "simtrader", balance: 8700 },
  { username: "picksnchill", balance: 8500 },
  { username: "evmaker", balance: 8200 },
  { username: "boldcaller", balance: 7900 },
  { username: "vibecheck", balance: 7600 },
  { username: "moonshot_m", balance: 7300 },
  { username: "safeplayer", balance: 7000 },
  { username: "slowgrinder", balance: 6800 },
  { username: "firsttimer", balance: 6500 },
  { username: "wannabewhale", balance: 6200 },
  { username: "newbie_nick", balance: 5900 },
  { username: "juststarted", balance: 5500 },
];

const MARKETS = [
  { conditionId: "seed-btc-150k", slug: "will-bitcoin-reach-150k", question: "Will Bitcoin reach $150,000 in April?", outcome: "Yes", price: 0.25 },
  { conditionId: "seed-btc-150k", slug: "will-bitcoin-reach-150k", question: "Will Bitcoin reach $150,000 in April?", outcome: "No", price: 0.75 },
  { conditionId: "seed-hungary-pm", slug: "next-prime-minister-of-hungary", question: "Will the next Prime Minister of Hungary be Péter Magyar?", outcome: "Yes", price: 0.99 },
  { conditionId: "seed-fifa-spain", slug: "will-spain-win-fifa", question: "Will Spain win the 2026 FIFA World Cup?", outcome: "Yes", price: 0.12 },
  { conditionId: "seed-fifa-spain", slug: "will-spain-win-fifa", question: "Will Spain win the 2026 FIFA World Cup?", outcome: "No", price: 0.88 },
  { conditionId: "seed-iran-ceasefire", slug: "iran-ceasefire", question: "US x Iran permanent peace deal by June 30?", outcome: "Yes", price: 0.39 },
  { conditionId: "seed-iran-ceasefire", slug: "iran-ceasefire", question: "US x Iran permanent peace deal by June 30?", outcome: "No", price: 0.61 },
  { conditionId: "seed-fed-rates", slug: "fed-interest-rates", question: "Will the Fed decrease interest rates in April?", outcome: "Yes", price: 0.45 },
  { conditionId: "seed-peru-election", slug: "peru-election", question: "Will Rafael López Aliaga win the 2026 Peruvian presidential election?", outcome: "Yes", price: 0.38 },
  { conditionId: "seed-peru-election", slug: "peru-election", question: "Will Rafael López Aliaga win the 2026 Peruvian presidential election?", outcome: "No", price: 0.62 },
  { conditionId: "seed-epl", slug: "english-premier-league", question: "Will Arsenal win the 2025-26 Champions League?", outcome: "Yes", price: 0.08 },
  { conditionId: "seed-masters", slug: "masters-golf", question: "Will Scottie Scheffler win The Masters 2026?", outcome: "Yes", price: 0.15 },
  { conditionId: "seed-nba", slug: "nba-finals", question: "Will the Oklahoma City Thunder win the 2026 NBA Finals?", outcome: "Yes", price: 0.22 },
  { conditionId: "seed-crude", slug: "crude-oil-110", question: "Will WTI Crude Oil hit $110 in April 2026?", outcome: "Yes", price: 0.78 },
  { conditionId: "seed-crude", slug: "crude-oil-110", question: "Will WTI Crude Oil hit $110 in April 2026?", outcome: "No", price: 0.22 },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("key") !== "seedit") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hashed = await bcrypt.hash("seeded1234", 10);
  let created = 0;

  for (const fake of FAKE_USERS) {
    const exists = await prisma.user.findUnique({
      where: { username: fake.username },
    });
    if (exists) continue;

    const code = fake.username.slice(0, 8) + Math.random().toString(36).slice(2, 5);

    const user = await prisma.user.create({
      data: {
        email: `${fake.username}@marketsims.fake`,
        username: fake.username,
        password: hashed,
        balance: fake.balance,
        referralCode: code,
        streak: Math.floor(Math.random() * 8),
      },
    });

    // Give each user 2-5 random positions
    const numPicks = 2 + Math.floor(Math.random() * 4);
    const shuffled = [...MARKETS].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(numPicks, shuffled.length); i++) {
      const m = shuffled[i];
      const shares = 10 + Math.floor(Math.random() * 200);

      await prisma.position.create({
        data: {
          userId: user.id,
          conditionId: m.conditionId + `-${fake.username}`,
          marketSlug: m.slug,
          question: m.question,
          outcome: m.outcome,
          shares,
          avgPrice: m.price,
        },
      });

      await prisma.activity.create({
        data: {
          userId: user.id,
          type: "PICK",
          conditionId: m.conditionId,
          marketSlug: m.slug,
          question: m.question,
          outcome: m.outcome,
          shares,
          price: m.price,
        },
      });
    }

    // Add some resolved (won) positions for top users
    if (fake.balance > 15000) {
      const numWins = 1 + Math.floor(Math.random() * 3);
      for (let w = 0; w < numWins; w++) {
        const wm = shuffled[shuffled.length - 1 - w] || shuffled[0];
        await prisma.position.create({
          data: {
            userId: user.id,
            conditionId: `resolved-${fake.username}-${w}`,
            marketSlug: wm.slug,
            question: wm.question,
            outcome: wm.outcome,
            shares: 20 + Math.floor(Math.random() * 100),
            avgPrice: wm.price,
            resolved: true,
            won: true,
          },
        });
      }
    }

    created++;
  }

  return Response.json({ created, total: FAKE_USERS.length });
}
