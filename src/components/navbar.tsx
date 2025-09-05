"use client"

import { useState, useEffect } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Sparkles,
  Github,
  Chrome,
  Menu,
  X
} from "lucide-react"
import { toast } from "sonner"

export function Navbar() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignIn = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: "/dashboard" })
      toast.success("Signing you in...")
    } catch (error) {
      toast.error("Failed to sign in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/" })
      toast.success("Signed out successfully")
    } catch (error) {
      toast.error("Failed to sign out")
    }
  }

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-950/95 dark:supports-[backdrop-filter]:bg-slate-950/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NewsGenie
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-sm font-medium hover:text-blue-600 transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium hover:text-blue-600 transition-colors">How It Works</a>
          <a href="#pricing" className="text-sm font-medium hover:text-blue-600 transition-colors">Pricing</a>
        </nav>

        {/* Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          {status === "loading" ? (
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : session ? (
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user?.image || ""} />
                <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">Hi, {session.user?.name}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
              <Button asChild size="sm">
                <a href="/dashboard">Dashboard</a>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSignIn("google")}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Chrome className="h-4 w-4" />
                Google
              </Button>
              <Button
                size="sm"
                onClick={() => handleSignIn("github")}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Github className="h-4 w-4" />
                GitHub
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white dark:bg-slate-950">
          <div className="px-4 py-4 space-y-4">
            <nav className="flex flex-col space-y-3">
              <a href="#features" className="text-sm font-medium hover:text-blue-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium hover:text-blue-600 transition-colors">How It Works</a>
              <a href="#pricing" className="text-sm font-medium hover:text-blue-600 transition-colors">Pricing</a>
            </nav>
            
            {!session && (
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleSignIn("google")}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Chrome className="h-4 w-4" />
                  Sign in with Google
                </Button>
                <Button
                  onClick={() => handleSignIn("github")}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  Sign in with GitHub
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}