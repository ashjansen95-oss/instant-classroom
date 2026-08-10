import type { Metadata } from "next";
import { Suspense } from "react";
import { ExploreScreen } from "@/components/explore/explore-screen";

export const metadata: Metadata = {
  title: "Explore",
  description: "Browse and filter every activity by time, energy, noise, format and year level.",
};

export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <ExploreScreen />
    </Suspense>
  );
}
