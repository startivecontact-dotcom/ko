import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";

import prisma from "@/lib/prisma";

// ─── Validation Schema ────────────────────────────────────────────────────────

const credentialsSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});

// ─── NextAuth Configuration ───────────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  // Use Prisma adapter for database-backed sessions/accounts
  // Cast needed because @auth/prisma-adapter v2 types differ slightly from
  // next-auth v4's Adapter type, but they are runtime-compatible.
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],

  // JWT-based sessions (stateless, no session table needed for credentials)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   // 1 day
  },

  // Custom pages
  pages: {
    signIn: "/auth/connexion",
    error: "/auth/erreur",
    newUser: "/auth/bienvenue",
  },

  providers: [
    // ── Credentials ─────────────────────────────────────────────────────────
    CredentialsProvider({
      id: "credentials",
      name: "Email & Mot de passe",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "vous@exemple.fr",
        },
        password: {
          label: "Mot de passe",
          type: "password",
          placeholder: "••••••••",
        },
      },

      async authorize(credentials) {
        // 1. Validate input shape
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error("Identifiants invalides");
        }

        const { email, password } = parsed.data;

        // 2. Fetch user from database
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            image: true,
            role: true,
          },
        });

        if (!user) {
          // Use a generic message to avoid user enumeration
          throw new Error("Email ou mot de passe incorrect");
        }

        // 3. Verify password
        if (!user.password) {
          // Account created via OAuth — no password set
          throw new Error(
            "Ce compte utilise une connexion sociale. Veuillez vous connecter avec Google."
          );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error("Email ou mot de passe incorrect");
        }

        // 4. Return user object (password excluded)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),

    // ── Google OAuth (optional — only active when env vars are present) ──────
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
            profile(profile) {
              return {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: profile.picture,
                role: "USER" as const,
              };
            },
          }),
        ]
      : []),
  ],

  callbacks: {
    // ── JWT Callback ─────────────────────────────────────────────────────────
    // Called whenever a JWT is created (sign-in) or updated (session refresh).
    async jwt({ token, user, trigger, session }) {
      // On initial sign-in `user` is populated
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "USER";
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image ?? undefined;
      }

      // Handle manual session update via useSession().update()
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
      }

      // Refresh role from DB on every token refresh (catches role changes)
      if (!user && token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, name: true, image: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.name = dbUser.name;
            token.picture = dbUser.image ?? undefined;
          }
        } catch {
          // Silently ignore DB errors during token refresh
        }
      }

      return token;
    },

    // ── Session Callback ─────────────────────────────────────────────────────
    // Shapes the session object exposed to the client.
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string | null;
        session.user.email = token.email as string;
        session.user.image = (token.picture as string | null | undefined) ?? null;
      }
      return session;
    },

    // ── Sign-in Callback ─────────────────────────────────────────────────────
    async signIn({ user, account }) {
      // Allow all credential sign-ins
      if (account?.provider === "credentials") return true;

      // For OAuth, ensure the user has an email
      if (!user.email) return false;

      // Auto-create or link the user profile for OAuth sign-ins
      // (handled by PrismaAdapter, but we can add extra checks here)
      return true;
    },

    // ── Redirect Callback ────────────────────────────────────────────────────
    async redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow same-origin redirects
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  events: {
    // Sync role for OAuth users on first sign-in
    async createUser({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "USER" },
      });
    },
  },

  // Secret used to sign JWTs / encrypt cookies
  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};

export default authOptions;
