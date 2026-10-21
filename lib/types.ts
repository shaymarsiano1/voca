export type Verdict = "mastered" | "partial" | "missed";
export type WordStatus = "new" | "learning" | "mastered";
export type WordRole = "review" | "new";

export type ModelTermResult = {
  term: string;
  verdict: Verdict;
  user_explanation: string;
  feedback: string;
  correct_definition: string;
  mnemonic_hook: string;
  system_context: string;
};

export type TermResult = ModelTermResult & {
  interval_days: number;
  status: WordStatus;
  review_label: string;
  next_review_at: string;
};

export type Evaluation = {
  results: TermResult[];
  session_summary: string;
  evaluator?: "gpt-4o-mini" | "fallback";
  written_inputs?: Record<string, string>;
};

export type PracticeWord = {
  id: string;
  term: string;
  domain: string;
  partOfSpeech: string;
  pronunciation: string;
  role: WordRole;
  status: WordStatus;
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
};

export type StudyStats = {
  mastered: number;
  learning: number;
  due: number;
};

export type DailySessionView = {
  id: string;
  sessionDate: string;
  isCompleted: boolean;
  domain: string;
  transcript: string;
  evaluation: Evaluation | null;
};

export type DailyResponse = {
  session: DailySessionView | null;
  words: PracticeWord[];
  streak: number;
  stats: StudyStats;
};

export type LibraryWord = {
  id: string;
  term: string;
  domain: string;
  partOfSpeech: string;
  pronunciation: string;
  status: WordStatus;
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewAt: string;
  lastReviewedAt: string | null;
  mnemonicHook: string | null;
  systemContext: string | null;
};

export type WordRow = {
  id: string;
  user_id: string;
  term: string;
  domain: string;
  level: string;
  status: WordStatus;
  repetitions: number;
  interval_days: number;
  ease_factor: number;
  next_review_at: string | null;
  last_reviewed_at: string | null;
  mnemonic_hook: string | null;
  system_context: string | null;
  part_of_speech: string | null;
  pronunciation: string | null;
  canonical_definition: string | null;
  created_at: string;
};

export type SessionRow = {
  id: string;
  user_id: string;
  session_date: string;
  word_ids: string[];
  raw_transcript: string | null;
  evaluation_result: Evaluation | null;
  is_completed: boolean;
  created_at: string;
};
