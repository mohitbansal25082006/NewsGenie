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
import { Menu } from "lucide-react";

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
                    width={72}
                    height={72}
                    className="rounded-md w-12 h-12 sm:w-16 sm:h-16"
                  />
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                    NewsGenie
                  </div>
                </Link>
              </div>

              {/* Desktop Nav Links */}
              {session && (
                <div className="hidden md:flex gap-6">
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
                </div>
              )}

              {/* Right side: Notifications and User Menu */}
              <div className="flex items-center space-x-2">
                {session && <NotificationBadge />}
                <UserMenu />

                {/* Mobile Menu Button */}
                {session && (
                  <button
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                    aria-label="Toggle menu"
                    onClick={() => {
                      const menu = document.getElementById("mobile-menu");
                      if (menu) {
                        menu.classList.toggle("hidden");
                      }
                    }}
                  >
                    <Menu className="h-6 w-6 text-gray-700" />
                  </button>
                )}
              </div>
            </nav>

            {/* Mobile Nav Dropdown */}
            {session && (
              <div
                id="mobile-menu"
                className="md:hidden hidden flex-col space-y-2 px-4 pb-4 bg-white border-t"
              >
                <Link
                  href="/"
                  className="block text-gray-700 hover:text-blue-600 transition"
                >
                  Home
                </Link>
                <Link
                  href="/dashboard"
                  className="block text-gray-700 hover:text-blue-600 transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/chat"
                  className="block text-gray-700 hover:text-blue-600 transition"
                >
                  AI Chat
                </Link>
              </div>
            )}
          </header>

          {/* Page Content */}
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
