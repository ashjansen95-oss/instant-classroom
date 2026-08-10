import {
  ENERGY_LABELS,
  FORMAT_LABELS,
  MOVEMENT_LABELS,
  NOISE_LABELS,
  equipmentSummary,
  formatDuration,
  yearLevelSummary,
} from "@/lib/labels";
import type { Activity } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The at-a-glance strip. A teacher should be able to rule an activity in or out
 * from this alone, without reading the description.
 */
export function ActivityMeta({
  activity,
  compact,
  className,
}: {
  activity: Activity;
  compact?: boolean;
  className?: string;
}) {
  const items = [
    { icon: "⏱", label: formatDuration(activity.duration), sr: "Duration" },
    { icon: "⚡", label: ENERGY_LABELS[activity.energy], sr: "Energy" },
    { icon: "📢", label: NOISE_LABELS[activity.noise], sr: "Noise" },
    { icon: "👥", label: FORMAT_LABELS[activity.format], sr: "Format" },
    { icon: "🎒", label: equipmentSummary(activity.equipment), sr: "Equipment" },
  ];

  if (!compact) {
    items.push(
      { icon: "🧍", label: MOVEMENT_LABELS[activity.movement], sr: "Movement" },
      { icon: "🎓", label: yearLevelSummary(activity.yearLevels), sr: "Year levels" },
    );
  }

  return (
    <ul className={cn("flex flex-wrap gap-x-2 gap-y-2", className)}>
      {items.map((item) => (
        <li
          key={item.sr}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-surface-sunk px-3 py-1.5 font-semibold text-ink-muted",
            compact ? "text-xs" : "text-[0.8125rem]",
          )}
        >
          <span aria-hidden>{item.icon}</span>
          <span className="sr-only">{item.sr}: </span>
          {item.label}
        </li>
      ))}
    </ul>
  );
}
