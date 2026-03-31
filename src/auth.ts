import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
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
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        try {
          await connectDb();

          const user = await User.findOne({ email }).select("+password").lean();
          if (!user) return null;

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
          return null;
        }
      },
    }),

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Only run this logic for Google sign-ins
      if (account?.provider === "google") {
        try {
          await connectDb();

          const existingUser = await User.findOne({ email: user.email }).lean();

          if (!existingUser) {
            const newUser = await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
            });
            user.id = (newUser._id as string).toString();
            user.role = newUser.role;
          } else {
            // Populate id and role from existing user too
            user.id = (existingUser._id as string).toString();
            user.role = existingUser.role as string;
          }
        } catch (error) {
          console.error("[Auth] Google signIn error:", error);
          return false; 
        }
      }
      return true;
    },

    jwt({ token, user }) {
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
