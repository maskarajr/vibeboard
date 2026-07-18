"use client";

import { IconBolt, IconChat, IconClock, IconMark } from "@/components/Icons";
import type { IdeaCardData } from "@/lib/types";
import {
  avatarColor,
  categoryClass,
  formatShortDate,
  getInitials,
} from "@/lib/utils";

export function IdeaCard({
  idea,
  selected,
  onOpen,
  index,
}: {
  idea: IdeaCardData;
  selected: boolean;
  onOpen: () => void;
  index: number;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`animate-card group flex h-full w-full flex-col rounded-[var(--radius-md)] border bg-[var(--surface)] p-5 text-left shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:border-[var(--ink-soft)] ${
        selected
          ? "border-[var(--header)] ring-2 ring-[var(--header)]/20"
          : "border-[var(--line)]"
      }`}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span
          className={`rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-medium ${categoryClass(idea.category)}`}
        >
          {idea.category}
        </span>
        <div className="flex items-center gap-2 text-xs text-[var(--ink-soft)]">
          {idea.decision ? (
            <span
              className={`inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2 py-0.5 font-medium ${
                idea.decision === "execute"
                  ? "bg-[var(--execute-soft)] text-[var(--execute)]"
                  : "bg-[var(--hold-soft)] text-[var(--hold)]"
              }`}
            >
              <IconMark />
              {idea.decision === "execute" ? "Execute" : "Hold"}
            </span>
          ) : null}
          <span>{formatShortDate(idea.createdAt)}</span>
        </div>
      </div>

      <h2
        className="text-lg font-semibold leading-snug tracking-tight text-[var(--ink)]"
        style={{ fontFamily: "var(--font-fraunces), serif" }}
      >
        {idea.title}
      </h2>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--ink-muted)]">
        {idea.description}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3 text-sm">
        <span className="font-medium text-[var(--execute)]">
          {idea.executeCount} execute
        </span>
        <span className="font-medium text-[var(--hold)]">
          {idea.holdCount} hold
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
            style={{ background: avatarColor(idea.author.displayName) }}
          >
            {getInitials(idea.author.displayName)}
          </span>
          <span className="truncate text-sm text-[var(--ink-muted)]">
            {idea.author.displayName}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--ink-soft)]">
          <span title="Execute votes" className="inline-flex items-center gap-1">
            <IconBolt /> {idea.executeCount}
          </span>
          <span title="Hold votes" className="inline-flex items-center gap-1">
            <IconClock /> {idea.holdCount}
          </span>
          <span title="Comments" className="inline-flex items-center gap-1">
            <IconChat /> {idea.commentCount}
          </span>
        </div>
      </div>
    </button>
  );
}
