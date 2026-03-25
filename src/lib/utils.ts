import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";
import { fr } from "date-fns/locale";

// ─── Date Utilities ───────────────────────────────────────────────────────────

/**
 * Format a date in French using the given format string.
 * Defaults to "d MMMM yyyy" (e.g. "24 mars 2026").
 */
export function formatDate(
  date: Date | string | null | undefined,
  fmt = "d MMMM yyyy"
): string {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "";
  return format(d, fmt, { locale: fr });
}

/**
 * Format a date as a relative human-readable string in French.
 * e.g. "il y a 2 jours", "dans 3 heures"
 */
export function formatRelativeDate(
  date: Date | string | null | undefined
): string {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "";
  return formatDistanceToNow(d, { locale: fr, addSuffix: true });
}

// ─── String Utilities ─────────────────────────────────────────────────────────

/**
 * Create a URL-safe slug from a French (or any) text string.
 * Handles accented characters and special characters.
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric except spaces/hyphens
    .replace(/[\s_-]+/g, "-")      // collapse whitespace/underscores to hyphens
    .replace(/^-+|-+$/g, "");      // trim leading/trailing hyphens
}

/**
 * Truncate text to a given length, appending an ellipsis when needed.
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + "…";
}

// ─── Event Category ───────────────────────────────────────────────────────────

export type EventCategory =
  | "RANDONNEE"
  | "ESCALADE"
  | "OUTDOOR"
  | "INDOOR"
  | "EAT_AND_MEET";

const CATEGORY_LABELS: Record<EventCategory, string> = {
  RANDONNEE:    "Randonnée",
  ESCALADE:     "Escalade",
  OUTDOOR:      "Outdoor",
  INDOOR:       "Indoor",
  EAT_AND_MEET: "Eat & Meet",
};

/** French display label for an event category enum value. */
export function categoryLabel(cat: EventCategory | string): string {
  return CATEGORY_LABELS[cat as EventCategory] ?? cat;
}

/**
 * Tailwind CSS background + text color classes for an event category badge.
 * Returns classes suitable for use on a <span> or <div>.
 */
export function categoryColor(cat: EventCategory | string): string {
  const map: Record<EventCategory, string> = {
    RANDONNEE:    "bg-green-100 text-green-800",
    ESCALADE:     "bg-heliotrope-100 text-heliotrope-700",
    OUTDOOR:      "bg-moss-100 text-moss-700",
    INDOOR:       "bg-blue-100 text-blue-800",
    EAT_AND_MEET: "bg-orange-100 text-orange-700",
  };
  return map[cat as EventCategory] ?? "bg-gray-100 text-gray-700";
}

// ─── Event Level ──────────────────────────────────────────────────────────────

export type EventLevel = "FACILE" | "MOYEN" | "DIFFICILE" | "EXPERT";

const LEVEL_LABELS: Record<EventLevel, string> = {
  FACILE:    "Facile",
  MOYEN:     "Moyen",
  DIFFICILE: "Difficile",
  EXPERT:    "Expert",
};

/** French display label for an event level enum value. */
export function levelLabel(level: EventLevel | string): string {
  return LEVEL_LABELS[level as EventLevel] ?? level;
}

/**
 * Tailwind CSS background + text color classes for an event level badge.
 */
export function levelColor(level: EventLevel | string): string {
  const map: Record<EventLevel, string> = {
    FACILE:    "bg-green-100 text-green-800",
    MOYEN:     "bg-yellow-100 text-yellow-800",
    DIFFICILE: "bg-orange-100 text-orange-700",
    EXPERT:    "bg-red-100 text-red-700",
  };
  return map[level as EventLevel] ?? "bg-gray-100 text-gray-700";
}

// ─── Price Formatting ─────────────────────────────────────────────────────────

/**
 * Format a price as a French currency string, or "Gratuit" when zero.
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || price === 0) return "Gratuit";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

// ─── Class Name Merging ───────────────────────────────────────────────────────

/**
 * Simple utility to join truthy class name strings.
 * For a full-featured solution, prefer `clsx` + `tailwind-merge`.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
