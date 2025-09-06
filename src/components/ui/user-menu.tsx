// E:\newsgenie\src\components\ui\user-menu.tsx
"use client";
import { useSession, signOut, signIn } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, Bell, MessageSquare, Github, Chrome } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function UserMenu() {
  const { data: session } = useSession();

  const handleSignIn = async (provider: string) => {
    try {
      // This will redirect to provider's signin flow
      await signIn(provider, { callbackUrl: "/dashboard" });
      toast.success("Signing you in...");
    } catch (error) {
      toast.error("Failed to sign in. Please try again.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {session ? (
          // If logged in: show avatar button
          <Button variant="ghost" className="relative h-8 w-8 rounded-full" asChild>
            <div className="relative h-8 w-8 rounded-full overflow-hidden">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                <AvatarFallback>
                  {session.user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </Button>
        ) : (
          // If logged out: show Sign In button which opens the same dropdown
          <Button variant="outline" size="sm">Sign In</Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        {session ? (
          <>
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                {session.user?.name && <p className="font-medium">{session.user.name}</p>}
                {session.user?.email && (
                  <p className="w-[200px] truncate text-sm text-muted-foreground">{session.user.email}</p>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard">
                <div className="flex items-center gap-2">
                  <User className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/chat">
                <div className="flex items-center gap-2">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>AI Chat</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/notifications">
                <div className="flex items-center gap-2">
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/preferences">
                <div className="flex items-center gap-2">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Preferences</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => handleSignIn("google")} className="flex items-center gap-2 cursor-pointer">
              <Chrome className="h-4 w-4" />
              <span>Sign in with Google</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSignIn("github")} className="flex items-center gap-2 cursor-pointer">
              <Github className="h-4 w-4" />
              <span>Sign in with GitHub</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
