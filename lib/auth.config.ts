import { NextResponse } from "next/server";
import type { NextAuthConfig } from "next-auth";
import { isConfiguredAdmin } from "@/lib/admin-identity";

const authUrl = process.env.AUTH_URL ?? "";
if (
  process.env.VERCEL &&
  (!authUrl || authUrl.includes("localhost") || authUrl.includes("127.0.0.1"))
) {
  delete process.env.AUTH_URL;
}

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const isAdmin = isConfiguredAdmin(auth?.user?.email);
      const isLogin = nextUrl.pathname === "/admin/login";

      if (isLogin) {
        if (isAdmin) return NextResponse.redirect(new URL("/admin", nextUrl));
        return true;
      }

      if (!isAdmin) {
        const login = new URL("/admin/login", nextUrl);
        login.searchParams.set("callbackUrl", "/admin");
        return NextResponse.redirect(login);
      }

      const response = NextResponse.next();
      response.headers.set("Cache-Control", "private, no-store, max-age=0");
      response.headers.set("Pragma", "no-cache");
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
      return response;
    },
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      if (user?.email) token.email = user.email.toLowerCase();
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user && typeof token.email === "string") {
        session.user.email = token.email;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
