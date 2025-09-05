"use client"

import { useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Chrome, Github, ChevronRight } from "lucide-react"
import { toast } from "sonner"

interface AuthButtonsProps {
  size?: "sm" | "lg" | "default"
  className?: string
}

export function AuthButtons({ size = "lg", className = "" }: AuthButtonsProps) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)

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

  if (session) {
    return (
      <Button asChild size={size} className={className}>
        <a href="/dashboard" className="flex items-center gap-2">
          Go to Dashboard
          <ChevronRight className="h-5 w-5" />
        </a>
      </Button>
    )
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${className}`}>
      <Button 
        size={size}
        onClick={() => handleSignIn("google")}
        disabled={isLoading}
        className="w-full sm:w-auto text-lg px-8 py-3 flex items-center gap-2"
      >
        <Chrome className="h-5 w-5" />
        Get Started with Google
        <ChevronRight className="h-5 w-5" />
      </Button>
      <Button 
        variant="outline"
        size={size}
        onClick={() => handleSignIn("github")}
        disabled={isLoading}
        className="w-full sm:w-auto text-lg px-8 py-3 flex items-center gap-2"
      >
        <Github className="h-5 w-5" />
        Or with GitHub
      </Button>
    </div>
  )
}