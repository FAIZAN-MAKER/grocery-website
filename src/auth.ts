import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import connectDb from "./lib/db";
import { User } from "./models/user.model";

// ─── Validation Schema ────────────────────────────────────────────────────────
const credentialsSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

// ─── Auth Config ──────────────────────────────────────────────────────────────
const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Validate input shape before touching the DB
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        try {
          await connectDb(); // ✅ was missing await

          // ✅ was missing await — caused user to always be a Promise (truthy!)
          const user = await User.findOne({ email }).select("+password").lean();

          if (!user) return null; // ✅ return null instead of throwing (NextAuth best practice)

          const isMatch = await bcrypt.compare(
            password,
            user.password as string,
          );
          if (!isMatch) return null;

          return {
            id: (user._id as string).toString(),
            email: user.email as string,
            name: user.name as string,
            role: user.role as string,
          };
        } catch (error) {
          console.error("[Auth] authorize error:", error);
          return null; // ✅ never leak internal errors to the client
        }
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      // Only runs on sign-in; merge user fields into token once
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },

    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 10 * 24 * 60 * 60, // 10 days
  },

  secret: process.env.AUTH_SECRET,
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
