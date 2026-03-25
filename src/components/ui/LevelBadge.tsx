import { levelColor, levelLabel, type EventLevel } from "@/lib/utils";
import { ChevronUp } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LevelBadgeProps {
  level: EventLevel | string;
  /** Show the level icon alongside the label. Defaults to true. */
  showIcon?: boolean;
  /** Additional CSS classes to merge onto the badge element. */
  className?: string;
}

// ─── Dot indicator count per level ───────────────────────────────────────────

const LEVEL_DOTS: Record<string, number> = {
  FACILE:    1,
  MOYEN:     2,
  DIFFICILE: 3,
  EXPERT:    4,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function LevelBadge({
  level,
  showIcon = true,
  className = "",
}: LevelBadgeProps) {
  const colorClasses = levelColor(level);
  const label = levelLabel(level);
  const dots = LEVEL_DOTS[level] ?? 1;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClasses} ${className}`}
    >
      {showIcon && (
        <span className="flex items-center gap-0.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className={`block h-1.5 w-1.5 rounded-full transition-opacity ${
                i < dots ? "opacity-100" : "opacity-25"
              }`}
              style={{ backgroundColor: "currentColor" }}
            />
          ))}
        </span>
      )}
      {label}
    </span>
  );
}
