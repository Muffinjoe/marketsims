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
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1261200986177027');fbq('track','PageView');`,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1261200986177027&ev=PageView&noscript=1"
          />
        </noscript>
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
