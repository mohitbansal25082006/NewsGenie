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
          {/* Navigation Bar */}
          <header className="w-full border-b bg-white shadow-sm sticky top-0 z-50">
            <nav className="container mx-auto flex items-center justify-between p-4">
              {/* Logo / Brand */}
              <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center space-x-3">
                  <Image
                    src="/logo.png"
                    alt="NewsGenie AI Logo"
                    width={64}
                    height={64}
                    className="rounded-md"
                  />
                  <div className="text-3xl font-bold text-blue-600">
                    NewsGenie
                  </div>
                </Link>
              </div>

              {/* Nav Links */}
              <div className="flex gap-6">
                {session && (
                  <>
                    <Link
                      href="/"
                      className="text-gray-700 hover:text-blue-600 transition"
                    >
                      Home
                    </Link>
                    <Link
                      href="/dashboard"
                      className="text-gray-700 hover:text-blue-600 transition"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/chat"
                      className="text-gray-700 hover:text-blue-600 transition"
                    >
                      AI Chat
                    </Link>
                  </>
                )}
              </div>

              {/* Right side: Notifications and User Menu */}
              <div className="flex items-center space-x-2">
                {session && <NotificationBadge />}
                <UserMenu />
              </div>
            </nav>
          </header>

          {/* Page Content */}
          <main className="container mx-auto p-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
