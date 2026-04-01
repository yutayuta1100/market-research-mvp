import Link from "next/link";

import type { CandidateFilters, CandidateSortOption } from "@/lib/candidates/types";
import { getDictionary, getLocalePath, getSortOptionLabel, type AppLocale } from "@/lib/i18n";

interface DashboardFiltersProps {
  categories: string[];
  selectedFilters: CandidateFilters;
  locale: AppLocale;
}

const sortOptions: CandidateSortOption[] = ["score", "margin", "profit", "recent"];

export function DashboardFilters({ categories, selectedFilters, locale }: DashboardFiltersProps) {
  const dictionary = getDictionary(locale);

  return (
    <form className="grid gap-4 rounded-[24px] border border-line/80 bg-white/70 p-4 md:grid-cols-4 md:p-5">
      <label className="space-y-2 text-sm text-muted">
        <span className="block text-xs font-semibold uppercase tracking-[0.2em]">{dictionary.filters.search}</span>
        <input
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
          defaultValue={selectedFilters.search ?? ""}
          name="search"
          placeholder={dictionary.filters.searchPlaceholder}
          type="text"
        />
      </label>

      <label className="space-y-2 text-sm text-muted">
        <span className="block text-xs font-semibold uppercase tracking-[0.2em]">{dictionary.filters.category}</span>
        <select
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
          defaultValue={selectedFilters.category ?? "all"}
          name="category"
        >
          <option value="all">{dictionary.filters.allCategories}</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm text-muted">
        <span className="block text-xs font-semibold uppercase tracking-[0.2em]">{dictionary.filters.source}</span>
        <select
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
          defaultValue={selectedFilters.source ?? "all"}
          name="source"
        >
          <option value="all">{dictionary.filters.allSources}</option>
          <option value="x">X</option>
          <option value="amazon">Amazon</option>
          <option value="keepa">Keepa</option>
        </select>
      </label>

      <div className="flex flex-col gap-2">
        <label className="space-y-2 text-sm text-muted">
          <span className="block text-xs font-semibold uppercase tracking-[0.2em]">{dictionary.filters.sort}</span>
          <select
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
            defaultValue={selectedFilters.sort ?? "score"}
            name="sort"
          >
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                {getSortOptionLabel(option, locale)}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-3 pt-1">
          <button
            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#38322a]"
            type="submit"
          >
            {dictionary.filters.apply}
          </button>
          <Link
            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent"
            href={getLocalePath(locale, "/")}
          >
            {dictionary.filters.reset}
          </Link>
        </div>
      </div>
    </form>
  );
}
