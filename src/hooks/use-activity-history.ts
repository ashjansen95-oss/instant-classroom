"use client";

import { useCallback } from "react";
import { KEYS } from "@/lib/storage";
import { pushHistory } from "@/lib/selection";
import type { Activity, Feedback, HistoryEntry } from "@/lib/types";
import { useStoredState } from "./use-stored-state";

export function useActivityHistory() {
  const [history, setHistory, loaded] = useStoredState<HistoryEntry[]>(KEYS.history, []);

  const record = useCallback(
    (activity: Activity) => setHistory((current) => pushHistory(current, activity)),
    [setHistory],
  );

  return { history, record, loaded };
}

export type FeedbackMap = Record<string, Feedback>;

export function useFeedback() {
  const [feedback, setFeedback, loaded] = useStoredState<FeedbackMap>(KEYS.feedback, {});

  const submit = useCallback(
    (id: string, value: Feedback) => {
      setFeedback((current) =>
        // Tapping the same thumb again clears it — teachers misfire on phones.
        current[id] === value
          ? Object.fromEntries(Object.entries(current).filter(([key]) => key !== id))
          : { ...current, [id]: value },
      );
    },
    [setFeedback],
  );

  return { feedback, submit, loaded };
}
