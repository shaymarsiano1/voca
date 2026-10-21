import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isDomainId } from "@/lib/domains";
import { evaluateLocally } from "@/lib/fallback-eval";
import { evaluateExplanations, generateTerms } from "@/lib/openai";
import { applySm2, reviewLabel } from "@/lib/sm2";
import { computeStreak } from "@/lib/streak";
import type {
  DailyResponse,
  Evaluation,
  LibraryWord,
  ModelTermResult,
  PracticeWord,
  SessionRow,
  StudyStats,
  WordRole,
  WordRow,
  WordStatus,
} from "@/lib/types";
import { findBankEntry, pickFromBank, type BankEntry } from "@/lib/word-bank";

type Client = SupabaseClient;

function asStatus(value: string): WordStatus {
  if (value === "learning" || value === "mastered") return value;
  return "new";
}

function roleFor(word: WordRow, sessionCreatedAt: string): WordRole {
  const sessionMs = new Date(sessionCreatedAt).getTime();
  return new Date(word.created_at).getTime() >= sessionMs - 10 * 60 * 1000 ? "new" : "review";
}

function toPractice(word: WordRow, role: WordRole): PracticeWord {
  return {
    id: word.id,
    term: word.term,
    domain: word.domain,
    partOfSpeech: word.part_of_speech ?? "noun",
    pronunciation: word.pronunciation ?? "",
    role,
    status: asStatus(word.status),
    repetitions: word.repetitions,
    intervalDays: word.interval_days,
    easeFactor: word.ease_factor,
  };
}

function toLibrary(word: WordRow): LibraryWord {
  return {
    id: word.id,
    term: word.term,
    domain: word.domain,
    partOfSpeech: word.part_of_speech ?? "",
    pronunciation: word.pronunciation ?? "",
    status: asStatus(word.status),
    repetitions: word.repetitions,
    intervalDays: word.interval_days,
    easeFactor: word.ease_factor,
    nextReviewAt: word.next_review_at ?? new Date().toISOString(),
    lastReviewedAt: word.last_reviewed_at,
    mnemonicHook: word.mnemonic_hook,
    systemContext: word.system_context,
  };
}

async function loadStats(supabase: Client, userId: string, today: string): Promise<{
  stats: StudyStats;
  streak: number;
  terms: string[];
}> {
  const [{ data: words, error: wordsError }, { data: sessions, error: sessionsError }] =
    await Promise.all([
      supabase
        .from("vocabulary_words")
        .select("term, status, next_review_at")
        .eq("user_id", userId),
      supabase
        .from("daily_sessions")
        .select("session_date")
        .eq("user_id", userId)
        .eq("is_completed", true)
        .order("session_date", { ascending: false })
        .limit(90),
    ]);
  if (wordsError) throw wordsError;
  if (sessionsError) throw sessionsError;

  const rows = (words ?? []) as Array<{ term: string; status: string; next_review_at: string | null }>;
  const now = Date.now();
  return {
    terms: rows.map((row) => row.term),
    stats: {
      mastered: rows.filter((row) => row.status === "mastered").length,
      learning: rows.filter((row) => row.status === "learning").length,
      due: rows.filter(
        (row) => row.status !== "new" && row.next_review_at && new Date(row.next_review_at).getTime() <= now,
      ).length,
    },
    streak: computeStreak(
      ((sessions ?? []) as Array<{ session_date: string }>).map((session) => session.session_date),
      today,
    ),
  };
}

