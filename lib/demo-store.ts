import { shiftIsoDate } from "@/lib/streak";
import type { DailyResponse, Evaluation, LibraryWord, PracticeWord, WordStatus } from "@/lib/types";
import { evaluateLocally } from "@/lib/fallback-eval";
import { pickFromBank, type BankEntry } from "@/lib/word-bank";

const KEY = "voca-demo-v1";

type ActiveSet = {
  date: string;
  domain: string;
  words: PracticeWord[];
  transcript: string;
  notes: Record<string, string>;
  evaluation: Evaluation | null;
};

export type DemoState = {
  library: LibraryWord[];
  streak: number;
  lastCompletedDate: string | null;
  active: ActiveSet | null;
};

const empty = (): DemoState => ({
  library: [],
  streak: 0,
  lastCompletedDate: null,
  active: null,
});

function slug(term: string) {
  return term.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function fromBank(entry: BankEntry, domain: string, status: WordStatus, repetitions: number): LibraryWord {
  return {
    id: `demo-${slug(entry.term)}`,
    term: entry.term,
    domain,
    partOfSpeech: entry.partOfSpeech,
    pronunciation: entry.pronunciation,
    status,
    repetitions,
    intervalDays: repetitions >= 2 ? 3 : 1,
    easeFactor: 2.5,
    nextReviewAt: new Date().toISOString(),
    lastReviewedAt: status === "new" ? null : new Date().toISOString(),
    mnemonicHook: status === "new" ? null : entry.mnemonic,
    systemContext: status === "new" ? null : entry.scenario,
  };
}

function toPractice(word: LibraryWord, role: PracticeWord["role"]): PracticeWord {
  return {
    id: word.id,
    term: word.term,
    domain: word.domain,
    partOfSpeech: word.partOfSpeech,
    pronunciation: word.pronunciation,
    role,
    status: word.status,
    repetitions: word.repetitions,
    intervalDays: word.intervalDays,
    easeFactor: word.easeFactor,
  };
}

export function readDemo(): DemoState {
  if (typeof window === "undefined") return empty();
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return empty();
  try {
    const parsed = JSON.parse(raw) as DemoState;
    if (!parsed || !Array.isArray(parsed.library)) return empty();
    return parsed;
  } catch {
    return empty();
  }
}

function writeDemo(state: DemoState) {
  window.localStorage.setItem(KEY, JSON.stringify(state));
  return state;
}

function statsFor(library: LibraryWord[], today: string) {
  return {
    mastered: library.filter((word) => word.status === "mastered").length,
    learning: library.filter((word) => word.status === "learning").length,
    due: library.filter((word) => word.status !== "new" && word.nextReviewAt.slice(0, 10) <= today).length,
  };
}

export function toDailyResponse(state: DemoState, today: string): DailyResponse {
  const active = state.active?.date === today ? state.active : null;
  return {
    session: active
      ? {
          id: `demo-${active.date}`,
          sessionDate: active.date,
          isCompleted: Boolean(active.evaluation),
          domain: active.domain,
          transcript: active.transcript,
          evaluation: active.evaluation,
        }
      : null,
    words: active?.words ?? [],
    streak: state.streak,
    stats: statsFor(state.library, today),
  };
}

function seedLibrary(domain: string, today: string): LibraryWord[] {
  const yesterday = shiftIsoDate(today, -1);
  return pickFromBank(domain, [], 2, `${today}:${domain}:seed`).map((entry) => ({
    ...fromBank(entry, domain, "learning", 2),
    nextReviewAt: `${yesterday}T08:00:00.000Z`,
    intervalDays: 3,
  }));
}

export function startDemoDay(domain: string, today: string) {
  const current = readDemo();
  if (current.active?.date === today) return current;

  const library = current.library.length ? current.library : seedLibrary(domain, today);
  const due = library
    .filter((word) => word.status !== "new" && word.nextReviewAt.slice(0, 10) <= today)
    .sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt))
    .slice(0, 2);
  const fresh = pickFromBank(
    domain,
    library.map((word) => word.term),
    Math.max(0, 5 - due.length),
    `${today}:${domain}`,
  );

  const words = [
    ...due.map((word) => toPractice(word, "review")),
    ...fresh.map((entry) => toPractice(fromBank(entry, domain, "new", 0), "new")),
  ];

  return writeDemo({
    ...current,
    library,
    active: {
      date: today,
      domain,
      words,
      transcript: "",
      notes: {},
      evaluation: null,
    },
  });
}

export function saveDemoDraft(transcript: string, notes: Record<string, string>) {
  const current = readDemo();
  if (!current.active || current.active.evaluation) return current;
  return writeDemo({
    ...current,
    active: { ...current.active, transcript, notes },
  });
}

export function completeDemoDay(transcript: string, notes: Record<string, string>, today: string) {
  const current = readDemo();
  if (!current.active) throw new Error("Start today's set first.");
  if (current.active.evaluation) return current;

  const evaluation = evaluateLocally({
    words: current.active.words.map((word) => ({
      term: word.term,
      repetitions: word.repetitions,
      intervalDays: word.intervalDays,
      easeFactor: word.easeFactor,
      status: word.status,
    })),
    transcript,
    notes,
  });

  const byTerm = new Map(current.library.map((word) => [word.term.toLowerCase(), word]));
  current.active.words.forEach((word, index) => {
    const result = evaluation.results[index];
    if (!result) return;
    const existing = byTerm.get(word.term.toLowerCase());
    byTerm.set(word.term.toLowerCase(), {
      id: existing?.id ?? word.id,
      term: word.term,
      domain: word.domain,
      partOfSpeech: word.partOfSpeech,
      pronunciation: word.pronunciation,
      status: result.status,
      repetitions: result.verdict === "mastered" ? word.repetitions + 1 : 0,
      intervalDays: result.interval_days,
      easeFactor: word.easeFactor,
      nextReviewAt: result.next_review_at,
      lastReviewedAt: new Date().toISOString(),
      mnemonicHook: result.mnemonic_hook,
      systemContext: result.system_context,
    });
  });

  return writeDemo({
    library: [...byTerm.values()],
    streak: current.lastCompletedDate === today ? current.streak : current.streak + 1,
    lastCompletedDate: today,
    active: { ...current.active, transcript, notes, evaluation },
  });
}
