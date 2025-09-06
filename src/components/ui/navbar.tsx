// E:\newsgenie\src\components\ui\navbar.tsx
"use client";

import Link from "next/link";
import { NotificationBadge } from "@/components/ui/notification-badge";
import { UserMenu } from "@/components/ui/user-menu";
import Image from "next/image";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function Navbar({ session }: { session: any }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
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

        {/* Desktop Nav */}
        {session && (
          <div className="hidden md:flex gap-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
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

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {session && <NotificationBadge />}
          <UserMenu />

          {/* Mobile Menu Button */}
          {session && (
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Nav */}
      {session && mobileOpen && (
        <div className="md:hidden flex flex-col space-y-2 px-4 pb-4 bg-white border-t">
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
  );
}
