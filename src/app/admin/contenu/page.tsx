import prisma from "@/lib/prisma";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function truncateValue(value: string, max = 80): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

const TYPE_STYLES: Record<string, string> = {
  TEXT: "bg-lavender-100 text-heliotrope-700",
  IMAGE: "bg-moss-100 text-moss-700",
  JSON: "bg-amber-100 text-amber-700",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminContenuPage() {
  const contents = await prisma.siteContent.findMany({
    orderBy: { key: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-heliotrope-800">
          Contenu du site
        </h1>
        <p className="text-sm text-heliotrope-500 mt-1">
          {contents.length} clé{contents.length !== 1 ? "s" : ""} de contenu enregistrée{contents.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-lavender-100 border border-lavender-300">
        <svg
          className="w-5 h-5 text-heliotrope-500 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-xs text-heliotrope-700 leading-relaxed">
          Ces clés de contenu sont utilisées pour gérer les textes, images et données JSON
          affichés sur le site. Modifiez les valeurs via l&apos;API ou directement en base de
          données. Les types <strong>TEXT</strong>, <strong>IMAGE</strong> (URL) et{" "}
          <strong>JSON</strong> sont supportés.
        </p>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl shadow-brand overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-lavender-200">
            <thead>
              <tr className="bg-lavender-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Clé
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Valeur (aperçu)
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-heliotrope-600 uppercase tracking-wider">
                  Dernière mise à jour
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lavender-100">
              {contents.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-sm text-heliotrope-400"
                  >
                    Aucun contenu enregistré. Les clés apparaîtront ici une fois créées.
                  </td>
                </tr>
              ) : (
                contents.map((item) => (
                  <tr key={item.id} className="hover:bg-lavender-50 transition-colors">
                    <td className="px-6 py-4">
                      <code className="text-sm font-mono font-medium text-heliotrope-800 bg-lavender-100 px-2 py-0.5 rounded">
                        {item.key}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          TYPE_STYLES[item.type] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-heliotrope-600 font-mono truncate max-w-[360px]">
                        {truncateValue(item.value)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-heliotrope-500">
                      {formatDate(item.updatedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
