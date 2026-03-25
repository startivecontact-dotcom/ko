import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  MapPin,
  Users,
  Mountain,
  Anchor,
  TreePine,
  Dumbbell,
  UtensilsCrossed,
} from "lucide-react";

import CategoryBadge from "@/components/ui/CategoryBadge";
import LevelBadge from "@/components/ui/LevelBadge";
import { formatDate, formatPrice, type EventCategory, type EventLevel } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventCardProps {
  id: string;
  title: string;
  slug: string;
  shortDesc?: string | null;
  date: Date | string;
  endDate?: Date | string | null;
  location: string;
  category: EventCategory | string;
  level: EventLevel | string;
  image?: string | null;
  maxParticipants?: number | null;
  registrationCount?: number;
  price?: number | null;
}

// ─── Category placeholder icons ───────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function EventCard({
  id,
  title,
  slug,
  shortDesc,
  date,
  endDate,
  location,
  category,
  level,
  image,
  maxParticipants,
  registrationCount = 0,
  price,
}: EventCardProps) {
  const PlaceholderIcon = CATEGORY_ICONS[category] ?? Mountain;
  const bgGradient = CATEGORY_BG[category] ?? "from-lavender-200 to-lavender-300";
  const iconColor = CATEGORY_ICON_COLOR[category] ?? "text-heliotrope-600";

  const participantPercent =
    maxParticipants && maxParticipants > 0
      ? Math.min(100, Math.round((registrationCount / maxParticipants) * 100))
      : null;

  const isFull = participantPercent !== null && participantPercent >= 100;
  const isAlmostFull = participantPercent !== null && participantPercent >= 80 && !isFull;

  const progressColor = isFull
    ? "bg-red-500"
    : isAlmostFull
    ? "bg-orange-400"
    : "bg-moss-500";

  const priceLabel = formatPrice(price ?? 0);

  return (
    <Link
      href={`/evenements/${id}`}
      className="group block rounded-2xl bg-white shadow-brand overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heliotrope-500 focus-visible:ring-offset-2"
      aria-label={`Voir l'événement : ${title}`}
    >
      {/* ── Image / Placeholder ──────────────────────────────────────────── */}
      <div className="relative h-48 w-full overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${bgGradient}`}
          >
            <PlaceholderIcon className={`h-16 w-16 opacity-50 ${iconColor}`} />
          </div>
        )}

        {/* Price badge (top-right) */}
        <div className="absolute right-3 top-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold shadow ${
              priceLabel === "Gratuit"
                ? "bg-moss-500 text-white"
                : "bg-heliotrope-600 text-white"
            }`}
          >
            {priceLabel}
          </span>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 p-4">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <CategoryBadge category={category} />
          <LevelBadge level={level} />
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 font-heading text-base font-bold leading-snug text-heliotrope-600 transition-colors group-hover:text-heliotrope-500">
          {title}
        </h3>

        {/* Short description */}
        {shortDesc && (
          <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">
            {shortDesc}
          </p>
        )}

        {/* Meta: date & location */}
        <div className="flex flex-col gap-1.5 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 shrink-0 text-moss-500" />
            <span>
              {formatDate(date, "EEEE d MMMM yyyy")}
              {endDate && ` → ${formatDate(endDate, "d MMMM")}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0 text-moss-500" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>

        {/* Participants progress bar */}
        {maxParticipants && participantPercent !== null && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {registrationCount} / {maxParticipants} participants
              </span>
              {isFull && (
                <span className="font-semibold text-red-600">Complet</span>
              )}
              {isAlmostFull && (
                <span className="font-semibold text-orange-500">Presque complet</span>
              )}
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all ${progressColor}`}
                style={{ width: `${participantPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
