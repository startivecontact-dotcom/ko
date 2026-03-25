import { categoryColor, categoryLabel, type EventCategory } from "@/lib/utils";
import {
  Mountain,
  Anchor,
  TreePine,
  Dumbbell,
  UtensilsCrossed,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryBadgeProps {
  category: EventCategory | string;
  /** Show the category icon alongside the label. Defaults to true. */
  showIcon?: boolean;
  /** Additional CSS classes to merge onto the badge element. */
  className?: string;
}

// ─── Icon Map ─────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  RANDONNEE:    Mountain,
  ESCALADE:     Anchor,
  OUTDOOR:      TreePine,
  INDOOR:       Dumbbell,
  EAT_AND_MEET: UtensilsCrossed,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CategoryBadge({
  category,
  showIcon = true,
  className = "",
}: CategoryBadgeProps) {
  const Icon = CATEGORY_ICONS[category];
  const colorClasses = categoryColor(category);
  const label = categoryLabel(category);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClasses} ${className}`}
    >
      {showIcon && Icon && <Icon className="h-3 w-3 shrink-0" />}
      {label}
    </span>
  );
}
