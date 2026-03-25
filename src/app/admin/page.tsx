import prisma from "@/lib/prisma";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  CANCELLED: "Annulé",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-moss-100 text-moss-700",
  CANCELLED: "bg-red-100 text-red-600",
};

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-brand p-6 flex items-center gap-5">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-heading font-bold text-heliotrope-800">{value}</p>
        <p className="text-sm text-heliotrope-500">{label}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const [totalUsers, upcomingEvents, publishedPosts, totalRegistrations, recentRegistrations] =
    await Promise.all([
      prisma.user.count(),
      prisma.event.count({
        where: { isPublished: true, date: { gte: new Date() } },
      }),
      prisma.post.count({ where: { published: true } }),
      prisma.registration.count(),
      prisma.registration.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          event: { select: { title: true } },
        },
      }),
    ]);

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-heliotrope-800">
          Tableau de bord
        </h1>
        <p className="text-sm text-heliotrope-500 mt-1">
          Vue d&apos;ensemble de la plateforme KAO Society
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          label="Membres inscrits"
          value={totalUsers}
          color="bg-heliotrope-100 text-heliotrope-600"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="Événements à venir"
          value={upcomingEvents}
          color="bg-moss-100 text-moss-600"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="Articles publiés"
          value={publishedPosts}
          color="bg-lavender-200 text-heliotrope-600"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          }
        />
        <StatCard
          label="Total inscriptions"
          value={totalRegistrations}
          color="bg-amber-100 text-amber-600"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
      </div>

      {/* Recent registrations */}
      <div className="bg-white rounded-xl shadow-brand overflow-hidden">
        <div className="px-6 py-4 border-b border-lavender-200">
          <h2 className="font-heading font-semibold text-heliotrope-800">
            Inscriptions récentes
          </h2>
          <p className="text-xs text-heliotrope-400 mt-0.5">
            Les 5 dernières inscriptions aux événements
          </p>
        </div>

        {recentRegistrations.length === 0 ? (
          <div className="px-6 py-10 text-center text-heliotrope-400 text-sm">
            Aucune inscription pour le moment.
          </div>
        ) : (
          <div className="divide-y divide-lavender-100">
            {recentRegistrations.map((reg) => (
              <div
                key={reg.id}
                className="px-6 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-heliotrope-100 flex items-center justify-center text-heliotrope-600 text-xs font-bold uppercase flex-shrink-0">
                    {(reg.user?.name ?? reg.guestName ?? "?")[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-heliotrope-800 truncate">
                      {reg.user?.name ?? reg.guestName ?? "Invité"}
                    </p>
                    <p className="text-xs text-heliotrope-400 truncate">
                      {reg.event.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-heliotrope-400">
                    {formatDate(reg.createdAt)}
                  </span>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[reg.status] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {STATUS_LABELS[reg.status] ?? reg.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
