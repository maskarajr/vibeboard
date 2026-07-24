import Link from "next/link";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/ProfileForm";
import { getCurrentMember } from "@/lib/auth";

export default async function ProfilePage() {
  const member = await getCurrentMember();
  if (!member) {
    redirect("/login");
  }

  return (
    <main className="min-h-full flex-1">
      <header className="border-b border-black/10 bg-[var(--header)] text-[var(--header-ink)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2.5">
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
          <Link
            href="/"
            className="rounded-[var(--radius-pill)] px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            ← Back to board
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <div className="animate-card rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
            Your profile
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
            Update how you appear on the board.
          </p>
          <div className="mt-8">
            <ProfileForm
              email={member.email}
              displayName={member.display_name}
              displayNameChangedAt={member.display_name_changed_at}
              avatarUrl={member.avatar_url}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
