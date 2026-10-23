import type { PracticeWord } from "@/lib/types";

export function WordCard({ word, index }: { word: PracticeWord; index: number }) {
  const review = word.role === "review";

  return (
    <article className="flex items-center gap-3 px-4 py-3.5">
      <span className="w-5 shrink-0 font-mono text-[11px] text-mute">{String(index + 1).padStart(2, "0")}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h3 className="text-base font-medium tracking-tight text-ink">{word.term}</h3>
        </div>
      </div>
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
