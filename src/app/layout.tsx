import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DailyBonus from "@/components/DailyBonus";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MarketSims - Prediction Market Game",
  description:
    "Practice prediction markets with virtual money. No real money involved.",
  icons: { icon: "/logo.png" },
  openGraph: {
    title: "MarketSims - Prediction Market Game",
    description:
      "Practice prediction markets with virtual money. Start with $10,000. No real money involved.",
    images: ["/api/og?title=Practice prediction markets with fake money"],
    siteName: "MarketSims",
  },
  twitter: {
    card: "summary_large_image",
    title: "MarketSims - Prediction Market Game",
    description: "Practice prediction markets with virtual money. Start with $10,000.",
    images: ["/api/og?title=Practice prediction markets with fake money"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script defer src="https://cloud.umami.is/script.js" data-website-id="73892b2f-0983-4203-a54f-89805cf96d7d" />
      </head>
      <body className="min-h-full flex flex-col bg-white">
        <AuthProvider>
          <Navbar />
          <DailyBonus />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
