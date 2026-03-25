import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Mountain, Anchor, TreePine, Dumbbell, UtensilsCrossed } from "lucide-react";
import type { Metadata } from "next";

import prisma from "@/lib/prisma";
import EventCard from "@/components/events/EventCard";
import { type EventCategory } from "@/lib/utils";

// ─── Activity config ───────────────────────────────────────────────────────────

interface ActivityConfig {
  label: string;
  description: string;
  category: EventCategory;
  Icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgGradient: string;
}

const ACTIVITY_MAP: Record<string, ActivityConfig> = {
  randonnee: {
    label: "Randonnée",
    description:
      "Explorez les sentiers de montagne, les forêts et les paysages sauvages lors de nos sorties randonnée. Tous les niveaux sont bienvenus, des promenades tranquilles aux treks exigeants.",
    category: "RANDONNEE",
    Icon: Mountain,
    iconColor: "text-green-700",
    bgGradient: "from-green-400 to-moss-500",
  },
  escalade: {
    label: "Escalade",
    description:
      "Montez en falaise ou en salle d'escalade, progressez à votre rythme et partagez la passion du grimpe avec une communauté bienveillante.",
    category: "ESCALADE",
    Icon: Anchor,
    iconColor: "text-heliotrope-700",
    bgGradient: "from-heliotrope-400 to-heliotrope-600",
  },
  outdoor: {
    label: "Outdoor",
    description:
      "Bivouacs, sorties kayak, via ferrata ou simplement découvrir la nature — l'outdoor chez KAO, c'est l'aventure en plein air sous toutes ses formes.",
    category: "OUTDOOR",
    Icon: TreePine,
    iconColor: "text-moss-700",
    bgGradient: "from-moss-400 to-moss-600",
  },
  indoor: {
    label: "Indoor",
    description:
      "Sessions sport en salle, yoga, escalade indoor ou cours collectifs — restez actif toute l'année avec nos événements indoor.",
    category: "INDOOR",
    Icon: Dumbbell,
    iconColor: "text-blue-700",
    bgGradient: "from-blue-400 to-blue-600",
  },
  "eat-and-meet": {
    label: "Eat & Meet",
    description:
      "Partagez un repas, un café ou un apéro en bonne compagnie. Les rencontres Eat & Meet sont l'occasion idéale de tisser des liens avec la communauté.",
    category: "EAT_AND_MEET",
    Icon: UtensilsCrossed,
    iconColor: "text-orange-700",
    bgGradient: "from-orange-400 to-orange-600",
  },
};

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getEventsForCategory(category: EventCategory) {
  try {
    return await prisma.event.findMany({
      where: {
        isPublished: true,
        category,
        date: { gte: new Date() },
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

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const activity = ACTIVITY_MAP[params.slug];
  if (!activity) return { title: "Activité introuvable | KAO Society" };
  return {
    title: `${activity.label} | KAO Society`,
    description: activity.description,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ActivityPage({
  params,
}: {
  params: { slug: string };
}) {
  const activity = ACTIVITY_MAP[params.slug];
  if (!activity) notFound();

  const { label, description, category, Icon, iconColor, bgGradient } = activity;
  const events = await getEventsForCategory(category);

  return (
    <>
      {/* ── Back link ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-lavender-200">
        <div className="section py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-heliotrope-600 hover:text-moss-600 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className={`py-20 bg-gradient-to-br ${bgGradient} relative overflow-hidden`}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-black/10 blur-3xl" />
        </div>
        <div className="section relative">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Icon */}
            <div className="w-20 h-20 shrink-0 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Icon className="h-10 w-10 text-white" />
            </div>
            {/* Text */}
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-black text-white mb-4">
                {label}
              </h1>
              <p className="text-white/85 text-lg max-w-2xl leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Upcoming events ───────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="section">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-black text-heliotrope-600 mb-1">
                Prochains événements
              </h2>
              <p className="text-gray-500 text-sm">
                {events.length > 0
                  ? `${events.length} événement${events.length !== 1 ? "s" : ""} à venir en ${label.toLowerCase()}`
                  : `Aucun événement ${label.toLowerCase()} prévu pour le moment`}
              </p>
            </div>
            <Link
              href={`/evenements?category=${category}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-heliotrope-600 hover:text-moss-600 transition-colors shrink-0"
            >
              Tous les événements
              <CalendarDays className="h-4 w-4" />
            </Link>
          </div>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <Icon className={`h-14 w-14 ${iconColor} opacity-30 mb-4`} />
              <p className="font-heading font-bold text-heliotrope-600 text-xl mb-2">
                Aucun événement à venir
              </p>
              <p className="text-gray-500 text-sm max-w-xs">
                De nouvelles sorties {label.toLowerCase()} arrivent bientôt — revenez vite !
              </p>
              <Link
                href="/evenements"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-heliotrope-600 hover:underline"
              >
                Voir tous les événements
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
