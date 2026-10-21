import assert from "node:assert/strict";
import test from "node:test";
import { applySm2, reviewLabel } from "./sm2";

const now = new Date("2026-10-19T05:00:00.000Z");

const base = {
  repetitions: 0,
  interval_days: 1,
  ease_factor: 2.5,
  status: "new" as const,
};

test("first mastery schedules tomorrow and stays learning", () => {
  const next = applySm2(base, "mastered", now);
  assert.equal(next.repetitions, 1);
  assert.equal(next.interval_days, 1);
  assert.equal(next.status, "learning");
  assert.equal(next.next_review_at, "2026-10-20T05:00:00.000Z");
  assert.equal(reviewLabel(next.interval_days), "Will review tomorrow");
});

test("second mastery uses a 3 day interval", () => {
  const next = applySm2({ ...base, repetitions: 1, status: "learning" }, "mastered", now);
  assert.equal(next.repetitions, 2);
  assert.equal(next.interval_days, 3);
  assert.equal(next.status, "learning");
});

test("later mastery multiplies the previous interval and masters on the fourth success", () => {
  const third = applySm2(
    { repetitions: 2, interval_days: 3, ease_factor: 2.5, status: "learning" },
    "mastered",
    now,
  );
  assert.equal(third.repetitions, 3);
  assert.equal(third.interval_days, 8);
  assert.equal(third.status, "learning");

  const fourth = applySm2(
    { repetitions: 3, interval_days: 8, ease_factor: 2.5, status: "learning" },
    "mastered",
    now,
  );
  assert.equal(fourth.repetitions, 4);
  assert.equal(fourth.interval_days, 20);
  assert.equal(fourth.status, "mastered");
  assert.equal(reviewLabel(fourth.interval_days), "Scheduled in 20 days");
});

test("partial and missed reset the card to tomorrow", () => {
  for (const verdict of ["partial", "missed"] as const) {
    const next = applySm2(
      { repetitions: 4, interval_days: 20, ease_factor: 2.5, status: "mastered" },
      verdict,
      now,
    );
    assert.equal(next.repetitions, 0);
    assert.equal(next.interval_days, 1);
    assert.equal(next.status, "learning");
    assert.equal(next.ease_factor, 2.5);
  }
});
