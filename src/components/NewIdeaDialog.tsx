"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createIdea } from "@/app/actions/ideas";
import { IconClose } from "@/components/Icons";

export function NewIdeaDialog({
  open,
  onClose,
  existingCategories,
}: {
  open: boolean;
  onClose: () => void;
  existingCategories: string[];
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const listId = useId();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto w-[min(100%-2rem,32rem)] rounded-[var(--radius-md)] border border-[var(--line)] bg-white p-0 shadow-[var(--shadow)] open:animate-fade backdrop:bg-black/40"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <form
        className="space-y-4 p-6"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          setError(null);
          startTransition(async () => {
            const result = await createIdea(formData);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            onClose();
            router.refresh();
          });
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <h2
            className="text-xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            New idea
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--ink-muted)] hover:bg-[var(--bg)]"
            aria-label="Close"
          >
            <IconClose />
          </button>
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Title</span>
          <input
            name="title"
            required
            maxLength={160}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--line)] px-3 py-2.5 outline-none ring-[var(--ink)] focus:ring-2"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Category</span>
          <input
            name="category"
            required
            maxLength={40}
            list={listId}
            placeholder={
              existingCategories.length > 0
                ? "Pick an existing one or type a new category"
                : "e.g. Engineering, Product, Culture"
            }
            className="w-full rounded-[var(--radius-sm)] border border-[var(--line)] px-3 py-2.5 outline-none ring-[var(--ink)] focus:ring-2"
          />
          <datalist id={listId}>
            {existingCategories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
          <span className="block text-xs text-[var(--ink-soft)]">
            Categories start empty and grow as the team names them.
          </span>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Description</span>
          <textarea
            name="description"
            required
            rows={5}
            maxLength={4000}
            className="w-full resize-y rounded-[var(--radius-sm)] border border-[var(--line)] px-3 py-2.5 outline-none ring-[var(--ink)] focus:ring-2"
          />
        </label>
        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-pill)] px-4 py-2 text-sm text-[var(--ink-muted)] hover:bg-[var(--bg)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-[var(--radius-pill)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Posting…" : "Post idea"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
