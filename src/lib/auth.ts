import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "./db";
import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: ({ session, token }: { session: Session; token: JWT }) => {
      // token.sub is the user's id (string) when set in the jwt callback
      if (token.sub) {
        // session.user may not have an `id` property by default in the Session type,
        // so we assert a minimal shape to add the id without using `any`.
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
    jwt: ({ token, user }: { token: JWT; user?: User }) => {
      // When a user is present (on sign in), attach their id to the token.
      // Use String(...) to be safe in case user.id is not a string.
      if (user) {
        token.sub = String((user as { id?: unknown }).id ?? token.sub ?? "");
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
