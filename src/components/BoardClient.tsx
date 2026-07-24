"use client";

import { useMemo, useState } from "react";

import { BoardHeader } from "@/components/BoardHeader";
import { FilterPills } from "@/components/FilterPills";
import { IdeaCard } from "@/components/IdeaCard";
import { IdeaDrawer } from "@/components/IdeaDrawer";
import { NewIdeaDialog } from "@/components/NewIdeaDialog";
import type { BoardFilter, CommentData, IdeaCardData } from "@/lib/types";
import { matchesFilter } from "@/lib/utils";

export function BoardClient({
  currentMemberId,
  displayName,
  avatarUrl,
  ideas,
  commentsByIdea,
}: {
  currentMemberId: string;
  displayName: string;
  avatarUrl: string | null;
  ideas: IdeaCardData[];
  commentsByIdea: Record<string, CommentData[]>;
}) {
  const [filter, setFilter] = useState<BoardFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newIdeaOpen, setNewIdeaOpen] = useState(false);

  const visibleIdeas = useMemo(
    () => ideas.filter((idea) => matchesFilter(idea, filter)),
    [ideas, filter],
  );

  const existingCategories = useMemo(() => {
    const seen = new Set<string>();
    const categories: string[] = [];
    for (const idea of ideas) {
      const key = idea.category.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        categories.push(idea.category);
      }
    }
    return categories.sort((a, b) => a.localeCompare(b));
  }, [ideas]);

  const selectedIdea =
    selectedId != null
      ? (ideas.find((idea) => idea.id === selectedId) ?? null)
      : null;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <BoardHeader
        displayName={displayName}
        avatarUrl={avatarUrl}
        onNewIdea={() => setNewIdeaOpen(true)}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <FilterPills
          ideas={ideas}
          active={filter}
          onChange={setFilter}
        />

        {visibleIdeas.length === 0 ? (
          <div className="mt-16 text-center">
            <p
              className="text-2xl tracking-tight text-[var(--ink)]"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              {ideas.length === 0 ? "No ideas yet" : "Nothing in this filter"}
            </p>
            <p className="mt-2 text-[var(--ink-muted)]">
              {ideas.length === 0
                ? "Be the first to post something for the team to weigh in on."
                : "Try another filter, or add a new idea."}
            </p>
            <button
              type="button"
              onClick={() => setNewIdeaOpen(true)}
              className="mt-6 rounded-[var(--radius-pill)] bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white"
            >
              + New Idea
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleIdeas.map((idea, index) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                index={index}
                selected={selectedId === idea.id}
                onOpen={() => setSelectedId(idea.id)}
              />
            ))}
          </div>
        )}
      </main>

      <NewIdeaDialog
        open={newIdeaOpen}
        onClose={() => setNewIdeaOpen(false)}
        existingCategories={existingCategories}
      />

      {selectedIdea ? (
        <IdeaDrawer
          idea={selectedIdea}
          comments={commentsByIdea[selectedIdea.id] ?? []}
          currentMemberId={currentMemberId}
          onClose={() => setSelectedId(null)}
        />
      ) : null}
    </div>
  );
}
