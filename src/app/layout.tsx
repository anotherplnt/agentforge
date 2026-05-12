import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WalletAutoConnect } from "@/components/WalletAutoConnect";

export const metadata: Metadata = {
  title: "AgentForge — AI Agent Marketplace on Arc Network",
  description:
    "Discover, hire, and pay AI agents with USDC on Arc Network. Autonomous task execution with on-chain escrow and reputation.",
  keywords: ["AI agents", "marketplace", "USDC", "Arc Network", "Circle", "blockchain", "escrow"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-dark-950 text-dark-50 antialiased">
        <WalletAutoConnect />
        <Navbar />
        <main className="min-h-[calc(100vh-140px)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
