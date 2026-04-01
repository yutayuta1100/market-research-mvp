import type { ScoreBreakdown } from "@/lib/candidates/types";

interface ScoreBreakdownCardProps {
  score: ScoreBreakdown;
}

export function ScoreBreakdownCard({ score }: ScoreBreakdownCardProps) {
  return (
    <section className="panel-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Explainable score</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Why this candidate ranks here</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{score.summary}</p>
        </div>
        <div className="rounded-[24px] bg-accentSoft px-5 py-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Score</p>
          <p className="mt-1 text-3xl font-semibold text-ink">{score.total}</p>
        </div>
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

      <div className="mt-6 rounded-[22px] border border-line/80 bg-white/75 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Risk notes</h3>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
          {score.risks.map((risk) => (
            <li key={risk}>• {risk}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

