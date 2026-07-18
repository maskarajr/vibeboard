"use client";

import { signOut } from "@/app/actions/auth";

export function BoardHeader({
  displayName,
  onNewIdea,
}: {
  displayName: string;
  onNewIdea: () => void;
}) {
  return (
    <header className="border-b border-black/10 bg-[var(--header)] text-[var(--header-ink)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-sm"
          >
            ✦
          </span>
          <span
            className="text-xl tracking-tight"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            vibeboard
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-white/70 sm:inline">
            {displayName}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-[var(--radius-pill)] px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Sign out
            </button>
          </form>
          <button
            type="button"
            onClick={onNewIdea}
            className="rounded-[var(--radius-pill)] bg-white px-4 py-2 text-sm font-medium text-[var(--header)] transition hover:bg-white/90"
          >
            + New Idea
          </button>
        </div>
      </div>
    </header>
  );
}
