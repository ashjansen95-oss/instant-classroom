import type { Plan } from "@/lib/types";

/**
 * The monetisation seam. Nothing is gated in the MVP — a paywall during the
 * hypothesis test would contaminate the retention signal we're measuring — but
 * the shape is here so gating becomes a one-line change later. See FUTURE.md.
 */

export interface Entitlements {
  plan: Plan;
  activityLimit: number | null;
  advancedFilters: boolean;
  studentMode: boolean;
  aiGeneration: boolean;
}

const FREE: Entitlements = {
  plan: "free",
  activityLimit: null,
  advancedFilters: true,
  studentMode: false,
  aiGeneration: false,
};

const PRO: Entitlements = {
  plan: "pro",
  activityLimit: null,
  advancedFilters: true,
  studentMode: true,
  aiGeneration: true,
};

export function entitlementsFor(plan: Plan): Entitlements {
  return plan === "pro" ? PRO : FREE;
}

export const PRICING = {
  monthly: { amount: 5.99, label: "$5.99", period: "per month" },
  annual: { amount: 49, label: "$49", period: "per year", note: "Best value" },
} as const;