async function loadSession(supabase: Client, userId: string, localDate: string) {
  const { data, error } = await supabase
    .from("daily_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("session_date", localDate)
    .maybeSingle();
  if (error) throw error;
  return (data as SessionRow | null) ?? null;
}

async function loadWords(supabase: Client, userId: string, ids: string[]) {
  if (!ids.length) return [];
  const { data, error } = await supabase
    .from("vocabulary_words")
    .select("*")
    .eq("user_id", userId)
    .in("id", ids);
  if (error) throw error;
  const order = new Map(ids.map((id, index) => [id, index]));
  return ((data ?? []) as WordRow[]).sort(
    (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
  );
}

function sessionDomain(words: PracticeWord[]) {
  return words.find((word) => word.role === "new")?.domain ?? words[0]?.domain ?? "Software Engineering";
}

async function presentSession(
  supabase: Client,
  user: User,
  session: SessionRow,
  today: string,
): Promise<DailyResponse> {
  const [rows, summary] = await Promise.all([
    loadWords(supabase, user.id, session.word_ids),
    loadStats(supabase, user.id, today),
  ]);
  const words = rows.map((row) => toPractice(row, roleFor(row, session.created_at)));
  return {
    session: {
      id: session.id,
      sessionDate: session.session_date,
      isCompleted: session.is_completed,
      domain: sessionDomain(words),
      transcript: session.raw_transcript ?? "",
      evaluation: session.evaluation_result,
    },
    words,
    streak: summary.streak,
    stats: summary.stats,
  };
}

export async function getDaily(supabase: Client, user: User, localDate: string): Promise<DailyResponse> {
  const session = await loadSession(supabase, user.id, localDate);
  if (!session) {
    const summary = await loadStats(supabase, user.id, localDate);
    return { session: null, words: [], streak: summary.streak, stats: summary.stats };
  }
  return presentSession(supabase, user, session, localDate);
}

async function dueWords(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("vocabulary_words")
    .select("*")
    .eq("user_id", userId)
    .lte("next_review_at", new Date().toISOString())
    .neq("status", "new")
    .order("next_review_at", { ascending: true })
    .limit(2);
  if (error) throw error;
  return (data ?? []) as WordRow[];
}

async function insertFresh(
  supabase: Client,
  userId: string,
  domain: string,
  entries: Array<Pick<BankEntry, "term" | "partOfSpeech" | "pronunciation" | "definition">>,
) {
  const ids: string[] = [];
  try {
  for (const entry of entries) {
    const { data, error } = await supabase
      .from("vocabulary_words")
      .insert({
        user_id: userId,
        term: entry.term,
        domain,
        level: "B2/C1",
        status: "new",
        repetitions: 0,
        interval_days: 1,
        ease_factor: 2.5,
        next_review_at: new Date().toISOString(),
        part_of_speech: entry.partOfSpeech,
        pronunciation: entry.pronunciation,
        canonical_definition: entry.definition,
      })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") continue;
      throw error;
    }
    ids.push((data as { id: string }).id);
  }
  return ids;
  } catch (error) {
    if (ids.length) {
      await supabase.from("vocabulary_words").delete().in("id", ids).eq("user_id", userId);
    }
    throw error;
  }
}

export async function createDaily(supabase: Client, user: User, domain: string, localDate: string) {
  if (!isDomainId(domain)) {
    throw new Error("Choose a supported domain.");
  }

  const existing = await loadSession(supabase, user.id, localDate);
  if (existing) return presentSession(supabase, user, existing, localDate);

  const summary = await loadStats(supabase, user.id, localDate);
  const review = await dueWords(supabase, user.id);
  const need = 5 - review.length;
  const exclude = summary.terms;
  let generated: Array<{ term: string; partOfSpeech: string; pronunciation: string; definition: string }> = [];

  try {
    generated = (await generateTerms(domain, need, exclude)) ?? [];
  } catch (error) {
    console.error("Term generation failed", error);
    generated = [];
  }

  const missing = need - generated.length;
  const fallback =
    missing > 0
      ? pickFromBank(
          domain,
          [...exclude, ...generated.map((word) => word.term)],
          missing,
          `${localDate}:${domain}:${user.id}`,
        ).map((entry) => ({
          term: entry.term,
          partOfSpeech: entry.partOfSpeech,
          pronunciation: entry.pronunciation,
          definition: entry.definition,
        }))
      : [];

  const fresh = [...generated, ...fallback].slice(0, need);
  if (review.length + fresh.length === 0) {
    throw new Error("No terms were available for today.");
  }

  let insertedIds: string[] = [];
  let committed = false;
  try {
    insertedIds = await insertFresh(supabase, user.id, domain, fresh);
    const wordIds = [...review.map((word) => word.id), ...insertedIds];
    if (!wordIds.length) throw new Error("No terms were available for today.");

    const { data, error } = await supabase
      .from("daily_sessions")
      .insert({
        user_id: user.id,
        session_date: localDate,
        word_ids: wordIds,
      })
      .select("*")
      .single();

    if (error) {
      if (insertedIds.length) {
        await supabase.from("vocabulary_words").delete().in("id", insertedIds).eq("user_id", user.id);
        insertedIds = [];
      }
      if (error.code === "23505") {
        const raced = await loadSession(supabase, user.id, localDate);
        if (raced) return presentSession(supabase, user, raced, localDate);
      }
      throw error;
    }

    committed = true;
    return presentSession(supabase, user, data as SessionRow, localDate);
  } catch (error) {
    if (!committed && insertedIds.length) {
      await supabase.from("vocabulary_words").delete().in("id", insertedIds).eq("user_id", user.id);
    }
    throw error;
  }
}

function alignModelResults(
  words: WordRow[],
  model: { results: ModelTermResult[]; session_summary: string } | null,
  transcript: string,
  notes: Record<string, string>,
  now: Date,
): Evaluation {
  if (!model) {
    return evaluateLocally({
      words: words.map((word) => ({
        term: word.term,
        definition: word.canonical_definition ?? findBankEntry(word.term)?.definition ?? "",
        repetitions: word.repetitions,
        intervalDays: word.interval_days,
        easeFactor: word.ease_factor,
        status: asStatus(word.status),
      })),
      transcript,
      notes,
      now,
    });
  }

  const results = words.map((word) => {
    const found = model.results.find((result) => result.term.toLowerCase() === word.term.toLowerCase());
    const entry = findBankEntry(word.term);
    const verdict = found?.verdict ?? "missed";
    const schedule = applySm2(
      {
        repetitions: word.repetitions,
        interval_days: word.interval_days,
        ease_factor: word.ease_factor,
        status: asStatus(word.status),
      },
      verdict,
      now,
    );
    return {
      term: word.term,
      verdict,
      user_explanation: found?.user_explanation ?? notes[word.term]?.trim() ?? "",
      feedback: found?.feedback || "לא הצלחתי לבודד הסבר למונח הזה מתוך מה שנשלח.",
      correct_definition: found?.correct_definition || word.canonical_definition || entry?.definition || "",
      mnemonic_hook: found?.mnemonic_hook || entry?.mnemonic || "",
      system_context: found?.system_context || entry?.scenario || "",
      interval_days: schedule.interval_days,
      status: schedule.status,
      review_label: reviewLabel(schedule.interval_days),
      next_review_at: schedule.next_review_at,
    };
  });

  return {
    results,
    session_summary: model.session_summary,
    evaluator: "gpt-4o-mini" as const,
    written_inputs: notes,
  };
}

export async function evaluateDaily(
  supabase: Client,
  user: User,
  sessionId: string,
  transcript: string,
  notes: Record<string, string>,
  today: string,
) {
  const { data, error } = await supabase
    .from("daily_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  const session = data as SessionRow | null;
  if (!session) throw new Error("Today's set could not be found.");
  if (session.is_completed && session.evaluation_result) {
    return presentSession(supabase, user, session, today);
  }

  const words = await loadWords(supabase, user.id, session.word_ids);
  let model: Awaited<ReturnType<typeof evaluateExplanations>> = null;
  try {
    model = await evaluateExplanations({
      words: words.map((word) => ({
        term: word.term,
        definition: word.canonical_definition ?? "",
        partOfSpeech: word.part_of_speech ?? "noun",
      })),
      transcript,
      notes,
    });
  } catch (evaluationError) {
    console.error("Evaluation failed", evaluationError);
    model = null;
  }

  const reviewedAt = new Date();
  const evaluation = alignModelResults(words, model, transcript, notes, reviewedAt);

  for (const [index, word] of words.entries()) {
    const result = evaluation.results[index];
    if (!result) continue;
    const schedule = applySm2(
      {
        repetitions: word.repetitions,
        interval_days: word.interval_days,
        ease_factor: word.ease_factor,
        status: asStatus(word.status),
      },
      result.verdict,
      reviewedAt,
    );
    const { error: updateError } = await supabase
      .from("vocabulary_words")
      .update({
        repetitions: schedule.repetitions,
        interval_days: schedule.interval_days,
        ease_factor: schedule.ease_factor,
        status: schedule.status,
        next_review_at: schedule.next_review_at,
        last_reviewed_at: schedule.last_reviewed_at,
        mnemonic_hook: result.mnemonic_hook.trim() || word.mnemonic_hook,
        system_context: result.system_context.trim() || word.system_context,
      })
      .eq("id", word.id)
      .eq("user_id", user.id);
    if (updateError) throw updateError;
  }

  const { error: sessionError } = await supabase
    .from("daily_sessions")
    .update({
      raw_transcript: transcript,
      evaluation_result: evaluation,
      is_completed: true,
    })
    .eq("id", session.id)
    .eq("user_id", user.id);
  if (sessionError) throw sessionError;

  const refreshed = await loadSession(supabase, user.id, session.session_date);
  if (!refreshed) throw new Error("The completed set could not be reloaded.");
  return presentSession(supabase, user, refreshed, today);
}

export async function listVocabulary(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("vocabulary_words")
    .select("*")
    .eq("user_id", userId)
    .order("next_review_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as WordRow[]).map(toLibrary);
}
