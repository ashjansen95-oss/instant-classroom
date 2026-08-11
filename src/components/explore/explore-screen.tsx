"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { ACTIVITIES } from "@/data/activities";
import { ActivityList } from "@/components/explore/activity-list";
import { FilterSheet } from "@/components/explore/filter-sheet";
import { Button } from "@/components/ui/button";
import { Page, PageHeader } from "@/components/ui/page";
import { useCountry } from "@/hooks/use-country";
import { useExploreFilters } from "@/hooks/use-explore-filters";
import { useTeaching } from "@/hooks/use-teaching";
import { track } from "@/lib/analytics";
import { applyFilters, countActiveFilters } from "@/lib/selection";
import { CATEGORIES, EMPTY_FILTERS, type Category, type FilterState } from "@/lib/types";

export function ExploreScreen() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const { storedFilters, setFilters: setStoredFilters } = useExploreFilters();
  const filters: FilterState = useMemo(
    () =>
      storedFilters ??
      (CATEGORIES.includes(initialCategory as Category)
        ? { ...EMPTY_FILTERS, categories: [initialCategory as Category] }
        : EMPTY_FILTERS),
    [storedFilters, initialCategory],
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  const { country } = useCountry();
  const { teachingLevels } = useTeaching();
  const results = useMemo(() => applyFilters(ACTIVITIES, filters, country), [filters, country]);
  const activeCount = countActiveFilters(filters);

  useEffect(() => {
    track("page_view", { path: "/explore" });
  }, []);

  // Once, the first time the teacher's own levels are known: pre-select them,
  // so a Year 8/9 teacher lands on activities that actually suit Year 8/9
  // rather than the whole library, Prep included. `teachingLevels` reads as
  // empty until localStorage has hydrated, so this can't be a plain lazy
  // initial state — it has to wait for that value to actually arrive.
  // `storedFilters` being non-null — whether from this effect, a deliberate
  // choice, or a Back navigation that restored an earlier one — means this
  // has already run or been overtaken, so it never fights a real choice.
  useEffect(() => {
    if (storedFilters !== null || teachingLevels.length === 0) return;
    setStoredFilters({ ...filters, levels: teachingLevels });
    // `filters` intentionally excluded: it's derived from `storedFilters`,
    // which is already a dependency, and including it would re-run this on
    // every filter change instead of just the one time it's meant to fire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedFilters, teachingLevels, setStoredFilters]);

  const updateFilters = (next: FilterState) => {
    setStoredFilters(next);
    if (countActiveFilters(next) > 0) track("filter_used", { count: countActiveFilters(next) });
  };

  return (
    <Page>
      <PageHeader
        title="Explore"
        subtitle={`${results.length} of ${ACTIVITIES.length} activities`}
        action={
          <Button
            size="md"
            variant={activeCount > 0 ? "primary" : "secondary"}
            onClick={() => setSheetOpen(true)}
            className="shrink-0"
          >
            <SlidersHorizontal aria-hidden className="size-5" />
            Filter
            {activeCount > 0 && (
              <span className="ml-0.5 rounded-full bg-primary-ink/20 px-1.5 text-xs">
                {activeCount}
              </span>
            )}
          </Button>
        }
      />

      {results.length === 0 ? (
        <div className="mt-12 text-center">
          <p aria-hidden className="text-5xl">
            🔍
          </p>
          <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-balance">
            That&rsquo;s a very specific class. 😂
          </h2>
          <p className="mt-2 text-ink-muted text-pretty">
            Nothing matches all of that. Try loosening one of your filters.
          </p>
          <Button size="lg" className="mt-6" onClick={() => updateFilters(EMPTY_FILTERS)}>
            Clear filters
          </Button>
        </div>
      ) : (
        <ActivityList activities={results} />
      )}

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        onChange={updateFilters}
        resultCount={results.length}
      />
    </Page>
  );
}
