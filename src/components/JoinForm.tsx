"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { finishPendingJoin, prepareJoin } from "@/app/actions/auth";
import { AuthShell } from "@/components/AuthShell";
import { CheckEmailPanel } from "@/components/CheckEmailPanel";
import { createClient } from "@/lib/supabase/client";

export function JoinForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"details" | "email_sent">("details");
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await finishPendingJoin();
      if (result.ok && result.step === "joined") {
        router.replace("/");
        router.refresh();
      }
    });
  }, [router]);

  if (step === "email_sent") {
    return (
      <AuthShell
        title="Check your email"
        subtitle="Open the newest magic link in this same browser to finish joining."
      >
        <CheckEmailPanel
          email={email}
          onBack={() => {
            setStep("details");
            setError(null);
          }}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Join the board"
      subtitle="Use the team invite code, your email, and a pseudonym. No password needed."
      footer={
        <>
          Already joined?{" "}
          <Link href="/login" className="font-medium text-[var(--ink)] underline">
            Log in
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          setError(null);
          startTransition(async () => {
            const prepared = await prepareJoin(formData);
            if (!prepared.ok) {
              setError(prepared.error);
              return;
            }
            if (prepared.step !== "ready_for_link") {
              setError("Unexpected join state. Try again.");
              return;
            }

            const supabase = createClient();
            const { error: otpError } = await supabase.auth.signInWithOtp({
              email: prepared.email,
              options: {
                shouldCreateUser: true,
                emailRedirectTo: prepared.redirectTo,
              },
            });

            if (otpError) {
              setError(otpError.message);
              return;
            }

            setEmail(prepared.email);
            setStep("email_sent");
          });
        }}
      >
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Team invite code</span>
          <input
            name="inviteCode"
            required
            autoComplete="off"
            className="w-full rounded-[var(--radius-sm)] border border-[var(--line)] px-3 py-2.5 outline-none ring-[var(--ink)] focus:ring-2"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-[var(--radius-sm)] border border-[var(--line)] px-3 py-2.5 outline-none ring-[var(--ink)] focus:ring-2"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Pseudonym</span>
          <input
            name="displayName"
            required
            minLength={2}
            maxLength={40}
            placeholder="How teammates will see you"
            className="w-full rounded-[var(--radius-sm)] border border-[var(--line)] px-3 py-2.5 outline-none ring-[var(--ink)] focus:ring-2"
          />
        </label>
        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-[var(--radius-pill)] bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Sending link…" : "Send magic link"}
        </button>
      </form>
    </AuthShell>
  );
}
