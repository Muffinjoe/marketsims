import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "MarketSims <noreply@marketsims.com>";

export async function sendResolutionEmail({
  to,
  username,
  question,
  outcome,
  shares,
  won,
  payout,
}: {
  to: string;
  username: string;
  question: string;
  outcome: string;
  shares: number;
  won: boolean;
  payout: number;
}) {
  const subject = won
    ? `You won on "${question.slice(0, 50)}"!`
    : `Market resolved: "${question.slice(0, 50)}"`;

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 20px; font-weight: 700;">MarketSims</span>
      </div>

      <div style="background: ${won ? "#f0fdf4" : "#fef2f2"}; border: 1px solid ${won ? "#bbf7d0" : "#fecaca"}; border-radius: 12px; padding: 24px; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 8px;">${won ? "🎉" : "😔"}</div>
        <h2 style="margin: 0; font-size: 18px; color: #18181b;">
          ${won ? "You won!" : "Better luck next time"}
        </h2>
        <p style="color: #71717a; font-size: 13px; margin: 8px 0 0;">
          ${question}
        </p>
      </div>

      <div style="margin: 20px 0; padding: 16px; background: #f9fafb; border-radius: 8px;">
        <table style="width: 100%; font-size: 13px; color: #52525b;">
          <tr>
            <td style="padding: 4px 0;">Your pick</td>
            <td style="text-align: right; font-weight: 600; color: #18181b;">${outcome}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;">Shares</td>
            <td style="text-align: right; font-weight: 600; color: #18181b;">${shares.toFixed(1)}</td>
          </tr>
          ${won ? `
          <tr>
            <td style="padding: 4px 0;">Payout</td>
            <td style="text-align: right; font-weight: 700; color: #16a34a;">+$${payout.toFixed(2)}</td>
          </tr>
          ` : ""}
        </table>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="https://marketsims.com" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px;">
          Make more predictions
        </a>
      </div>

      <div style="text-align: center; margin: 24px 0; padding: 16px; background: #eff6ff; border-radius: 8px;">
        <p style="margin: 0 0 8px; font-size: 13px; color: #1e40af; font-weight: 600;">
          Ready to try it for real?
        </p>
        <a href="https://polymarket.com?via=BHSpWG9" style="color: #3b82f6; font-size: 13px; text-decoration: underline;">
          View markets on Polymarket
        </a>
      </div>

      <p style="text-align: center; font-size: 11px; color: #a1a1aa; margin-top: 24px;">
        No real money involved. For entertainment purposes only.<br>
        MarketSims &mdash; marketsims.com
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("[EMAIL] Failed to send:", err);
  }
}

export async function sendWelcomeEmail({
  to,
  username,
}: {
  to: string;
  username: string;
}) {
  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 20px; font-weight: 700;">MarketSims</span>
      </div>

      <div style="text-align: center; padding: 24px;">
        <div style="font-size: 40px; margin-bottom: 8px;">🎮</div>
        <h2 style="margin: 0; font-size: 20px; color: #18181b;">
          Welcome to MarketSims, ${username}!
        </h2>
        <p style="color: #71717a; font-size: 14px; margin: 12px 0 0; line-height: 1.5;">
          You've got <strong>$10,000 in virtual cash</strong> to start making predictions on real markets.
        </p>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="https://marketsims.com" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px;">
          Start playing
        </a>
      </div>

      <p style="text-align: center; font-size: 11px; color: #a1a1aa; margin-top: 24px;">
        No real money involved. For entertainment purposes only.<br>
        MarketSims &mdash; marketsims.com
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Welcome to MarketSims! You've got $10,000 to play with",
      html,
    });
  } catch (err) {
    console.error("[EMAIL] Failed to send welcome:", err);
  }
}
