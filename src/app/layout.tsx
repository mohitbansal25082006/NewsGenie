import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  LayoutDashboard, 
  Settings, 
  BookOpen, 
  TrendingUp, 
  BarChart3,
  Sparkles,
  Menu,
  X
} from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NewsGenie - AI-Powered News Aggregator',
  description: 'Discover, analyze, and track news with AI-powered insights',
  keywords: 'news, AI, aggregator, analysis, trends',
  authors: [{ name: 'NewsGenie Team' }],
  openGraph: {
    title: 'NewsGenie - AI-Powered News Aggregator',
    description: 'Discover, analyze, and track news with AI-powered insights',
    type: 'website',
    url: 'https://newsgenie.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NewsGenie - AI-Powered News Aggregator',
    description: 'Discover, analyze, and track news with AI-powered insights',
  },
  robots: {
    index: true,
    follow: true,
  },
}

async function Navigation() {
  const session = await getServerSession(authOptions);
  
  if (!session) return null;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">NG</span>
          </div>
          <span className="font-bold text-xl">NewsGenie</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link href="/dashboard/trending" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
            <TrendingUp className="h-4 w-4" />
            <span>Trending</span>
          </Link>
          <Link href="/dashboard/recommendations" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
            <Sparkles className="h-4 w-4" />
            <span>For You</span>
          </Link>
          <Link href="/dashboard/analytics" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </Link>
          <Link href="/dashboard/bookmarks" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
            <BookOpen className="h-4 w-4" />
            <span>Bookmarks</span>
          </Link>
          <Link href="/dashboard/preferences" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
            <Settings className="h-4 w-4" />
            <span>Preferences</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navigation />
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}