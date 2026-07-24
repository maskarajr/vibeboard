"use client";

export function CheckEmailPanel({
  email,
  onBack,
}: {
  email: string;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="rounded-[var(--radius-sm)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink-muted)]">
        Magic link sent to{" "}
        <span className="font-medium text-[var(--ink)]">{email}</span>
      </p>
      <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[var(--ink-muted)]">
        <li>Open the newest email from Supabase Auth.</li>
        <li>
          Click the link in <strong>this same browser</strong> (Chrome/Edge -
          not the Gmail in-app browser if you can avoid it).
        </li>
        <li>You should land on the board signed in.</li>
      </ol>
      <p className="text-xs text-[var(--ink-soft)]">
        Old links expire after one use. Always use the latest email. The URL
        should include{" "}
        <code className="rounded bg-[var(--bg)] px-1">/auth/callback</code>.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="w-full text-sm text-[var(--ink-muted)] underline-offset-2 hover:underline"
      >
        Use a different email
      </button>
    </div>
  );
}
