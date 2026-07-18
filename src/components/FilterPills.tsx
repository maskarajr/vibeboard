"use client";

import {
  IconBolt,
  IconClock,
  IconTrophy,
} from "@/components/Icons";
import type { BoardFilter, IdeaCardData } from "@/lib/types";
import { matchesFilter } from "@/lib/utils";

const FILTERS: {
  id: BoardFilter;
  label: string;
  Icon?: typeof IconBolt;
}[] = [
  { id: "all", label: "All" },
  { id: "execute-leading", label: "Execute-leading", Icon: IconBolt },
  { id: "hold-leading", label: "Hold-leading", Icon: IconClock },
  { id: "decided", label: "Decided", Icon: IconTrophy },
];

export function FilterPills({
  ideas,
  active,
  onChange,
}: {
  ideas: IdeaCardData[];
  active: BoardFilter;
  onChange: (filter: BoardFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const count = ideas.filter((idea) =>
          matchesFilter(idea, filter.id),
        ).length;
        const isActive = active === filter.id;
        const Icon = filter.Icon;
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3.5 py-1.5 text-sm transition ${
              isActive
                ? "bg-[var(--header)] text-white"
                : "border border-[var(--line)] bg-white text-[var(--ink-muted)] hover:border-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            {Icon ? (
              <span className="inline-flex opacity-80">
                <Icon />
              </span>
            ) : null}
            <span>
              {filter.label} ({count})
            </span>
          </button>
        );
      })}
    </div>
  );
}
