declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event, params);
  }
}

// Standard events
export const pixelSignup = () => trackEvent("Lead", { content_name: "signup" });
export const pixelLogin = () => trackEvent("Login", { content_name: "login" });
export const pixelPrediction = (market: string) =>
  trackEvent("Purchase", { content_name: market, currency: "USD", value: 0 });
export const pixelViewMarket = (market: string) =>
  trackEvent("ViewContent", { content_name: market });
export const pixelShare = () => trackEvent("Share");
export const pixelDailyBonus = () =>
  trackEvent("CompleteRegistration", { content_name: "daily_bonus" });
