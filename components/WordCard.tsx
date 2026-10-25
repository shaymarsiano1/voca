import type { PracticeWord } from "@/lib/types";

export function WordCard({ word, index }: { word: PracticeWord; index: number }) {
  const review = word.role === "review";

  return (
    <article className="flex items-center gap-3 rounded-2xl border border-line bg-sheet px-4 py-4">
      <span className="w-6 shrink-0 font-mono text-xs text-mute">{String(index + 1).padStart(2, "0")}</span>
      <h3 className="min-w-0 flex-1 text-2xl font-semibold tracking-tight text-ink">{word.term}</h3>
      <span
        className={
          review
            ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
            : "rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800"
        }
      >
        {review ? "Review" : "New"}
      </span>
    </article>
  );
}
