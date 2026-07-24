"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { prepareLogin } from "@/app/actions/auth";
import { AuthShell } from "@/components/AuthShell";
import { CheckEmailPanel } from "@/components/CheckEmailPanel";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({
  initialError,
  detail,
}: {
  initialError?: string;
  detail?: string;
}) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "email_sent">("email");
  const [error, setError] = useState<string | null>(
    detail || initialError || null,
  );
  const [pending, startTransition] = useTransition();

  if (step === "email_sent") {
    return (
      <AuthShell
        title="Check your email"
        subtitle="Open the newest magic link in this same browser to get back on the board."
      >
        <CheckEmailPanel
          email={email}
          onBack={() => {
            setStep("email");
            setError(null);
          }}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Enter the email you joined with. We'll send a magic link - no password."
      footer={
        <>
          New here?{" "}
          <Link href="/join" className="font-medium text-[var(--ink)] underline">
            Join with invite code
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
            const prepared = await prepareLogin(formData);
            if (!prepared.ok) {
              setError(prepared.error);
              return;
            }
            if (prepared.step !== "ready_for_link") {
              setError("Unexpected login state. Try again.");
              return;
            }

            const supabase = createClient();
            const { error: otpError } = await supabase.auth.signInWithOtp({
              email: prepared.email,
              options: {
                shouldCreateUser: false,
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
          <span className="text-sm font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
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
