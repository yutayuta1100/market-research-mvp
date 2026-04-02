import type { ConnectorStatus } from "@/lib/candidates/types";
import { getConnectorLabel, getDictionary, type AppLocale } from "@/lib/i18n";

interface ConnectorStatusCardProps {
  connectorStatuses: ConnectorStatus[];
  locale: AppLocale;
}

export function ConnectorStatusCard({ connectorStatuses, locale }: ConnectorStatusCardProps) {
  const dictionary = getDictionary(locale);

  return (
    <div className="panel-surface p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            {dictionary.connectorStatus.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">{dictionary.connectorStatus.title}</h2>
        </div>
        <span className="pill">{dictionary.connectorStatus.milestoneBadge}</span>
      </div>

      <div className="mt-6 space-y-4">
        {connectorStatuses.map((connector) => (
          <div
            key={connector.kind}
            className={`rounded-[22px] border bg-white/75 p-4 ${
              connector.state === "degraded" ? "border-warning/50" : "border-line/80"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">{getConnectorLabel(connector.kind, locale)}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{connector.statusMessage}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  {dictionary.connectorStatus.modeLabels[connector.mode]}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                    connector.state === "degraded"
                      ? "bg-[#fbede4] text-warning"
                      : "bg-[#eff6ea] text-success"
                  }`}
                >
                  {dictionary.connectorStatus.stateLabels[connector.state]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
