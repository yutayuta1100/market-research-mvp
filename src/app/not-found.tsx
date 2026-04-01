import Link from "next/link";

export default function NotFound() {
  return (
    <main className="panel-surface flex min-h-[60vh] flex-col items-center justify-center px-6 py-12 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Not found</p>
      <h1 className="mt-4 text-3xl font-semibold text-ink">That candidate is not in the current mock dataset.</h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
        Head back to the dashboard to review the active opportunities and their reference links.
      </p>
      <Link
        className="mt-6 inline-flex items-center rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white"
        href="/"
      >
        Return to dashboard
      </Link>
    </main>
  );
}

