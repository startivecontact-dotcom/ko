import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Users, User, ArrowLeft, Mountain, Anchor, TreePine, Dumbbell, UtensilsCrossed } from "lucide-react";
import type { Metadata } from "next";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import prisma from "@/lib/prisma";
import CategoryBadge from "@/components/ui/CategoryBadge";
import LevelBadge from "@/components/ui/LevelBadge";
import { formatPrice, type EventCategory } from "@/lib/utils";

// ─── Category visuals ─────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  RANDONNEE:    Mountain,
  ESCALADE:     Anchor,
  OUTDOOR:      TreePine,
  INDOOR:       Dumbbell,
  EAT_AND_MEET: UtensilsCrossed,
};

const CATEGORY_BG: Record<string, string> = {
  RANDONNEE:    "from-green-200 to-green-300",
  ESCALADE:     "from-heliotrope-200 to-heliotrope-300",
  OUTDOOR:      "from-moss-200 to-moss-300",
  INDOOR:       "from-blue-200 to-blue-300",
  EAT_AND_MEET: "from-orange-200 to-orange-300",
};

const CATEGORY_ICON_COLOR: Record<string, string> = {
  RANDONNEE:    "text-green-700",
  ESCALADE:     "text-heliotrope-700",
  OUTDOOR:      "text-moss-700",
  INDOOR:       "text-blue-700",
  EAT_AND_MEET: "text-orange-700",
};

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getEvent(slug: string) {
  try {
    return await prisma.event.findUnique({
      where: { slug },
      include: {
        organizer: { select: { name: true, image: true } },
        _count: { select: { registrations: true } },
      },
    });
  } catch {
    return null;
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const event = await getEvent(params.slug);
  if (!event) return { title: "Événement introuvable | KAO Society" };
  return {
    title: `${event.title} | KAO Society`,
    description: event.shortDesc ?? event.description.slice(0, 160),
    openGraph: event.image ? { images: [event.image] } : undefined,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function EventDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const event = await getEvent(params.slug);

  if (!event || !event.isPublished) notFound();

  const PlaceholderIcon = CATEGORY_ICONS[event.category] ?? Mountain;
  const bgGradient = CATEGORY_BG[event.category] ?? "from-lavender-200 to-lavender-300";
  const iconColor = CATEGORY_ICON_COLOR[event.category] ?? "text-heliotrope-600";

  const registrationCount = event._count.registrations;
  const participantPercent =
    event.maxParticipants && event.maxParticipants > 0
      ? Math.min(100, Math.round((registrationCount / event.maxParticipants) * 100))
      : null;
  const isFull = participantPercent !== null && participantPercent >= 100;
  const isAlmostFull = participantPercent !== null && participantPercent >= 80 && !isFull;

  const formattedDate = format(event.date, "EEEE d MMMM yyyy", { locale: fr });
  const formattedTime = format(event.date, "HH:mm", { locale: fr });
  const formattedEndDate = event.endDate
    ? format(event.endDate, "d MMMM yyyy", { locale: fr })
    : null;

  const priceLabel = formatPrice(event.price ?? 0);

  return (
    <>
      {/* ── Back link ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-lavender-200">
        <div className="section py-3">
          <Link
            href="/evenements"
            className="inline-flex items-center gap-1.5 text-sm text-heliotrope-600 hover:text-moss-600 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux événements
          </Link>
        </div>
      </div>

      {/* ── Hero image ────────────────────────────────────────────────────── */}
      <div className="relative h-72 md:h-96 w-full overflow-hidden bg-lavender-200">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${bgGradient}`}>
            <PlaceholderIcon className={`h-24 w-24 opacity-30 ${iconColor}`} />
          </div>
        )}
        {/* Price badge */}
        <div className="absolute top-4 right-4">
          <span
            className={`rounded-full px-4 py-1.5 text-sm font-bold shadow-lg ${
              priceLabel === "Gratuit"
                ? "bg-moss-500 text-white"
                : "bg-heliotrope-600 text-white"
            }`}
          >
            {priceLabel}
          </span>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <section className="py-12 bg-white">
        <div className="section">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ── Left: details ──────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-8">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={event.category} />
                <LevelBadge level={event.level} />
              </div>

              {/* Title */}
              <h1 className="font-heading text-3xl md:text-4xl font-black text-heliotrope-600 leading-tight">
                {event.title}
              </h1>

              {/* Short desc */}
              {event.shortDesc && (
                <p className="text-lg text-gray-600 leading-relaxed border-l-4 border-heliotrope-300 pl-4">
                  {event.shortDesc}
                </p>
              )}

              {/* Description */}
              <div>
                <h2 className="font-heading font-bold text-xl text-heliotrope-600 mb-4">
                  Description
                </h2>
                <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                  {event.description}
                </div>
              </div>
            </div>

            {/* ── Right: info card ───────────────────────────────────────── */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-lavender-200 bg-lavender-200/30 p-6 space-y-5">
                <h2 className="font-heading font-bold text-heliotrope-600 text-lg border-b border-lavender-200 pb-3">
                  Informations pratiques
                </h2>

                {/* Date */}
                <div className="flex items-start gap-3">
                  <CalendarDays className="h-5 w-5 text-moss-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700 capitalize">{formattedDate}</p>
                    <p className="text-sm text-gray-500">à {formattedTime}</p>
                    {formattedEndDate && (
                      <p className="text-xs text-gray-400 mt-0.5">Jusqu&apos;au {formattedEndDate}</p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-moss-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-700">{event.location}</p>
                </div>

                {/* Participants */}
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-moss-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    {event.maxParticipants ? (
                      <>
                        <p className="text-sm text-gray-700">
                          {registrationCount} / {event.maxParticipants} participants
                        </p>
                        {participantPercent !== null && (
                          <>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-lavender-300 mt-2">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isFull
                                    ? "bg-red-500"
                                    : isAlmostFull
                                    ? "bg-orange-400"
                                    : "bg-moss-500"
                                }`}
                                style={{ width: `${participantPercent}%` }}
                              />
                            </div>
                            {isFull && (
                              <p className="text-xs font-semibold text-red-600 mt-1">Complet</p>
                            )}
                            {isAlmostFull && (
                              <p className="text-xs font-semibold text-orange-500 mt-1">Presque complet</p>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-700">{registrationCount} inscrit{registrationCount !== 1 ? "s" : ""}</p>
                    )}
                  </div>
                </div>

                {/* Organizer */}
                <div className="flex items-center gap-3 border-t border-lavender-200 pt-4">
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-lavender-300">
                    {event.organizer.image ? (
                      <Image
                        src={event.organizer.image}
                        alt={event.organizer.name ?? "Organisateur"}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-4 w-4 text-heliotrope-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Organisé par</p>
                    <p className="text-sm font-semibold text-heliotrope-600">
                      {event.organizer.name ?? "KAO Society"}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              {isFull ? (
                <div className="w-full rounded-xl bg-gray-100 px-6 py-4 text-center text-gray-500 font-semibold">
                  Événement complet
                </div>
              ) : (
                <Link
                  href="/auth/connexion"
                  className="block w-full rounded-xl bg-heliotrope-600 px-6 py-4 text-center font-heading font-bold text-white shadow-brand transition-all duration-200 hover:bg-heliotrope-700 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-heliotrope-600"
                >
                  S&apos;inscrire à cet événement
                </Link>
              )}

              <p className="text-xs text-center text-gray-400">
                Vous devez être connecté·e pour vous inscrire.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
