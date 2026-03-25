import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ─── Protected route matchers ─────────────────────────────────────────────────

/** Routes that require the user to be authenticated */
const AUTH_REQUIRED_PREFIXES = [
  "/profil",
  "/mes-inscriptions",
  "/admin",
];

/** Routes that require ADMIN role */
const ADMIN_REQUIRED_PREFIXES = ["/admin"];

/** Routes only accessible to guests (redirect authenticated users away) */
const GUEST_ONLY_PREFIXES = [
  "/auth/connexion",
  "/auth/inscription",
];

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve JWT token (works with both cookie and header strategies)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = Boolean(token);
  const isAdmin = token?.role === "ADMIN";

  // ── 1. Guest-only routes ───────────────────────────────────────────────────
  // If the user is already logged in, redirect them away from auth pages.
  const isGuestOnlyRoute = GUEST_ONLY_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isGuestOnlyRoute && isAuthenticated) {
    const redirectTo =
      (request.nextUrl.searchParams.get("callbackUrl") as string | null) ??
      "/";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // ── 2. Auth-required routes ────────────────────────────────────────────────
  const isAuthRequired = AUTH_REQUIRED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isAuthRequired && !isAuthenticated) {
    const loginUrl = new URL("/auth/connexion", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 3. Admin-only routes ───────────────────────────────────────────────────
  const isAdminRequired = ADMIN_REQUIRED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isAdminRequired && isAuthenticated && !isAdmin) {
    // Authenticated but not an admin — redirect to the home page with a message
    const forbiddenUrl = new URL("/", request.url);
    forbiddenUrl.searchParams.set("error", "forbidden");
    return NextResponse.redirect(forbiddenUrl);
  }

  // ── 4. All other routes — pass through ────────────────────────────────────
  return NextResponse.next();
}

// ─── Route matcher config ─────────────────────────────────────────────────────
// Only run the middleware on the relevant path patterns; skip static assets,
// API routes handled by NextAuth, and Next.js internals.
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT for:
     *  - _next/static   (static files)
     *  - _next/image    (image optimisation)
     *  - favicon.ico
     *  - public folder assets
     *  - api/auth       (NextAuth own API routes)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|public/|api/auth/).*)",
  ],
};
