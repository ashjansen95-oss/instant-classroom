"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Search, SlidersHorizontal, X } from "lucide-react";
import { ACTIVITIES } from "@/data/activities";
import { ActivityList } from "@/components/explore/activity-list";
import { FilterSheet } from "@/components/explore/filter-sheet";
import { Button } from "@/components/ui/button";
import { Page, PageHeader } from "@/components/ui/page";
import { useCountry } from "@/hooks/use-country";
import { useExploreFilters } from "@/hooks/use-explore-filters";
import { useExploreScroll } from "@/hooks/use-explore-scroll";
import { useTeaching } from "@/hooks/use-teaching";
import { CATEGORY_LABELS } from "@/lib/labels";
import { track } from "@/lib/analytics";
import { applyFilters, countActiveFilters } from "@/lib/selection";
import type { Activity } from "@/lib/types";
import { CATEGORIES, EMPTY_FILTERS, type Category, type FilterState } from "@/lib/types";

/** Case-insensitive substring match across all searchable fields. */
function matchesSearch(activity: Activity, query: string): boolean {
  const q = query.toLowerCase();
  return (
    activity.title.toLowerCase().includes(q) ||
    activity.description.toLowerCase().includes(q) ||
    activity.tags.some((t) => t.toLowerCase().includes(q)) ||
    activity.categories.some((c) => CATEGORY_LABELS[c].toLowerCase().includes(q))
  );
}

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
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { country } = useCountry();
  const { teachingLevels } = useTeaching();

  const filtered = useMemo(() => applyFilters(ACTIVITIES, filters, country), [filters, country]);

  // Apply search, then sort alphabetically by title.
  const results = useMemo(() => {
    const searched = searchQuery
      ? filtered.filter((a) => matchesSearch(a, searchQuery))
      : filtered;
    return searched.toSorted((a, b) => a.title.localeCompare(b.title));
  }, [filtered, searchQuery]);

  const activeCount = countActiveFilters(filters);

  useExploreScroll();

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

  // Track scroll position on `[data-scroll-container]` for the jump-to-top FAB.
  useEffect(() => {
    const container = document.querySelector<HTMLElement>("[data-scroll-container]");
    if (!container) return;

    const onScroll = () => setShowScrollTop(container.scrollTop > 400);
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    const container = document.querySelector<HTMLElement>("[data-scroll-container]");
    container?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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

      {/* Search bar */}
      <div className="relative mb-4">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-faint"
        />
        <input
          ref={searchRef}
          type="search"
          placeholder="Search activities…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 w-full rounded-xl border-2 border-line bg-surface pl-11 pr-10 text-[0.9375rem] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setSearchQuery("");
              searchRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-ink-muted hover:bg-surface-sunk"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="mt-12 text-center">
          <p aria-hidden className="text-5xl">
            🔍
          </p>
          <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-balance">
            {searchQuery
              ? "No activities match that search."
              : "That’s a very specific class. 😂"}
          </h2>
          <p className="mt-2 text-ink-muted text-pretty">
            {searchQuery
              ? "Try a different word — activity names, descriptions, and tags are all searched."
              : "Nothing matches all of that. Try loosening one of your filters."}
          </p>
          {searchQuery ? (
            <Button
              size="lg"
              className="mt-6"
              onClick={() => {
                setSearchQuery("");
                searchRef.current?.focus();
              }}
            >
              Clear search
            </Button>
          ) : (
            <Button size="lg" className="mt-6" onClick={() => updateFilters(EMPTY_FILTERS)}>
              Clear filters
            </Button>
          )}
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

      {/* Jump to top FAB */}
      {showScrollTop && (
        <button
          type="button"
          aria-label="Scroll to top"
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 z-30 grid size-12 place-items-center rounded-full border-2 border-line bg-surface text-ink shadow-lg transition-transform active:scale-95"
        >
          <ArrowUp className="size-5" />
        </button>
      )}
    </Page>
  );
}
