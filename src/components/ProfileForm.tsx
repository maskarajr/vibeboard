"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import {
  removeAvatar,
  updateAvatar,
  updateUsername,
} from "@/app/actions/profile";
import { MemberAvatar } from "@/components/MemberAvatar";
import {
  formatCooldownDate,
  isUsernameCooldownActive,
  usernameCooldownEndsAt,
} from "@/lib/utils";

export function ProfileForm({
  email,
  displayName,
  displayNameChangedAt,
  avatarUrl,
}: {
  email: string;
  displayName: string;
  displayNameChangedAt: string | null;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [avatarPending, startAvatarTransition] = useTransition();

  const cooldownActive = isUsernameCooldownActive(displayNameChangedAt);
  const cooldownEnds = usernameCooldownEndsAt(displayNameChangedAt);

  function runAvatar(
    action: () => Promise<{ ok: true } | { ok: false; error: string }>,
    successMessage: string,
  ) {
    setAvatarError(null);
    setAvatarSuccess(null);
    startAvatarTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setAvatarError(result.error);
        return;
      }
      setAvatarSuccess(successMessage);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <MemberAvatar
          displayName={displayName}
          avatarUrl={avatarUrl}
          size="lg"
          className="ring-2 ring-[var(--line)]"
        />
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-[var(--ink)]">Profile photo</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={avatarPending}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-[var(--radius-pill)] bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {avatarPending ? "Uploading…" : "Change photo"}
            </button>
            {avatarUrl ? (
              <button
                type="button"
                disabled={avatarPending}
                onClick={() => {
                  if (window.confirm("Remove your profile photo?")) {
                    runAvatar(removeAvatar, "Photo removed.");
                  }
                }}
                className="rounded-[var(--radius-pill)] bg-[var(--bg)] px-3 py-1.5 text-sm text-[var(--ink-muted)] disabled:opacity-60"
              >
                Remove
              </button>
            ) : null}
          </div>
          <p className="text-xs text-[var(--ink-soft)]">
            JPG, PNG, WebP, or GIF up to 2 MB.
          </p>
          {avatarError ? (
            <p className="text-sm text-red-700" role="alert">
              {avatarError}
            </p>
          ) : null}
          {avatarSuccess ? (
            <p className="text-sm text-teal-700" role="status">
              {avatarSuccess}
            </p>
          ) : null}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) {
                return;
              }
              const formData = new FormData();
              formData.set("avatar", file);
              runAvatar(() => updateAvatar(formData), "Photo updated.");
            }}
          />
        </div>
      </div>

      <form
        key={displayName}
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          setUsernameError(null);
          setUsernameSuccess(null);
          startTransition(async () => {
            const result = await updateUsername(formData);
            if (!result.ok) {
              setUsernameError(result.error);
              return;
            }
            setUsernameSuccess("Username updated.");
            router.refresh();
          });
        }}
      >
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ink)]">Email</span>
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-[var(--ink-muted)] outline-none"
          />
          <span className="block text-xs text-[var(--ink-soft)]">
            Used to recover your account. Can’t be changed here.
          </span>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ink)]">Username</span>
          <input
            name="displayName"
            type="text"
            required
            minLength={2}
            maxLength={40}
            defaultValue={displayName}
            disabled={pending || cooldownActive}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--line)] px-3 py-2.5 outline-none ring-[var(--ink)] focus:ring-2 disabled:bg-[var(--bg)] disabled:text-[var(--ink-muted)]"
          />
          <span className="block text-xs text-[var(--ink-soft)]">
            {cooldownActive && cooldownEnds
              ? `Username changes are limited to once every 14 days. Next change available ${formatCooldownDate(cooldownEnds)}.`
              : "Shown on ideas and comments. You can change it once every 14 days."}
          </span>
        </label>

        {usernameError ? (
          <p className="text-sm text-red-700" role="alert">
            {usernameError}
          </p>
        ) : null}
        {usernameSuccess ? (
          <p className="text-sm text-teal-700" role="status">
            {usernameSuccess}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending || cooldownActive}
          className="w-full rounded-[var(--radius-pill)] bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save username"}
        </button>
      </form>
    </div>
  );
}
