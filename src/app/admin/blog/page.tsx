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

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        likes: true,
        createdAt: true,
        author: { select: { name: true, email: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.post.count(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-heliotrope-800">
            Blog
          </h1>
          <p className="text-sm text-heliotrope-500 mt-1">
            {total} article{total !== 1 ? "s" : ""} au total
          </p>
        </div>
        <Link
          href="/blog/nouveau"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-heliotrope-600 text-white text-sm font-medium hover:bg-heliotrope-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouvel article
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
                  Auteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Likes
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Commentaires
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Publié le
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lavender-100">
              {posts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-heliotrope-400"
                  >
                    Aucun article trouvé.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-lavender-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-heliotrope-800 truncate max-w-[220px]">
                        {post.title}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-heliotrope-100 flex items-center justify-center text-heliotrope-600 text-xs font-bold uppercase flex-shrink-0">
                          {(post.author.name ?? post.author.email)[0]}
                        </div>
                        <span className="text-sm text-heliotrope-600 truncate max-w-[120px]">
                          {post.author.name ?? post.author.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {post.published ? (
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
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm text-heliotrope-600">
                        <svg className="w-4 h-4 text-heliotrope-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {post.likes}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm text-heliotrope-600">
                        <svg className="w-4 h-4 text-heliotrope-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {post._count.comments}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-heliotrope-500">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-xs font-medium text-heliotrope-500 hover:text-heliotrope-700 transition-colors"
                        >
                          Voir
                        </Link>
                        <Link
                          href={`/admin/blog/${post.id}`}
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
              Page {page} sur {totalPages} — {total} articles
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/blog?page=${page - 1}`}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-lavender-300 text-heliotrope-600 hover:bg-lavender-50 transition-colors"
                >
                  Précédent
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/blog?page=${page + 1}`}
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
