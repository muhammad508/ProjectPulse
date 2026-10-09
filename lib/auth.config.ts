import type { NextAuthConfig } from "next-auth";

/**
 * The lightweight part of the Auth.js configuration, shared with `proxy.ts`.
 *
 * It must stay free of database and password-hashing imports so the proxy remains small
 * and edge-compatible. Everything that touches the database lives in `lib/auth.ts`.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      // The login page must stay reachable; everything else requires a session.
      if (request.nextUrl.pathname === "/login") return true;
      return Boolean(auth?.user);
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
} satisfies NextAuthConfig;
