import type { ScoreBreakdown } from "@/lib/candidates/types";
import { getDictionary, type AppLocale } from "@/lib/i18n";

interface ScoreBreakdownCardProps {
  score: ScoreBreakdown;
  locale: AppLocale;
}

export function ScoreBreakdownCard({ score, locale }: ScoreBreakdownCardProps) {
  const dictionary = getDictionary(locale);
  const bandClassName =
    score.band === "high"
      ? "bg-[#eff6ea] text-success"
      : score.band === "medium"
        ? "bg-[#fff4dd] text-[#9b6b14]"
        : "bg-[#fbede4] text-warning";

  return (
    <section className="panel-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">{dictionary.score.eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">{dictionary.score.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{score.summary}</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink">{score.recommendation}</p>
        </div>
        <div className="rounded-[24px] bg-accentSoft px-5 py-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{dictionary.score.scoreLabel}</p>
          <p className="mt-1 text-3xl font-semibold text-ink">{score.total}</p>
          <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${bandClassName}`}>
            {dictionary.score.bandLabels[score.band]}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {score.inputs.map((input) => (
          <article key={input.key} className="rounded-[22px] border border-line/80 bg-white/75 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{input.label}</p>
            <p className="mt-3 text-base font-semibold text-ink">{input.value}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {score.components.map((component) => (
          <article key={component.key} className="rounded-[22px] border border-line/80 bg-white/75 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-ink">{component.label}</h3>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  component.value >= 0 ? "bg-[#eff6ea] text-success" : "bg-[#fbede4] text-warning"
                }`}
              >
                {component.value >= 0 ? `+${component.value}` : component.value}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">{component.rationale}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[22px] border border-line/80 bg-white/75 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
            {dictionary.score.deductionsTitle}
          </h3>
          <div className="mt-3 space-y-3">
            {score.deductions.map((deduction) => (
              <article key={deduction.key} className="rounded-2xl bg-[#fcf6f1] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">{deduction.label}</p>
                  <span className="rounded-full bg-[#fbede4] px-3 py-1 text-xs font-semibold text-warning">
                    {deduction.value}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{deduction.rationale}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[22px] border border-line/80 bg-white/75 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">{dictionary.score.riskNotes}</h3>
          {score.risks.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
              {score.risks.map((risk) => (
                <li key={risk}>• {risk}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted">{dictionary.score.noRisks}</p>
          )}
        </div>
      </div>
    </section>
  );
}
