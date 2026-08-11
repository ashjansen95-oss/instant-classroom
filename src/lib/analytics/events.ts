/** The full event vocabulary. Adding one here is the only way to track something. */
export const EVENT_NAMES = [
  "page_view",
  "first_activity",
  "activity_viewed",
  "activity_started",
  "activity_completed",
  "activity_skipped",
  "activity_favourited",
  "activity_feedback_positive",
  "activity_feedback_negative",
  // Added when feedback grew from a thumb to a five-point scale — "fine" is
  // real information and shouldn't be forced into one of the other two.
  "activity_feedback_neutral",
  "filter_used",
  "shake_triggered",
  "surprise_me_clicked",
  "timer_started",
  // Android/Chrome fire a real browser prompt with a real outcome. iOS Safari
  // never does — there's nothing to await there, only our own banner closing.
  "install_prompted",
  "install_prompt_dismissed",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

/**
 * Event properties are deliberately narrow. Nothing here identifies a teacher,
 * and nothing about a student can ever be attached to an event.
 */
export type EventProps = Record<string, string | number | boolean | undefined>;

export interface AnalyticsEvent {
  name: EventName;
  props: EventProps;
  at: number;
}

export interface AnalyticsSink {
  track(event: AnalyticsEvent): void;
}
