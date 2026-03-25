"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  ChevronDown,
  Mountain,
  Anchor,
  TreePine,
  Dumbbell,
  UtensilsCrossed,
  User,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  ClipboardList,
} from "lucide-react";

// ─── Navigation Data ──────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/",            label: "Accueil" },
  { href: "/evenements",  label: "Événements" },
  { href: "/calendrier",  label: "Calendrier" },
  { href: "/blog",        label: "Blog" },
] as const;

const ACTIVITY_ITEMS = [
  { href: "/activites/randonnee",    label: "Randonnée",  Icon: Mountain,       desc: "Trails et sentiers de montagne" },
  { href: "/activites/escalade",     label: "Escalade",   Icon: Anchor,         desc: "Falaises et salles d'escalade" },
  { href: "/activites/outdoor",      label: "Outdoor",    Icon: TreePine,       desc: "Aventures en plein air" },
  { href: "/activites/indoor",       label: "Indoor",     Icon: Dumbbell,       desc: "Activités en salle" },
  { href: "/activites/eat-and-meet", label: "Eat & Meet", Icon: UtensilsCrossed, desc: "Rencontres autour d'un repas" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ActivitiesDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [close]);

  const isActivitiesActive = pathname.startsWith("/activites");

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center gap-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heliotrope-500 rounded px-1 py-0.5 ${
          isActivitiesActive
            ? "text-heliotrope-600"
            : "text-gray-700 hover:text-heliotrope-600"
        }`}
      >
        Activités
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 animate-scale-in rounded-xl border border-lavender-200 bg-white p-2 shadow-brand-lg">
          {ACTIVITY_ITEMS.map(({ href, label, Icon, desc }) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-lavender-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heliotrope-500 ${
                isActive(pathname, href) ? "bg-lavender-200" : ""
              }`}
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lavender-300">
                <Icon className="h-4 w-4 text-heliotrope-600" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-heliotrope-700">
                  {label}
                </span>
                <span className="block text-xs text-gray-400">{desc}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function UserMenu({ session }: { session: NonNullable<ReturnType<typeof useSession>["data"]> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [close]);

  const isAdmin = session.user?.role === "ADMIN";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Menu utilisateur"
        className="flex items-center gap-2 rounded-full border-2 border-transparent p-0.5 transition-all hover:border-heliotrope-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heliotrope-500"
      >
        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-lavender-300">
          {session.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? "Avatar"}
              fill
              sizes="32px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-4 w-4 text-heliotrope-600" />
            </div>
          )}
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 animate-scale-in rounded-xl border border-lavender-200 bg-white py-1.5 shadow-brand-lg">
          {/* User info header */}
          <div className="border-b border-lavender-200 px-4 py-2.5">
            <p className="truncate text-sm font-semibold text-heliotrope-700">
              {session.user?.name ?? "Mon compte"}
            </p>
            <p className="truncate text-xs text-gray-400">{session.user?.email}</p>
          </div>

          <div className="py-1">
            <Link
              href="/profil"
              onClick={close}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-lavender-200 hover:text-heliotrope-600"
            >
              <User className="h-4 w-4" />
              Mon profil
            </Link>
            <Link
              href="/mes-inscriptions"
              onClick={close}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-lavender-200 hover:text-heliotrope-600"
            >
              <ClipboardList className="h-4 w-4" />
              Mes inscriptions
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={close}
                className="flex items-center gap-3 px-4 py-2 text-sm text-moss-700 transition-colors hover:bg-moss-50 hover:text-moss-800"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>

          <div className="border-t border-lavender-200 py-1">
            <button
              onClick={() => {
                close();
                signOut({ callbackUrl: "/" });
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileActivitiesOpen, setMobileActivitiesOpen] = useState(false);

  // Track scroll for shadow
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setMobileActivitiesOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b border-lavender-200 bg-white/95 backdrop-blur-sm transition-shadow duration-300 ${
          scrolled ? "shadow-brand" : "shadow-none"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* ── Logo ──────────────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex shrink-0 items-baseline gap-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heliotrope-500 rounded"
            aria-label="KAO Society — Accueil"
          >
            <span className="font-heading text-2xl font-black leading-none tracking-tight text-heliotrope-600">
              KAO
            </span>
            <span className="font-heading text-2xl font-bold leading-none tracking-tight text-moss-500">
              Society
            </span>
          </Link>

          {/* ── Desktop Nav ───────────────────────────────────────────── */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heliotrope-500 ${
                  isActive(pathname, href)
                    ? "text-heliotrope-600"
                    : "text-gray-700 hover:text-heliotrope-600"
                }`}
              >
                {label}
                {isActive(pathname, href) && (
                  <span className="mt-0.5 block h-0.5 w-full rounded-full bg-heliotrope-600" />
                )}
              </Link>
            ))}
            <ActivitiesDropdown pathname={pathname} />
          </nav>

          {/* ── Auth Zone ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            {status === "loading" ? (
              <div className="h-8 w-24 animate-pulse rounded-lg bg-lavender-200" />
            ) : session ? (
              <UserMenu session={session} />
            ) : (
              <>
                <Link
                  href="/auth/connexion"
                  className="hidden rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-lavender-200 hover:text-heliotrope-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heliotrope-500 sm:block"
                >
                  Se connecter
                </Link>
                <Link
                  href="/auth/inscription"
                  className="rounded-lg bg-heliotrope-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-heliotrope-500 hover:shadow-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heliotrope-500 focus-visible:ring-offset-2"
                >
                  Rejoindre
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-lavender-300 text-gray-600 transition-colors hover:bg-lavender-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heliotrope-500 lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu ───────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" aria-modal="true" role="dialog">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-down panel */}
          <nav
            className="absolute left-0 right-0 top-16 animate-slide-down overflow-y-auto bg-white shadow-brand-lg"
            aria-label="Navigation mobile"
          >
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">

              {/* Main links */}
              <ul className="flex flex-col divide-y divide-lavender-100">
                {NAV_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`flex items-center py-3.5 text-sm font-medium transition-colors ${
                        isActive(pathname, href)
                          ? "text-heliotrope-600"
                          : "text-gray-700 hover:text-heliotrope-600"
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}

                {/* Activities accordion */}
                <li>
                  <button
                    onClick={() => setMobileActivitiesOpen((v) => !v)}
                    aria-expanded={mobileActivitiesOpen}
                    className={`flex w-full items-center justify-between py-3.5 text-sm font-medium transition-colors ${
                      pathname.startsWith("/activites")
                        ? "text-heliotrope-600"
                        : "text-gray-700 hover:text-heliotrope-600"
                    }`}
                  >
                    Activités
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        mobileActivitiesOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {mobileActivitiesOpen && (
                    <ul className="mb-2 flex flex-col gap-1 pl-4">
                      {ACTIVITY_ITEMS.map(({ href, label, Icon }) => (
                        <li key={href}>
                          <Link
                            href={href}
                            className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-lavender-200 ${
                              isActive(pathname, href)
                                ? "bg-lavender-200 font-semibold text-heliotrope-700"
                                : "text-gray-600 hover:text-heliotrope-600"
                            }`}
                          >
                            <Icon className="h-4 w-4 shrink-0 text-heliotrope-500" />
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              </ul>

              {/* Auth section */}
              <div className="mt-4 border-t border-lavender-200 pt-4">
                {session ? (
                  <div className="flex flex-col gap-1">
                    <div className="mb-2 flex items-center gap-3 px-1">
                      <div className="relative h-9 w-9 overflow-hidden rounded-full bg-lavender-300">
                        {session.user?.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user.name ?? "Avatar"}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <User className="h-5 w-5 text-heliotrope-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-heliotrope-700">
                          {session.user?.name ?? "Mon compte"}
                        </p>
                        <p className="text-xs text-gray-400">{session.user?.email}</p>
                      </div>
                    </div>

                    <Link
                      href="/profil"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-lavender-200 hover:text-heliotrope-600"
                    >
                      <User className="h-4 w-4" />
                      Mon profil
                    </Link>
                    <Link
                      href="/mes-inscriptions"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-lavender-200 hover:text-heliotrope-600"
                    >
                      <ClipboardList className="h-4 w-4" />
                      Mes inscriptions
                    </Link>
                    {session.user?.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-moss-700 transition-colors hover:bg-moss-50"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/auth/connexion"
                      className="flex w-full items-center justify-center rounded-lg border border-heliotrope-200 px-4 py-2.5 text-sm font-medium text-heliotrope-600 transition-colors hover:bg-lavender-200"
                    >
                      Se connecter
                    </Link>
                    <Link
                      href="/auth/inscription"
                      className="flex w-full items-center justify-center rounded-lg bg-heliotrope-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-heliotrope-500"
                    >
                      Rejoindre
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
