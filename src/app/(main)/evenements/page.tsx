import { CalendarDays, Filter } from "lucide-react";
import Link from "next/link";

import prisma from "@/lib/prisma";
import EventCard from "@/components/events/EventCard";
import CategoryBadge from "@/components/ui/CategoryBadge";
import LevelBadge from "@/components/ui/LevelBadge";
import { type EventCategory, type EventLevel, categoryLabel, levelLabel } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: EventCategory[] = ["RANDONNEE", "ESCALADE", "OUTDOOR", "INDOOR", "EAT_AND_MEET"];
const LEVELS: EventLevel[] = ["FACILE", "MOYEN", "DIFFICILE", "EXPERT"];

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getEvents(category?: string, level?: string) {
  try {
    return await prisma.event.findMany({
      where: {
        isPublished: true,
        ...(category ? { category: category as EventCategory } : {}),
        ...(level ? { level: level as EventLevel } : {}),
      },
      orderBy: { date: "asc" },
      include: {
        organizer: { select: { name: true, image: true } },
        _count: { select: { registrations: true } },
      },
    });
  } catch {
    return [];
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = {
  title: "Événements | KAO Society",
  description: "Découvrez tous les événements outdoor de la communauté KAO — randonnée, escalade, sorties nature et bien plus.",
};

interface PageProps {
  searchParams: { category?: string; level?: string };
}

export default async function EvenementsPage({ searchParams }: PageProps) {
  const { category, level } = searchParams;

  const validCategory = CATEGORIES.includes(category as EventCategory) ? category : undefined;
  const validLevel = LEVELS.includes(level as EventLevel) ? level : undefined;

  const events = await getEvents(validCategory, validLevel);

  const buildUrl = (params: { category?: string; level?: string }) => {
    const qs = new URLSearchParams();
    if (params.category) qs.set("category", params.category);
    if (params.level) qs.set("level", params.level);
    const str = qs.toString();
    return str ? `/evenements?${str}` : "/evenements";
  };

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-heliotrope-600 via-heliotrope-700 to-moss-600 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-moss-400/20 blur-3xl" />
        </div>
        <div className="section relative text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-black text-white mb-4">
            Nos événements
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Rejoignez la communauté lors de nos prochaines sorties, sessions et rencontres.
          </p>
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <section className="py-12 bg-white">
        <div className="section">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Sidebar filters ─────────────────────────────────────────── */}
            <aside className="w-full lg:w-64 shrink-0">
              <div className="rounded-2xl border border-lavender-200 bg-lavender-200/40 p-6 sticky top-24">
                <div className="flex items-center gap-2 mb-5">
                  <Filter className="h-4 w-4 text-heliotrope-600" />
                  <h2 className="font-heading font-bold text-heliotrope-600">Filtres</h2>
                </div>

                {/* Category filter */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Catégorie
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <Link
                      href={buildUrl({ level: validLevel })}
                      className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                        !validCategory
                          ? "bg-heliotrope-600 text-white font-semibold"
                          : "text-gray-600 hover:bg-lavender-200"
                      }`}
                    >
                      Toutes les catégories
                    </Link>
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat}
                        href={buildUrl({ category: cat, level: validLevel })}
                        className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                          validCategory === cat
                            ? "bg-heliotrope-600 text-white font-semibold"
                            : "text-gray-600 hover:bg-lavender-200"
                        }`}
                      >
                        <CategoryBadge category={cat} showIcon={false} />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Level filter */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Niveau
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <Link
                      href={buildUrl({ category: validCategory })}
                      className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                        !validLevel
                          ? "bg-heliotrope-600 text-white font-semibold"
                          : "text-gray-600 hover:bg-lavender-200"
                      }`}
                    >
                      Tous les niveaux
                    </Link>
                    {LEVELS.map((lvl) => (
                      <Link
                        key={lvl}
                        href={buildUrl({ category: validCategory, level: lvl })}
                        className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                          validLevel === lvl
                            ? "bg-heliotrope-600 text-white font-semibold"
                            : "text-gray-600 hover:bg-lavender-200"
                        }`}
                      >
                        <LevelBadge level={lvl} showIcon={false} />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* ── Events grid ─────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Active filters */}
              {(validCategory || validLevel) && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="text-sm text-gray-500">Filtres actifs :</span>
                  {validCategory && (
                    <CategoryBadge category={validCategory} />
                  )}
                  {validLevel && (
                    <LevelBadge level={validLevel} />
                  )}
                  <Link
                    href="/evenements"
                    className="text-xs text-heliotrope-600 hover:underline ml-1"
                  >
                    Réinitialiser
                  </Link>
                </div>
              )}

              {/* Result count */}
              <p className="text-sm text-gray-500 mb-6">
                {events.length} événement{events.length !== 1 ? "s" : ""} trouvé{events.length !== 1 ? "s" : ""}
              </p>

              {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      id={event.id}
                      title={event.title}
                      slug={event.slug}
                      shortDesc={event.shortDesc}
                      date={event.date}
                      endDate={event.endDate}
                      location={event.location}
                      category={event.category}
                      level={event.level}
                      image={event.image}
                      maxParticipants={event.maxParticipants}
                      registrationCount={event._count.registrations}
                      price={event.price}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-lavender-200/40 text-center">
                  <CalendarDays className="h-14 w-14 text-heliotrope-300 mb-4" />
                  <p className="font-heading font-bold text-heliotrope-600 text-xl mb-2">
                    Aucun événement trouvé
                  </p>
                  <p className="text-gray-500 text-sm max-w-xs">
                    {validCategory || validLevel
                      ? "Essayez de modifier vos filtres pour voir plus de résultats."
                      : "De nouveaux événements arrivent bientôt — revenez vite !"}
                  </p>
                  {(validCategory || validLevel) && (
                    <Link
                      href="/evenements"
                      className="mt-4 text-sm text-heliotrope-600 hover:underline font-semibold"
                    >
                      Voir tous les événements
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
