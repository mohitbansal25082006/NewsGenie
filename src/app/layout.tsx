// E:\newsgenie\src\app\layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Link from "next/link";
import { NotificationBadge } from "@/components/ui/notification-badge";
import { UserMenu } from "@/components/ui/user-menu";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import Navbar from "@/components/ui/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NewsGenie - AI-Powered News Aggregator",
  description:
    "Stay informed with personalized, AI-curated news tailored to your interests. Get summaries, sentiment analysis, and trending topics in real-time.",
  keywords: "news, AI, aggregator, personalized news, technology, business",
  authors: [{ name: "NewsGenie Team" }],
  openGraph: {
    title: "NewsGenie - AI-Powered News Aggregator",
    description: "Stay informed with personalized, AI-curated news",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {/* ✅ Navbar moved into a client component */}
          <Navbar session={session} />

          {/* Page Content */}
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
