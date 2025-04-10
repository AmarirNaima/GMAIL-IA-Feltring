import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Development secret fallback (use env vars in production)
const HARDCODED_SECRET = "";

// NextAuth configuration
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email", // <- THIS is required to get id_token from Google
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/gmail.modify",
            "https://www.googleapis.com/auth/gmail.labels",
          ].join(" "),
          prompt: "consent",
          access_type: "offline",
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },

  // ❌ REMOVE if you're not using /login anymore
  // pages: {
  //   signIn: "/login",
  // },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET || HARDCODED_SECRET,
  debug: true,
};
