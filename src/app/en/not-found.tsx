import Link from "next/link";

import { getDictionary } from "@/lib/i18n";

const dictionary = getDictionary("en");

export default function EnglishNotFound() {
  return (
    <main className="panel-surface flex min-h-[60vh] flex-col items-center justify-center px-6 py-12 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">{dictionary.notFound.eyebrow}</p>
      <h1 className="mt-4 text-3xl font-semibold text-ink">{dictionary.notFound.title}</h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-muted">{dictionary.notFound.description}</p>
      <Link
        className="mt-6 inline-flex items-center rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white"
        href="/en"
      >
        {dictionary.notFound.cta}
      </Link>
    </main>
  );
}
