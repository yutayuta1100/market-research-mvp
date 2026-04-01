import Link from "next/link";

import type { CandidateFilters, CandidateSortOption } from "@/lib/candidates/types";

const sortOptions: Array<{ value: CandidateSortOption; label: string }> = [
  { value: "score", label: "Score" },
  { value: "margin", label: "Margin" },
  { value: "profit", label: "Profit" },
  { value: "recent", label: "Most recent" },
];

interface DashboardFiltersProps {
  categories: string[];
  selectedFilters: CandidateFilters;
}

export function DashboardFilters({ categories, selectedFilters }: DashboardFiltersProps) {
  return (
    <form className="grid gap-4 rounded-[24px] border border-line/80 bg-white/70 p-4 md:grid-cols-4 md:p-5">
      <label className="space-y-2 text-sm text-muted">
        <span className="block text-xs font-semibold uppercase tracking-[0.2em]">Search</span>
        <input
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
          defaultValue={selectedFilters.search ?? ""}
          name="search"
          placeholder="Headphones, collectibles, brand..."
          type="text"
        />
      </label>

      <label className="space-y-2 text-sm text-muted">
        <span className="block text-xs font-semibold uppercase tracking-[0.2em]">Category</span>
        <select
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
          defaultValue={selectedFilters.category ?? "all"}
          name="category"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm text-muted">
        <span className="block text-xs font-semibold uppercase tracking-[0.2em]">Source</span>
        <select
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
          defaultValue={selectedFilters.source ?? "all"}
          name="source"
        >
          <option value="all">All sources</option>
          <option value="x">X</option>
          <option value="amazon">Amazon</option>
          <option value="keepa">Keepa</option>
        </select>
      </label>

      <div className="flex flex-col gap-2">
        <label className="space-y-2 text-sm text-muted">
          <span className="block text-xs font-semibold uppercase tracking-[0.2em]">Sort</span>
          <select
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
            defaultValue={selectedFilters.sort ?? "score"}
            name="sort"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-3 pt-1">
          <button
            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#38322a]"
            type="submit"
          >
            Apply
          </button>
          <Link
            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent"
            href="/"
          >
            Reset
          </Link>
        </div>
      </div>
    </form>
  );
}
