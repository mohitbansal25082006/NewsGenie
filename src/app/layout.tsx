// E:\newsgenie\src\app\layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Link from "next/link";
import { NotificationBadge } from "@/components/ui/notification-badge";
import { UserMenu } from "@/components/ui/user-menu";
import Image from "next/image";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (err) {
    console.error("Error fetching session:", err);
  }

  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <Providers>
          {/* Navigation Bar */}
          <header className="w-full border-b bg-white shadow-sm sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto flex flex-wrap items-center justify-between p-4">
              {/* Logo / Brand */}
              <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center space-x-3">
                  <Image
                    src="/logo.png"
                    alt="NewsGenie AI Logo"
                    width={64}
                    height={64}
                    className="rounded-md"
                    priority
                  />
                  <span className="text-3xl font-bold text-blue-600 whitespace-nowrap">
                    NewsGenie
                  </span>
                </Link>
              </div>

              {/* Mobile Menu Toggle */}
              <input
                type="checkbox"
                id="menu-toggle"
                className="hidden peer"
              />
              <label
                htmlFor="menu-toggle"
                className="md:hidden block cursor-pointer"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </label>

              {/* Nav Links */}
              <div className="w-full md:flex md:items-center md:w-auto hidden peer-checked:flex flex-col md:flex-row md:gap-6 mt-2 md:mt-0">
                {session ? (
                  <>
                    <Link
                      href="/"
                      className="text-gray-700 hover:text-blue-600 transition py-2 md:py-0"
                    >
                      Home
                    </Link>
                    <Link
                      href="/dashboard"
                      className="text-gray-700 hover:text-blue-600 transition py-2 md:py-0"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/chat"
                      className="text-gray-700 hover:text-blue-600 transition py-2 md:py-0"
                    >
                      AI Chat
                    </Link>
                  </>
                ) : null}
              </div>

              {/* Right side: Notifications and User Menu */}
              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                {session && <NotificationBadge />}
                {/* Always render UserMenu */}
                <UserMenu />
              </div>
            </nav>
          </header>

          {/* Page Content */}
          <main className="max-w-7xl mx-auto p-4 md:p-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
