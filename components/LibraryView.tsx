"use client";

import { useMemo, useState } from "react";
import { DOMAIN_META } from "@/components/domains";
import { cn } from "@/lib/cn";
import { isDomainId } from "@/lib/domains";
import { field } from "@/lib/ui";
import type { LibraryWord, WordStatus } from "@/lib/types";

const filters = ["all", "due", "learning", "mastered", "new"] as const;
type Filter = (typeof filters)[number];

function schedule(word: LibraryWord, today: string) {
  if (word.status === "new" || !word.lastReviewedAt) return "Not reviewed yet";
  const due = word.nextReviewAt.slice(0, 10);
  if (due <= today) return "Due now";
  const days = Math.round((Date.parse(`${due}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
  if (days <= 1) return "Tomorrow";
  return `In ${days} days`;
}

function statusClass(status: WordStatus) {
  if (status === "mastered") return "text-emerald-700";
  if (status === "learning") return "text-amber-700";
  return "text-mute";
}

export function LibraryView({ words, today }: { words: LibraryWord[]; today: string }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return words.filter((word) => {
      const due = word.status !== "new" && word.nextReviewAt.slice(0, 10) <= today;
      if (filter === "due" && !due) return false;
      if (filter !== "all" && filter !== "due" && word.status !== filter) return false;
      if (!needle) return true;
      return word.term.toLowerCase().includes(needle) || word.domain.toLowerCase().includes(needle);
    });
  }, [filter, query, today, words]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search"
          className={field}
        />
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                "rounded-full px-3 py-1 capitalize",
                filter === item ? "bg-accent/10 font-medium text-accent" : "text-mute hover:text-ink",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="border-y border-line py-10 text-sm text-mute">Words you practice will collect here.</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {visible.map((word) => (
            <li key={word.id} className="py-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium tracking-tight text-ink">{word.term}</p>
                <span className={`text-xs capitalize ${statusClass(word.status)}`}>{word.status}</span>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-mute">
                <span
                  className={cn("h-1.5 w-1.5 rounded-full", isDomainId(word.domain) ? DOMAIN_META[word.domain].dot : "bg-mute")}
                  aria-hidden="true"
                />
                {word.domain}
                <span className="px-1.5">·</span>
                {schedule(word, today)}
              </p>
              {word.mnemonicHook ? (
                <p dir="auto" className="mt-2 text-sm leading-6 text-ink/80">
                  {word.mnemonicHook}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
