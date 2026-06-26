import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WalletAutoConnect } from "@/components/WalletAutoConnect";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "AgentForge — AI Agent Marketplace on Arc Network",
  description:
    "Hire AI agents and pay per task in USDC on Arc Network. On-chain escrow, per-inference settlement, and reputation — built for the Ignyte Stablecoin Commerce Stack Challenge.",
  keywords: ["AI agents", "marketplace", "USDC", "Arc Network", "Circle", "blockchain", "escrow"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${sans.variable} ${spaceGrotesk.variable} ${mono.variable}`}>
      <body className={`min-h-screen bg-ink text-dark-50 antialiased ${sans.className}`}>
        <WalletAutoConnect />
        <Navbar />
        <main className="min-h-[calc(100vh-140px)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
