import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ACTIVITIES, getActivity } from "@/data/activities";
import { ActivityScreen } from "@/components/activity/activity-screen";
import { formatDuration } from "@/lib/labels";

/** Every activity is a static page — nothing to fetch, nothing to wait for. */
export function generateStaticParams() {
  return ACTIVITIES.map((activity) => ({ id: activity.id }));
}

export async function generateMetadata(
  props: PageProps<"/activity/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const activity = getActivity(id);
  if (!activity) return { title: "Activity not found" };

  return {
    title: activity.title,
    description: `${activity.description} ${formatDuration(activity.duration)}.`,
  };
}

export default async function ActivityPage(props: PageProps<"/activity/[id]">) {
  const { id } = await props.params;
  const activity = getActivity(id);
  if (!activity) notFound();

  return (
    // useSearchParams needs a Suspense boundary to keep the page static.
    <Suspense fallback={null}>
      <ActivityScreen activity={activity} />
    </Suspense>
  );
}
