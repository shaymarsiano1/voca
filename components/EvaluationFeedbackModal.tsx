"use client";

import { MnemonicBadge } from "@/components/MnemonicBadge";
import type { Evaluation, Verdict } from "@/lib/types";

const tone: Record<Verdict, { label: string; text: string }> = {
  mastered: { label: "Mastered", text: "text-emerald-700" },
  partial: { label: "Needs review", text: "text-amber-700" },
  missed: { label: "Missed", text: "text-mute" },
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

      <div className="divide-y divide-line border-y border-line">
        {evaluation.results.map((result) => {
          const style = tone[result.verdict];
          return (
            <article key={result.term} className="py-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="text-lg font-medium tracking-tight text-ink">{result.term}</h3>
                <span className={`text-sm ${style.text}`}>{style.label}</span>
              </div>
              <p dir="auto" className="font-hebrew mt-2 text-sm leading-7 text-ink/80">
                {result.feedback}
              </p>
              {result.user_explanation ? (
                <p className="mt-3 text-sm leading-6 text-mute">{result.user_explanation}</p>
              ) : null}
              {result.verdict !== "mastered" && result.correct_definition ? (
                <p className="mt-3 text-sm leading-6 text-ink">{result.correct_definition}</p>
              ) : null}
              <MnemonicBadge
                hook={result.mnemonic_hook}
                context={result.system_context}
                defaultOpen={result.verdict !== "mastered"}
              />
              <p className="mt-3 text-xs text-mute">{result.review_label}</p>
            </article>
          );
        })}
      </div>

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
