"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export function MnemonicBadge({
  hook,
  context,
  defaultOpen = false,
}: {
  hook: string;
  context: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (!hook && !context) return null;

  return (
    <div className="mt-4 border-t border-line">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm text-ink"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="font-hebrew">חכת זיכרון</span>
        <ChevronDown className={cn("h-4 w-4 text-mute transition", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="space-y-3 pb-1">
          {hook ? (
            <div>
              <p className="text-xs text-mute">Wordplay</p>
              <p dir="auto" className="mt-1 text-sm leading-6 text-ink">
                {hook}
              </p>
            </div>
          ) : null}
          {context ? (
            <div>
              <p className="text-xs text-mute">In a system</p>
              <p className="mt-1 text-sm leading-6 text-ink/80">{context}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
