"use client";

import { useCallback } from "react";
import { track } from "@/lib/analytics";
import { KEYS } from "@/lib/storage";
import { useStoredState } from "./use-stored-state";

export function useFavourites() {
  const [ids, setIds, loaded] = useStoredState<string[]>(KEYS.favourites, []);

  const isFavourite = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    (id: string) => {
      // Decided from current state rather than inside the updater — React may
      // defer the updater, and the event would then fire on stale information.
      const added = !ids.includes(id);
      setIds((current) =>
        current.includes(id) ? current.filter((item) => item !== id) : [id, ...current],
      );
      if (added) track("activity_favourited", { id });
      return added;
    },
    [ids, setIds],
  );

  const remove = useCallback(
    (id: string) => setIds((current) => current.filter((item) => item !== id)),
    [setIds],
  );

  return { ids, isFavourite, toggle, remove, loaded };
}
