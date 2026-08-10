import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ActivityMeta } from "@/components/activity/activity-meta";
import type { Activity } from "@/lib/types";

export function ActivityList({ activities }: { activities: Activity[] }) {
  return (
    <ul className="space-y-3">
      {activities.map((activity) => (
        <li key={activity.id}>
          <Link
            href={`/activity/${activity.id}`}
            className="flex items-start gap-3 rounded-2xl border-2 border-line bg-surface p-4 hover:border-line-strong"
          >
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg leading-tight font-extrabold tracking-tight text-balance">
                {activity.title}
              </h3>
              <p className="mt-1 text-[0.9375rem] text-ink-muted text-pretty">
                {activity.description}
              </p>
              <ActivityMeta activity={activity} compact className="mt-3" />
            </div>
            <ChevronRight aria-hidden className="mt-1 size-5 shrink-0 text-ink-faint" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
