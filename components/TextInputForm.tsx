"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { field } from "@/lib/ui";

export function TextInputForm({
  transcript,
  onTranscript,
  words,
  notes,
  onNote,
  disabled = false,
}: {
  transcript: string;
  onTranscript: (value: string) => void;
  words: Array<{ id: string; term: string }>;
  notes: Record<string, string>;
  onNote: (term: string, value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-sm text-mute">Transcript</span>
        <textarea
          value={transcript}
          disabled={disabled}
          onChange={(event) => onTranscript(event.target.value)}
          placeholder="Your words appear here while you speak. You can also type them."
          className={cn(field, "min-h-28")}
        />
      </label>
      <button
        type="button"
        className="flex items-center gap-1.5 text-sm text-mute hover:text-ink"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
        Notes per term
      </button>
      {open ? (
        <div className="space-y-3">
          {words.map((word) => (
            <label key={word.id} className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">{word.term}</span>
              <textarea
                value={notes[word.term] ?? ""}
                disabled={disabled}
                onChange={(event) => onNote(word.term, event.target.value)}
                placeholder="Optional"
                className={cn(field, "min-h-16")}
              />
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
