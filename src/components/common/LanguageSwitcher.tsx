import Link from "next/link";

import { getDictionary, type AppLocale } from "@/lib/i18n";

interface LanguageSwitcherProps {
  locale: AppLocale;
  jaHref: string;
  enHref: string;
}

export function LanguageSwitcher({ locale, jaHref, enHref }: LanguageSwitcherProps) {
  const dictionary = getDictionary(locale);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 p-1">
      <span className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
        {dictionary.languageSwitcher.label}
      </span>
      <Link
        aria-current={locale === "ja" ? "page" : undefined}
        className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
          locale === "ja" ? "bg-ink text-white" : "text-muted hover:text-accent"
        }`}
        href={jaHref}
      >
        {dictionary.languageSwitcher.ja}
      </Link>
      <Link
        aria-current={locale === "en" ? "page" : undefined}
        className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
          locale === "en" ? "bg-ink text-white" : "text-muted hover:text-accent"
        }`}
        href={enHref}
      >
        {dictionary.languageSwitcher.en}
      </Link>
    </div>
  );
}
