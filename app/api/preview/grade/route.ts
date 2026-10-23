import { NextResponse } from "next/server";
import { evaluateExplanations, hasOpenAI } from "@/lib/openai";
import { applySm2, reviewLabel } from "@/lib/sm2";
import type { Evaluation, WordStatus } from "@/lib/types";
import { findBankEntry, hebrewFor } from "@/lib/word-bank";

export const maxDuration = 60;

const STATUSES = new Set<WordStatus>(["new", "learning", "mastered"]);

export async function POST(request: Request) {
  if (!hasOpenAI()) {
    return NextResponse.json({ error: "OpenAI is not configured." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const record = body as {
    transcript?: unknown;
    notes?: unknown;
    words?: unknown;
  };
  if (!Array.isArray(record.words) || record.words.length === 0 || record.words.length > 5) {
    return NextResponse.json({ error: "Send today's five words." }, { status: 400 });
  }
  if (typeof record.transcript !== "string") {
    return NextResponse.json({ error: "Invalid transcript." }, { status: 400 });
  }

  const notes: Record<string, string> = {};
  if (record.notes && typeof record.notes === "object") {
    for (const [term, value] of Object.entries(record.notes)) {
      if (typeof value === "string" && term.length < 80) notes[term] = value.slice(0, 4_000);
    }
  }

  const words = [];
  for (const item of record.words) {
    if (!item || typeof item !== "object") {
      return NextResponse.json({ error: "Invalid word." }, { status: 400 });
    }
    const word = item as {
      term?: unknown;
      repetitions?: unknown;
      intervalDays?: unknown;
      easeFactor?: unknown;
      status?: unknown;
    };
    if (typeof word.term !== "string") {
      return NextResponse.json({ error: "Invalid word." }, { status: 400 });
    }
    const entry = findBankEntry(word.term);
    if (!entry) return NextResponse.json({ error: "Unknown term." }, { status: 400 });
    const status = STATUSES.has(word.status as WordStatus) ? (word.status as WordStatus) : "new";
    words.push({
      term: entry.term,
      definition: entry.definition,
      partOfSpeech: entry.partOfSpeech,
      translation: hebrewFor(entry.term),
      repetitions: typeof word.repetitions === "number" ? word.repetitions : 0,
      intervalDays: typeof word.intervalDays === "number" ? word.intervalDays : 0,
      easeFactor: typeof word.easeFactor === "number" ? word.easeFactor : 2.5,
      status,
      mnemonic: entry.mnemonic,
      scenario: entry.scenario,
    });
  }

  let model: Awaited<ReturnType<typeof evaluateExplanations>> = null;
  try {
    model = await evaluateExplanations({
      words,
      transcript: record.transcript.slice(0, 8_000),
      notes,
    });
  } catch (error) {
    console.error(error);
  }
  if (!model) {
    return NextResponse.json({ error: "The model could not grade this set." }, { status: 502 });
  }

  const now = new Date();
  const results = words.map((word) => {
    const found = model.results.find((result) => result.term.toLowerCase() === word.term.toLowerCase());
    const verdict = found?.verdict ?? "missed";
    const schedule = applySm2(
      {
        repetitions: word.repetitions,
        interval_days: word.intervalDays,
        ease_factor: word.easeFactor,
        status: word.status,
      },
      verdict,
      now,
    );
    return {
      term: word.term,
      verdict,
      user_explanation: found?.user_explanation ?? notes[word.term]?.trim() ?? "",
      feedback: found?.feedback || "לא הצלחתי לבודד הסבר למונח הזה מתוך מה שנאמר.",
      correct_definition: found?.correct_definition || word.definition,
      mnemonic_hook: found?.mnemonic_hook || word.mnemonic,
      system_context: found?.system_context || word.scenario,
      interval_days: schedule.interval_days,
      status: schedule.status,
      review_label: reviewLabel(schedule.interval_days),
      next_review_at: schedule.next_review_at,
    };
  });

  const evaluation: Evaluation = {
    results,
    session_summary: model.session_summary,
    evaluator: "gpt-4o-mini",
    written_inputs: notes,
  };
  return NextResponse.json(evaluation);
}
