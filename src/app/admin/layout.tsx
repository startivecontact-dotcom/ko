import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";

// ─── Nav items ────────────────────────────────────────────────────────────────

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Membres",
    href: "/admin/membres",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Événements",
    href: "/admin/evenements",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Blog",
    href: "/admin/blog",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    label: "Contenu",
    href: "/admin/contenu",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
];

// ─── Layout ───────────────────────────────────────────────────────────────────

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-lavender-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-heliotrope-900 text-white flex flex-col">
        {/* Logo / brand */}
        <div className="px-6 py-6 border-b border-heliotrope-700">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-moss-500 flex items-center justify-center text-white font-bold text-sm">
              K
            </span>
            <div>
              <p className="font-heading font-bold text-sm text-white leading-tight">KAO Society</p>
              <p className="text-heliotrope-300 text-xs">Administration</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-heliotrope-200 hover:bg-heliotrope-700 hover:text-white transition-colors duration-150 group"
            >
              <span className="text-heliotrope-400 group-hover:text-moss-400 transition-colors">
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer: logged-in user */}
        <div className="px-4 py-4 border-t border-heliotrope-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-moss-600 flex items-center justify-center text-white text-xs font-bold uppercase">
              {session.user?.name?.[0] ?? session.user?.email?.[0] ?? "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-white truncate">
                {session.user?.name ?? "Admin"}
              </p>
              <p className="text-xs text-heliotrope-400 truncate">
                {session.user?.email}
              </p>
            </div>
          </div>
          <Link
            href="/api/auth/signout"
            className="mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-heliotrope-300 hover:bg-heliotrope-700 hover:text-white transition-colors text-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-lavender-200 px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-heliotrope-500 font-medium uppercase tracking-wider">
              KAO Society — Admin
            </p>
          </div>
          <Link
            href="/"
            className="text-xs text-heliotrope-600 hover:text-heliotrope-800 transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Voir le site
          </Link>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
