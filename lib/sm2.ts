import type { Verdict, WordStatus } from "@/lib/types";

export type Sm2State = {
  repetitions: number;
  interval_days: number;
  ease_factor: number;
  status: WordStatus;
};

export type Sm2Update = Sm2State & {
  next_review_at: string;
  last_reviewed_at: string;
};

function addUtcDays(date: Date, days: number) {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function applySm2(word: Sm2State, verdict: Verdict, now = new Date()): Sm2Update {
  const ease = Number.isFinite(word.ease_factor) && word.ease_factor > 0 ? word.ease_factor : 2.5;
  const last_reviewed_at = now.toISOString();

  if (verdict === "mastered") {
    const repetitions = word.repetitions + 1;
    let interval_days = 1;
    if (repetitions === 2) interval_days = 3;
    if (repetitions > 2) {
      interval_days = Math.max(1, Math.round(word.interval_days * ease));
    }
    return {
      repetitions,
      interval_days,
      ease_factor: ease,
      status: repetitions >= 4 ? "mastered" : "learning",
      next_review_at: addUtcDays(now, interval_days).toISOString(),
      last_reviewed_at,
    };
  }

  return {
    repetitions: 0,
    interval_days: 1,
    ease_factor: ease,
    status: "learning",
    next_review_at: addUtcDays(now, 1).toISOString(),
    last_reviewed_at,
  };
}

export function reviewLabel(intervalDays: number) {
  if (intervalDays <= 1) return "Will review tomorrow";
  return `Scheduled in ${intervalDays} days`;
}
