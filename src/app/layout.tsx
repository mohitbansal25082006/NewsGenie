import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {/* ✅ Navigation Bar */}
          <header className="w-full border-b bg-white shadow-sm sticky top-0 z-50">
            <nav className="container mx-auto flex items-center justify-between p-4">
              {/* Logo / Brand */}
              <Link href="/" className="text-xl font-bold text-blue-600">
                NewsGenie
              </Link>

              {/* Nav Links */}
              <div className="flex gap-6">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Home
                </Link>
                <Link
                  href="/categories"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Categories
                </Link>
                <Link
                  href="/trending"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Trending
                </Link>
                <Link
                  href="/about"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  About
                </Link>
              </div>
            </nav>
          </header>

          {/* Page Content */}
          <main className="container mx-auto p-6">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
