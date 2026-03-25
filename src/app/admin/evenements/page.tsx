import Link from "next/link";
import prisma from "@/lib/prisma";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

const CATEGORY_LABELS: Record<string, string> = {
  RANDONNEE: "Randonnée",
  ESCALADE: "Escalade",
  OUTDOOR: "Outdoor",
  INDOOR: "Indoor",
  EAT_AND_MEET: "Eat & Meet",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminEvenementsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      skip,
      take: PAGE_SIZE,
      orderBy: { date: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        date: true,
        location: true,
        maxParticipants: true,
        isPublished: true,
        _count: { select: { registrations: true } },
      },
    }),
    prisma.event.count(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-heliotrope-800">
            Événements
          </h1>
          <p className="text-sm text-heliotrope-500 mt-1">
            {total} événement{total !== 1 ? "s" : ""} au total
          </p>
        </div>
        <Link
          href="/evenements/creer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-heliotrope-600 text-white text-sm font-medium hover:bg-heliotrope-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouvel événement
        </Link>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl shadow-brand overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-lavender-200">
            <thead>
              <tr className="bg-lavender-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Lieu
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lavender-100">
              {events.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-heliotrope-400"
                  >
                    Aucun événement trouvé.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-lavender-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-heliotrope-800 truncate max-w-[200px]">
                        {event.title}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-lavender-100 text-heliotrope-700">
                        {CATEGORY_LABELS[event.category] ?? event.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-heliotrope-600">
                      {formatDate(event.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-heliotrope-500 truncate max-w-[150px]">
                      {event.location}
                    </td>
                    <td className="px-6 py-4 text-sm text-heliotrope-600">
                      <span className={event.maxParticipants && event._count.registrations >= event.maxParticipants ? "text-red-600 font-semibold" : ""}>
                        {event._count.registrations}
                      </span>
                      {event.maxParticipants ? (
                        <span className="text-heliotrope-400"> / {event.maxParticipants}</span>
                      ) : (
                        <span className="text-heliotrope-300"> / ∞</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {event.isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-moss-100 text-moss-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-moss-500" />
                          Publié
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Brouillon
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/evenements/${event.slug}`}
                          className="text-xs font-medium text-heliotrope-500 hover:text-heliotrope-700 transition-colors"
                        >
                          Voir
                        </Link>
                        <Link
                          href={`/admin/evenements/${event.id}`}
                          className="text-xs font-medium text-heliotrope-600 hover:text-heliotrope-800 transition-colors"
                        >
                          Modifier
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-lavender-200 flex items-center justify-between">
            <p className="text-xs text-heliotrope-500">
              Page {page} sur {totalPages} — {total} événements
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/evenements?page=${page - 1}`}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-lavender-300 text-heliotrope-600 hover:bg-lavender-50 transition-colors"
                >
                  Précédent
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/evenements?page=${page + 1}`}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-heliotrope-600 text-white hover:bg-heliotrope-700 transition-colors"
                >
                  Suivant
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
