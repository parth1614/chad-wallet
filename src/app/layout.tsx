import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { PrivyAppProvider } from "@/components/providers/privy-provider";

const displayFont = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ChadWallet | Hunt every memecoin on Solana",
  description:
    "A ChadWallet-inspired landing page and Solana trading experience powered by Next.js, Privy, BirdEye, Jupiter, and Supabase-ready persistence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PrivyAppProvider>{children}</PrivyAppProvider>
      </body>
    </html>
  );
}
