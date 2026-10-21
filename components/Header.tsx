"use client";

import { LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";

export function Header({
  homeHref,
  streak,
  domain,
  email,
  preview = false,
  onSignOut,
}: {
  homeHref: string;
  streak: number;
  domain: string;
  email?: string | null;
  preview?: boolean;
  onSignOut?: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-xl items-center justify-between gap-4 px-5">
        <Logo href={homeHref} />
        <div className="flex min-w-0 items-center gap-4 text-sm text-mute">
          <span className="tabular-nums">
            <span className={streak > 0 ? "text-amber-600" : "text-ink"}>{streak}</span>
            <span className="ml-1">{streak === 1 ? "day" : "days"}</span>
          </span>
          <span className="max-w-[12rem] truncate">{domain}</span>
          {preview ? <span>Preview</span> : null}
          {email ? <span className="hidden max-w-[9rem] truncate md:inline">{email}</span> : null}
          {onSignOut ? (
            <button
              type="button"
              onClick={onSignOut}
              aria-label="Sign out"
              className="grid h-8 w-8 place-items-center rounded-full text-mute hover:bg-sheet hover:text-ink"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
