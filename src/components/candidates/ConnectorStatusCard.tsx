import { titleCase } from "@/lib/formatters";
import type { ConnectorStatus } from "@/lib/candidates/types";

interface ConnectorStatusCardProps {
  connectorStatuses: ConnectorStatus[];
}

export function ConnectorStatusCard({ connectorStatuses }: ConnectorStatusCardProps) {
  return (
    <div className="panel-surface p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Connector posture</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Mock-first source health</h2>
        </div>
        <span className="pill">Milestone 1</span>
      </div>

      <div className="mt-6 space-y-4">
        {connectorStatuses.map((connector) => (
          <div
            key={connector.kind}
            className="rounded-[22px] border border-line/80 bg-white/75 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">{titleCase(connector.kind)}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{connector.statusMessage}</p>
              </div>
              <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Mock
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

