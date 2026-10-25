"use client";

import { MnemonicBadge } from "@/components/MnemonicBadge";
import { hebrewFor } from "@/lib/word-bank";
import type { Evaluation, Verdict } from "@/lib/types";

const tone: Record<Verdict, { label: string; text: string; chip: string; card: string }> = {
  mastered: {
    label: "Right",
    text: "text-emerald-800",
    chip: "bg-emerald-100",
    card: "border-emerald-200",
  },
  partial: {
    label: "Not quite",
    text: "text-amber-800",
    chip: "bg-amber-100",
    card: "border-amber-200",
  },
  missed: {
    label: "Missed",
    text: "text-mute",
    chip: "bg-canvas",
    card: "border-line",
  },
};

export function EvaluationFeedbackModal({
  evaluation,
  transcript,
  note,
  onOpenLibrary,
}: {
  evaluation: Evaluation;
  transcript: string;
  note?: string;
  onOpenLibrary?: () => void;
}) {
  return (
    <section aria-label="Evaluation results" className="space-y-8">
      <div>
        <p dir="auto" className="font-hebrew text-2xl leading-9 font-medium tracking-tight text-ink">
          {evaluation.session_summary}
        </p>
        {note ? <p className="mt-3 max-w-xl text-sm leading-6 text-mute">{note}</p> : null}
      </div>

      <ul className="space-y-3">
        {evaluation.results.map((result, index) => {
          const style = tone[result.verdict];
          const translation = hebrewFor(result.term);
          return (
            <li key={result.term}>
              <article className={`rounded-2xl border bg-sheet p-4 ${style.card}`}>
                <div className="flex items-start gap-3">
                  <span className="mt-1 w-6 shrink-0 font-mono text-xs text-mute">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-2xl font-semibold tracking-tight text-ink">{result.term}</h3>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${style.chip} ${style.text}`}>
                        {style.label}
                      </span>
                    </div>
                    {translation ? (
                      <p dir="rtl" className="font-hebrew mt-1 text-xl font-medium text-ink">
                        {translation}
                      </p>
                    ) : null}
                    <p dir="auto" className="font-hebrew mt-3 text-sm leading-6 text-ink/80">
                      {result.feedback}
                    </p>
                    {result.verdict !== "mastered" && result.correct_definition ? (
                      <p className="mt-2 text-sm leading-6 text-ink">{result.correct_definition}</p>
                    ) : null}
                    <MnemonicBadge hook={result.mnemonic_hook} context={result.system_context} />
                    <p className="mt-2 text-xs text-mute">{result.review_label}</p>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      {transcript ? (
        <details className="text-sm text-mute">
          <summary className="cursor-pointer text-ink">What you submitted</summary>
          <p className="mt-3 leading-6 whitespace-pre-wrap" dir="auto">
            {transcript}
          </p>
        </details>
      ) : null}

      {onOpenLibrary ? (
        <button type="button" onClick={onOpenLibrary} className="text-sm text-ink underline decoration-line underline-offset-4">
          Open library
        </button>
      ) : null}
    </section>
  );
}
