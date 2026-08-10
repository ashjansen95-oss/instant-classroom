import type { Metadata } from "next";
import { Suspense } from "react";
import { HomeScreen } from "@/components/shake/home-screen";

export const metadata: Metadata = {
  title: "Instant Classroom — got 3 minutes to kill?",
};

export default function Home() {
  return (
    // useSearchParams needs a boundary for the page to stay static.
    <Suspense fallback={null}>
      <HomeScreen />
    </Suspense>
  );
}
