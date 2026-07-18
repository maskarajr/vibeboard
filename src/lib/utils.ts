import type { BoardFilter, IdeaCardData, VoteValue } from "@/lib/types";

const AVATAR_PALETTE = [
  "#0f766e",
  "#b45309",
  "#be123c",
  "#1d4ed8",
  "#7c3aed",
  "#0f766e",
  "#c2410c",
  "#0369a1",
];

const CATEGORY_BADGE_CLASSES = [
  "badge-engineering",
  "badge-culture",
  "badge-infrastructure",
  "badge-product",
  "badge-process",
  "badge-security",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function avatarColor(name: string): string {
  return AVATAR_PALETTE[hashString(name) % AVATAR_PALETTE.length];
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function categoryClass(category: string): string {
  return CATEGORY_BADGE_CLASSES[
    hashString(category.toLowerCase()) % CATEGORY_BADGE_CLASSES.length
  ];
}

export function normalizeCategory(category: string): string {
  return category.trim().replace(/\s+/g, " ");
}

export function matchesFilter(idea: IdeaCardData, filter: BoardFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "decided":
      return idea.decision !== null;
    case "execute-leading":
      return (
        idea.decision === null && idea.executeCount > idea.holdCount
      );
    case "hold-leading":
      return idea.decision === null && idea.holdCount > idea.executeCount;
    default: {
      const _exhaustive: never = filter;
      return _exhaustive;
    }
  }
}

export function voteSplit(
  executeCount: number,
  holdCount: number,
): { executePct: number; holdPct: number; total: number } {
  const total = executeCount + holdCount;
  if (total === 0) {
    return { executePct: 0, holdPct: 0, total: 0 };
  }
  const executePct = Math.round((executeCount / total) * 100);
  return {
    executePct,
    holdPct: 100 - executePct,
    total,
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isVoteValue(value: string): value is VoteValue {
  return value === "execute" || value === "hold";
}
