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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminMembresPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { registrations: true } },
      },
    }),
    prisma.user.count(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-heliotrope-800">
            Membres
          </h1>
          <p className="text-sm text-heliotrope-500 mt-1">
            {total} membre{total !== 1 ? "s" : ""} inscrit{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl shadow-brand overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-lavender-200">
            <thead>
              <tr className="bg-lavender-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Inscriptions
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Membre depuis
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lavender-100">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-heliotrope-400"
                  >
                    Aucun membre trouvé.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-lavender-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-heliotrope-100 flex items-center justify-center text-heliotrope-600 text-xs font-bold uppercase flex-shrink-0">
                          {(user.name ?? user.email)[0]}
                        </div>
                        <span className="text-sm font-medium text-heliotrope-800">
                          {user.name ?? <span className="text-heliotrope-400 italic">Sans nom</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-heliotrope-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.role === "ADMIN"
                            ? "bg-heliotrope-100 text-heliotrope-700"
                            : "bg-moss-100 text-moss-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-heliotrope-600">
                      {user._count.registrations}
                    </td>
                    <td className="px-6 py-4 text-sm text-heliotrope-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/membres/${user.id}`}
                        className="text-xs font-medium text-heliotrope-600 hover:text-heliotrope-800 transition-colors"
                      >
                        Voir
                      </Link>
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
              Page {page} sur {totalPages} — {total} membres
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/membres?page=${page - 1}`}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-lavender-300 text-heliotrope-600 hover:bg-lavender-50 transition-colors"
                >
                  Précédent
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/membres?page=${page + 1}`}
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
