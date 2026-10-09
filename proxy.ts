import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Redirects unauthenticated visitors to /login (see `authorized` in the auth config).
// Pages and actions still verify the user themselves; this is the first line of defence.
export default NextAuth(authConfig).auth;

export const config = {
  // Skip Auth.js endpoints, Next.js internals and static files.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
