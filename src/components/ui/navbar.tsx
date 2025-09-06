// E:\newsgenie\src\components\ui\navbar.tsx
"use client";

import Link from "next/link";
import { NotificationBadge } from "@/components/ui/notification-badge";
import { UserMenu } from "@/components/ui/user-menu";
import Image from "next/image";
import { Menu } from "lucide-react";
import { useState } from "react";
import type { Session } from "next-auth";

interface NavbarProps {
  session: Session | null;
}

export default function Navbar({ session }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full border-b bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto flex flex-wrap items-center justify-between p-4 gap-2">
        {/* Logo / Brand */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="NewsGenie AI Logo"
              width={72}
              height={72}
              className="rounded-md w-12 h-12 sm:w-16 sm:h-16"
            />
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 whitespace-nowrap">
              NewsGenie
            </div>
          </Link>
        </div>

        {/* Desktop Nav / Auth Buttons */}
        <div className="flex items-center space-x-3 flex-wrap justify-end flex-1">
          {session ? (
            <>
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
              <div className="flex items-center space-x-2">
                <NotificationBadge />
                <UserMenu />
                {/* Mobile Menu Button */}
                <button
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Toggle menu"
                  onClick={() => setMobileOpen((prev) => !prev)}
                >
                  <Menu className="h-6 w-6 text-gray-700" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2 flex-wrap justify-end w-full md:w-auto">
              <Link
                href="/auth/google"
                className="flex items-center justify-center px-4 py-2 bg-black text-white rounded-md text-sm whitespace-nowrap"
              >
                Continue with Google
              </Link>
              <Link
                href="/auth/github"
                className="flex items-center justify-center px-4 py-2 border border-black rounded-md text-sm whitespace-nowrap"
              >
                Continue with GitHub
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Nav for Logged-in Users */}
        {session && mobileOpen && (
          <div className="md:hidden w-full flex flex-col space-y-2 mt-2 bg-white border-t px-4 pb-4">
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
      </nav>
    </header>
  );
}
