import { prisma } from "./db";
import { sendResolutionEmail } from "./email";

const CLOB_API = "https://clob.polymarket.com";

interface ClobToken {
  token_id: string;
  outcome: string;
  price: number;
  winner: boolean;
}

interface ClobMarket {
  condition_id: string;
  closed: boolean;
  tokens: ClobToken[];
}

export async function resolvePositions(): Promise<{
  resolved: number;
  paid: number;
}> {
  // Get all unresolved positions
  const openPositions = await prisma.position.findMany({
    where: { resolved: false },
    include: { user: true },
  });

  if (openPositions.length === 0) return { resolved: 0, paid: 0 };

  // Group by conditionId to batch API calls
  const conditionIds = [...new Set(openPositions.map((p) => p.conditionId))];

  let totalResolved = 0;
  let totalPaid = 0;

  for (const conditionId of conditionIds) {
    try {
      const res = await fetch(`${CLOB_API}/markets/${conditionId}`);
      if (!res.ok) continue;

      const market: ClobMarket = await res.json();

      // Only process closed markets
      if (!market.closed) continue;

      // Find the winning outcome
      const winningToken = market.tokens.find((t) => t.winner);
      if (!winningToken) continue;

      const winningOutcome = winningToken.outcome;

      // Get all positions for this market
      const positions = openPositions.filter(
        (p) => p.conditionId === conditionId
      );

      for (const position of positions) {
        const won = position.outcome === winningOutcome;
        const payout = won ? position.shares * 1.0 : 0; // $1 per share if won

        // Update position
        await prisma.position.update({
          where: { id: position.id },
          data: { resolved: true, won },
        });

        if (payout > 0) {
          // Credit user balance
          await prisma.user.update({
            where: { id: position.userId },
            data: { balance: { increment: payout } },
          });

          // Record payout transaction
          await prisma.transaction.create({
            data: {
              userId: position.userId,
              type: "PAYOUT",
              amount: payout,
              conditionId: position.conditionId,
              marketSlug: position.marketSlug,
              question: position.question,
              outcome: position.outcome,
              shares: position.shares,
              price: 1.0,
            },
          });

          totalPaid++;
        }

        // Emails sent separately via digest cron, not per-resolution

        totalResolved++;
      }
    } catch {
      // Skip markets that fail to fetch
      continue;
    }
  }

  return { resolved: totalResolved, paid: totalPaid };
}
