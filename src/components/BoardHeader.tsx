"use client";

import Link from "next/link";

import { signOut } from "@/app/actions/auth";
import { MemberAvatar } from "@/components/MemberAvatar";

export function BoardHeader({
  displayName,
  avatarUrl,
  onNewIdea,
}: {
  displayName: string;
  avatarUrl: string | null;
  onNewIdea: () => void;
}) {
  return (
    <header className="border-b border-black/10 bg-[var(--header)] text-[var(--header-ink)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
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
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="profile-chip inline-flex items-center gap-2.5 rounded-[var(--radius-pill)] p-2 pr-3.5 text-sm font-medium"
            title="Your profile"
          >
            <MemberAvatar
              displayName={displayName}
              avatarUrl={avatarUrl}
              size="sm"
              className="ring-1 ring-white/25"
            />
            <span className="hidden max-w-[10rem] truncate sm:inline">
              {displayName}
            </span>
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-[var(--radius-pill)] px-3 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
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
