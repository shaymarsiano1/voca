import { applySm2, reviewLabel } from "@/lib/sm2";
import type { Evaluation, ModelTermResult, Verdict, WordStatus } from "@/lib/types";
import { findBankEntry } from "@/lib/word-bank";

const STOP = new Set([
  "about",
  "after",
  "again",
  "being",
  "between",
  "every",
  "from",
  "have",
  "into",
  "other",
  "same",
  "that",
  "their",
  "there",
  "these",
  "this",
  "when",
  "which",
  "with",
  "would",
]);

const FEEDBACK: Record<Verdict, string> = {
  mastered: "ההסבר מדויק ומחזיק את הניואנס המקצועי. אפשר להמשיך הלאה.",
  partial:
    "הכיוון נכון, אבל חסר ניואנס שמבדיל את המונח ממושג קרוב. כדאי לעגן את ההגדרה הקצרה.",
  missed: "לא עלה כאן הסבר שאפשר לאמת. ההגדרה והחכה למטה יחזירו את המונח מחר.",
};

export type GradedWord = {
  term: string;
  definition?: string;
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  status: WordStatus;
};

function verdictFor(explanation: string, definition: string): Verdict {
  const text = explanation.trim().toLowerCase();
  if (text.length < 8) return "missed";

  const tokens = definition
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 4 && !STOP.has(word));
  const hits = new Set(tokens.filter((token) => text.includes(token)));
  const hebrew = (text.match(/[\u0590-\u05FF]/g) ?? []).length;

  if (hits.size >= 2 && text.length >= 24) return "mastered";
  if (hebrew >= 12 && text.length >= 20) return hits.size >= 1 ? "mastered" : "partial";
  if (hits.size >= 1 || text.length >= 36) return "partial";
  return "missed";
}

function explanationFor(term: string, transcript: string, note?: string) {
  if (note?.trim()) return note.trim().slice(0, 1200);
  const index = transcript.toLowerCase().indexOf(term.toLowerCase());
  if (index === -1) return "";
  const lineStart = transcript.lastIndexOf("\n", index);
  const lineEnd = transcript.indexOf("\n", index);
  return transcript.slice(lineStart === -1 ? 0 : lineStart, lineEnd === -1 ? undefined : lineEnd).trim();
}

export function evaluateLocally(input: {
  words: GradedWord[];
  transcript: string;
  notes: Record<string, string>;
  now?: Date;
}): Evaluation {
  const now = input.now ?? new Date();
  const results = input.words.map((word) => {
    const entry = findBankEntry(word.term);
    const definition = word.definition?.trim() || entry?.definition || "";
    const explanation = explanationFor(word.term, input.transcript, input.notes[word.term]);
    const verdict = verdictFor(explanation || input.transcript, definition);
    const model: ModelTermResult = {
      term: word.term,
      verdict,
      user_explanation: explanation,
      feedback: FEEDBACK[verdict],
      correct_definition: definition,
      mnemonic_hook:
        entry?.mnemonic || `Say ${word.term} out loud beside the system it changes.`,
      system_context:
        entry?.scenario || "Picture the term at a service boundary the next time you are on call.",
    };
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
      ...model,
      interval_days: schedule.interval_days,
      status: schedule.status,
      review_label: reviewLabel(schedule.interval_days),
      next_review_at: schedule.next_review_at,
    };
  });

  const mastered = results.filter((result) => result.verdict === "mastered").length;
  const review = results.length - mastered;
  const session_summary =
    review === 0
      ? "סט נקי. כל המונחים ישבו במקום, והמחזור הבא ייפתח לפי לוח החזרות."
      : `סיימת את הסט. ${mastered} מונחים יציבים, ו-${review} יחזרו מחר עם חכת זיכרון.`;

  return {
    results,
    session_summary,
    evaluator: "fallback",
    written_inputs: input.notes,
  };
}
