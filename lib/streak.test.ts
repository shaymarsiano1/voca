import assert from "node:assert/strict";
import test from "node:test";
import { computeStreak, shiftIsoDate } from "./streak";

test("shifts across month boundaries", () => {
  assert.equal(shiftIsoDate("2026-10-01", -1), "2026-09-30");
});

test("counts today and contiguous days behind it", () => {
  assert.equal(computeStreak(["2026-10-17", "2026-10-18", "2026-10-19"], "2026-10-19"), 3);
});

test("keeps yesterday's streak before today's session is finished", () => {
  assert.equal(computeStreak(["2026-10-18", "2026-10-17"], "2026-10-19"), 2);
});

test("stops at the first gap", () => {
  assert.equal(computeStreak(["2026-10-19", "2026-10-18", "2026-10-16"], "2026-10-19"), 2);
});

test("returns zero when nothing recent is complete", () => {
  assert.equal(computeStreak(["2026-10-10"], "2026-10-19"), 0);
});
