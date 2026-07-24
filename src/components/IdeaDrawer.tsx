"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  addComment,
  castVote,
  deleteComment,
  deleteIdea,
  setDecision,
  updateComment,
} from "@/app/actions/ideas";
import {
  IconBolt,
  IconClock,
  IconClose,
  IconTrash,
} from "@/components/Icons";
import { MemberAvatar } from "@/components/MemberAvatar";
import type { CommentData, IdeaCardData, VoteValue } from "@/lib/types";
import {
  categoryClass,
  formatShortDate,
  voteSplit,
} from "@/lib/utils";

export function IdeaDrawer({
  idea,
  comments,
  currentMemberId,
  onClose,
}: {
  idea: IdeaCardData;
  comments: CommentData[];
  currentMemberId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingVote, setPendingVote] = useState<VoteValue | null>(null);
  const [commentVote, setCommentVote] = useState<VoteValue | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [pending, startTransition] = useTransition();
  const split = voteSplit(idea.executeCount, idea.holdCount);
  const isAuthor = idea.author.id === currentMemberId;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (editingCommentId) {
          setEditingCommentId(null);
          setEditBody("");
          return;
        }
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, editingCommentId]);

  function run(action: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Close idea panel"
        className="absolute inset-0 animate-fade bg-black/35"
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="animate-drawer relative z-10 flex h-full w-full max-w-lg flex-col border-l border-[var(--line)] bg-white shadow-2xl outline-none"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
          <span
            className={`rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-medium ${categoryClass(idea.category)}`}
          >
            {idea.category}
          </span>
          <div className="flex items-center gap-1">
            {isAuthor ? (
              <button
                type="button"
                aria-label="Delete idea"
                className="rounded-full p-2 text-[var(--ink-muted)] hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  if (
                    window.confirm(
                      "Delete this idea and all of its votes and comments?",
                    )
                  ) {
                    run(async () => {
                      const result = await deleteIdea(idea.id);
                      if (result.ok) {
                        onClose();
                      }
                      return result;
                    });
                  }
                }}
              >
                <IconTrash />
              </button>
            ) : null}
            <button
              type="button"
              aria-label="Close"
              className="rounded-full p-2 text-[var(--ink-muted)] hover:bg-[var(--bg)]"
              onClick={onClose}
            >
              <IconClose />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <div>
            <h2
              id={titleId}
              className="text-2xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              {idea.title}
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              by {idea.author.displayName} · {formatShortDate(idea.createdAt)}
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink)]">
              {idea.description}
            </p>
          </div>

          <section className="space-y-3 rounded-[var(--radius-md)] border border-[var(--line)] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{split.total} votes</span>
              {split.total > 0 ? (
                <span className="text-[var(--ink-muted)]">
                  {split.executePct}% / {split.holdPct}%
                </span>
              ) : null}
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-[var(--bg)]">
              <div
                className="bg-[var(--execute)] transition-all"
                style={{ width: `${split.executePct}%` }}
              />
              <div
                className="bg-[var(--hold)] transition-all"
                style={{ width: `${split.holdPct}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setPendingVote("execute");
                  run(() => castVote(idea.id, "execute"));
                }}
                className={`rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium transition ${
                  idea.myVote === "execute" || pendingVote === "execute"
                    ? "bg-[var(--execute-soft)] text-[var(--execute)] ring-1 ring-[var(--execute)]/30"
                    : "bg-[var(--bg)] text-[var(--ink)] hover:bg-[var(--execute-soft)]"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <IconBolt /> Execute ({idea.executeCount})
                </span>
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setPendingVote("hold");
                  run(() => castVote(idea.id, "hold"));
                }}
                className={`rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium transition ${
                  idea.myVote === "hold" || pendingVote === "hold"
                    ? "bg-[var(--hold-soft)] text-[var(--hold)] ring-1 ring-[var(--hold)]/30"
                    : "bg-[var(--bg)] text-[var(--ink)] hover:bg-[var(--hold-soft)]"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <IconClock /> Hold ({idea.holdCount})
                </span>
              </button>
            </div>

            {isAuthor ? (
              <div className="border-t border-[var(--line)] pt-3">
                <p className="mb-2 text-sm font-medium">Make a final decision:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => setDecision(idea.id, "execute"))}
                    className="rounded-[var(--radius-pill)] border border-[var(--execute)]/40 px-3 py-1.5 text-sm text-[var(--execute)] hover:bg-[var(--execute-soft)]"
                  >
                    Mark: Execute
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => setDecision(idea.id, "hold"))}
                    className="rounded-[var(--radius-pill)] border border-[var(--hold)]/40 px-3 py-1.5 text-sm text-[var(--hold)] hover:bg-[var(--hold-soft)]"
                  >
                    Mark: Hold
                  </button>
                </div>
                {idea.decision ? (
                  <p className="mt-2 text-sm text-[var(--ink-muted)]">
                    Current decision:{" "}
                    <strong className="text-[var(--ink)]">
                      {idea.decision === "execute" ? "Execute" : "Hold"}
                    </strong>
                  </p>
                ) : null}
              </div>
            ) : idea.decision ? (
              <div className="border-t border-[var(--line)] pt-3">
                <p className="text-sm text-[var(--ink-muted)]">
                  Final decision:{" "}
                  <strong className="text-[var(--ink)]">
                    {idea.decision === "execute" ? "Execute" : "Hold"}
                  </strong>
                </p>
              </div>
            ) : null}
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wide text-[var(--ink-muted)] uppercase">
              {comments.length} comments
            </h3>
            <ul className="space-y-4">
              {comments.map((comment) => {
                const isOwn = comment.author.id === currentMemberId;
                const isEditing = editingCommentId === comment.id;
                const wasEdited = Boolean(comment.updatedAt);

                return (
                  <li key={comment.id} className="flex gap-3">
                    <MemberAvatar
                      displayName={comment.author.displayName}
                      avatarUrl={comment.author.avatarUrl}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium">
                          {comment.author.displayName}
                        </span>
                        {comment.vote ? (
                          <span
                            className={`rounded-[var(--radius-pill)] px-2 py-0.5 text-xs font-medium ${
                              comment.vote === "execute"
                                ? "bg-[var(--execute-soft)] text-[var(--execute)]"
                                : "bg-[var(--hold-soft)] text-[var(--hold)]"
                            }`}
                          >
                            {comment.vote === "execute" ? "Execute" : "Hold"}
                          </span>
                        ) : null}
                        <span className="text-[var(--ink-soft)]">
                          {formatShortDate(comment.createdAt)}
                          {wasEdited && comment.updatedAt
                            ? ` · edited ${formatShortDate(comment.updatedAt)}`
                            : null}
                        </span>
                      </div>

                      {isEditing ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={editBody}
                            onChange={(event) => setEditBody(event.target.value)}
                            rows={3}
                            className="w-full resize-none rounded-[var(--radius-sm)] border border-[var(--line)] px-3 py-2.5 text-sm outline-none ring-[var(--ink)] focus:ring-2"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={pending || !editBody.trim()}
                              onClick={() => {
                                run(async () => {
                                  const result = await updateComment(
                                    comment.id,
                                    editBody,
                                  );
                                  if (result.ok) {
                                    setEditingCommentId(null);
                                    setEditBody("");
                                  }
                                  return result;
                                });
                              }}
                              className="rounded-[var(--radius-pill)] bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              disabled={pending}
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditBody("");
                              }}
                              className="rounded-[var(--radius-pill)] bg-[var(--bg)] px-3 py-1.5 text-sm text-[var(--ink-muted)]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="mt-1 text-sm leading-relaxed text-[var(--ink)]">
                            {comment.body}
                          </p>
                          {isOwn ? (
                            <div className="mt-1.5 flex gap-3 text-xs">
                              <button
                                type="button"
                                disabled={pending}
                                className="text-[var(--ink-muted)] hover:text-[var(--ink)]"
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditBody(comment.body);
                                  setError(null);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={pending}
                                className="text-[var(--ink-muted)] hover:text-red-700"
                                onClick={() => {
                                  if (
                                    window.confirm("Delete this comment?")
                                  ) {
                                    run(() => deleteComment(comment.id));
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {error ? (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <form
          className="space-y-3 border-t border-[var(--line)] bg-white p-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const formData = new FormData(form);
            formData.set("ideaId", idea.id);
            if (commentVote) {
              formData.set("vote", commentVote);
            }
            run(async () => {
              const result = await addComment(formData);
              if (result.ok) {
                form.reset();
                setCommentVote(null);
              }
              return result;
            });
          }}
        >
          <textarea
            name="body"
            required
            rows={3}
            placeholder="Share your thoughts..."
            className="w-full resize-none rounded-[var(--radius-sm)] border border-[var(--line)] px-3 py-2.5 outline-none ring-[var(--ink)] focus:ring-2"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setCommentVote((current) =>
                    current === "execute" ? null : "execute",
                  )
                }
                className={`rounded-[var(--radius-pill)] px-3 py-1.5 text-sm ${
                  commentVote === "execute"
                    ? "bg-[var(--execute-soft)] text-[var(--execute)]"
                    : "bg-[var(--bg)] text-[var(--ink-muted)]"
                }`}
              >
                + Execute
              </button>
              <button
                type="button"
                onClick={() =>
                  setCommentVote((current) =>
                    current === "hold" ? null : "hold",
                  )
                }
                className={`rounded-[var(--radius-pill)] px-3 py-1.5 text-sm ${
                  commentVote === "hold"
                    ? "bg-[var(--hold-soft)] text-[var(--hold)]"
                    : "bg-[var(--bg)] text-[var(--ink-muted)]"
                }`}
              >
                + Hold
              </button>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="rounded-[var(--radius-pill)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {pending ? "Posting…" : "Comment"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
