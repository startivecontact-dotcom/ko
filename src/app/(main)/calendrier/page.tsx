import { CalendarDays, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

import prisma from "@/lib/prisma";
import CategoryBadge from "@/components/ui/CategoryBadge";

// ─── Types ────────────────────────────────────────────────────────────────────

type EventRow = {
  id: string;
  title: string;
  slug: string;
  date: Date;
  location: string;
  category: string;
};

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getUpcomingEvents(): Promise<EventRow[]> {
  try {
    return await prisma.event.findMany({
      where: { isPublished: true, date: { gte: new Date() } },
      orderBy: { date: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        date: true,
        location: true,
        category: true,
      },
    });
  } catch {
    return [];
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupByMonth(events: EventRow[]): Map<string, EventRow[]> {
  const map = new Map<string, EventRow[]>();
  for (const event of events) {
    const key = format(event.date, "MMMM yyyy", { locale: fr });
    const group = map.get(key) ?? [];
    group.push(event);
    map.set(key, group);
  }
  return map;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = {
  title: "Calendrier | KAO Society",
  description:
    "Vue mensuelle de tous les événements à venir de la communauté KAO — randonnée, escalade, outdoor et bien plus.",
};

export default async function CalendrierPage() {
  const events = await getUpcomingEvents();
  const grouped = groupByMonth(events);

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
            Calendrier
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Tous les événements à venir, regroupés par mois. Ne manquez aucune sortie !
          </p>
        </div>
      </section>

      {/* ── Calendar content ──────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="section">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-lavender-200/40 text-center">
              <CalendarDays className="h-14 w-14 text-heliotrope-300 mb-4" />
              <p className="font-heading font-bold text-heliotrope-600 text-xl mb-2">
                Aucun événement à venir
              </p>
              <p className="text-gray-500 text-sm max-w-xs">
                De nouvelles sorties arrivent bientôt — revenez vite !
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {Array.from(grouped.entries()).map(([monthLabel, monthEvents]) => (
                <div key={monthLabel}>
                  {/* Month heading */}
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="font-heading text-2xl font-black text-heliotrope-600 capitalize">
                      {monthLabel}
                    </h2>
                    <div className="flex-1 h-px bg-lavender-200" />
                    <span className="text-sm text-gray-400 shrink-0">
                      {monthEvents.length} événement{monthEvents.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Events list */}
                  <div className="space-y-3">
                    {monthEvents.map((event) => {
                      const dayNum = format(event.date, "d", { locale: fr });
                      const dayName = format(event.date, "EEE", { locale: fr });
                      const timeStr = format(event.date, "HH:mm", { locale: fr });

                      return (
                        <Link
                          key={event.id}
                          href={`/evenements/${event.slug}`}
                          className="group flex items-center gap-4 rounded-2xl border border-lavender-200 bg-lavender-200/20 p-4 transition-all duration-200 hover:bg-lavender-200/60 hover:border-heliotrope-300 hover:-translate-y-0.5 hover:shadow-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heliotrope-500"
                        >
                          {/* Date block */}
                          <div className="flex flex-col items-center justify-center w-14 h-14 shrink-0 rounded-xl bg-heliotrope-600 text-white">
                            <span className="text-xs font-semibold uppercase opacity-80">{dayName}</span>
                            <span className="text-2xl font-black leading-none">{dayNum}</span>
                          </div>

                          {/* Event info */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <h3 className="font-heading font-bold text-heliotrope-600 group-hover:text-heliotrope-500 truncate transition-colors">
                              {event.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5 text-moss-500 shrink-0" />
                                {timeStr}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-moss-500 shrink-0" />
                                <span className="truncate">{event.location}</span>
                              </span>
                            </div>
                          </div>

                          {/* Category badge */}
                          <div className="shrink-0">
                            <CategoryBadge category={event.category} />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
