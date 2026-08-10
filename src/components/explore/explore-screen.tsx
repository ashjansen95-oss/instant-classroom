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
import { track } from "@/lib/analytics";
import { applyFilters, countActiveFilters } from "@/lib/selection";
import { CATEGORIES, EMPTY_FILTERS, type Category, type FilterState } from "@/lib/types";

export function ExploreScreen() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [filters, setFilters] = useState<FilterState>(() =>
    CATEGORIES.includes(initialCategory as Category)
      ? { ...EMPTY_FILTERS, categories: [initialCategory as Category] }
      : EMPTY_FILTERS,
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  const { country } = useCountry();
  const results = useMemo(() => applyFilters(ACTIVITIES, filters, country), [filters, country]);
  const activeCount = countActiveFilters(filters);

  useEffect(() => {
    track("page_view", { path: "/explore" });
  }, []);

  const updateFilters = (next: FilterState) => {
    setFilters(next);
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
          <Button size="lg" className="mt-6" onClick={() => setFilters(EMPTY_FILTERS)}>
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
