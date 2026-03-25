// ─── NextAuth Type Augmentation ───────────────────────────────────────────────
// Extend the built-in NextAuth types to include application-specific fields
// (user ID and role) so TypeScript knows about them everywhere.

import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extends the built-in `Session` type.
   * The `session.user` object will now include `id` and `role`.
   */
  interface Session {
    user: {
      /** Prisma user ID (cuid) */
      id: string;
      /** Application role — USER | ADMIN */
      role: string;
    } & DefaultSession["user"];
  }

  /**
   * Extends the built-in `User` type returned by the `authorize` callback
   * and OAuth profile functions, so the role is available during sign-in.
   */
  interface User extends DefaultUser {
    /** Application role — USER | ADMIN */
    role?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extends the built-in JWT payload.
   * Token contents are available inside the `jwt` and `session` callbacks.
   */
  interface JWT extends DefaultJWT {
    /** Prisma user ID (cuid) */
    id?: string;
    /** Application role — USER | ADMIN */
    role?: string;
  }
}
