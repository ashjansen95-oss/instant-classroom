import type { Metadata } from "next";
import { Suspense } from "react";
import { ExploreScreen } from "@/components/explore/explore-screen";

export const metadata: Metadata = {
  title: "Explore",
  // Static page metadata, so it stays country-neutral rather than picking one
  // market's wording for everyone.
  description: "Browse and filter every activity by time, energy, noise, format and age group.",
};

export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <ExploreScreen />
    </Suspense>
  );
}
