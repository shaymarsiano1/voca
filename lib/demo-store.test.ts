import assert from "node:assert/strict";
import test from "node:test";
import { findBankEntry } from "./word-bank";

const memory = new Map<string, string>();

Object.defineProperty(globalThis, "window", {
  value: {
    localStorage: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
    },
  },
});

test("a demo day mixes two due words with three fresh ones", async () => {
  const { completeDemoDay, startDemoDay, toDailyResponse } = await import("./demo-store");
  const today = "2026-10-19";
  const state = startDemoDay("Distributed Systems", today);
  const daily = toDailyResponse(state, today);

  assert.equal(daily.words.length, 5);
  assert.equal(daily.words.filter((word) => word.role === "review").length, 2);
  assert.equal(daily.words.filter((word) => word.role === "new").length, 3);
  assert.equal(new Set(daily.words.map((word) => word.term.toLowerCase())).size, 5);

  const notes = Object.fromEntries(
    daily.words.map((word) => [word.term, findBankEntry(word.term)?.definition ?? ""]),
  );
  const finished = completeDemoDay("", notes, today);
  assert.equal(finished.streak, 1);
  assert.equal(finished.active?.evaluation?.results.length, 5);
  assert.ok(finished.active?.evaluation?.results.every((result) => result.verdict === "mastered"));

  const review = finished.active?.evaluation?.results.slice(0, 2) ?? [];
  const fresh = finished.active?.evaluation?.results.slice(2) ?? [];
  assert.ok(review.every((result) => result.interval_days === 8 && result.status === "learning"));
  assert.ok(fresh.every((result) => result.interval_days === 1 && result.review_label === "Will review tomorrow"));
});
