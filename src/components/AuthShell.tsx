import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-card rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className="grid h-8 w-8 place-items-center rounded-full bg-[var(--header)] text-sm text-white"
            >
              ✦
            </span>
            <span
              className="text-xl tracking-tight text-[var(--ink)]"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              vibeboard
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[var(--ink)]">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
            {subtitle}
          </p>
        </div>
        {children}
        {footer ? (
          <div className="mt-6 text-center text-sm text-[var(--ink-muted)]">
            {footer}
          </div>
        ) : null}
      </div>
    </main>
  );
}
