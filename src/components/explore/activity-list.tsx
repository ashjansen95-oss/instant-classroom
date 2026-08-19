import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ActivityMeta } from "@/components/activity/activity-meta";
import { CATEGORY_LABELS, SUBJECT_LABELS } from "@/lib/labels";
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
              {(activity.categories.length > 0 || (activity.subjects?.length ?? 0) > 0) && (
                <ul aria-label="Activity types" className="mt-2 flex flex-wrap gap-1.5">
                  {activity.subjects?.map((subject) => (
                    <li
                      key={subject}
                      className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent"
                    >
                      {SUBJECT_LABELS[subject]}
                    </li>
                  ))}
                  {activity.categories.map((cat) => (
                    <li
                      key={cat}
                      className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
                    >
                      {CATEGORY_LABELS[cat]}
                    </li>
                  ))}
                </ul>
              )}
              <ActivityMeta activity={activity} compact className="mt-3" />
            </div>
            <ChevronRight aria-hidden className="mt-1 size-5 shrink-0 text-ink-faint" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
