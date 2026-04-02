import type { AppLocale } from "@/lib/i18n";
import type { ConnectorFetchResult, ConnectorKind, SignalConnector } from "@/lib/connectors/types";

export function createStubConnector(
  kind: ConnectorKind,
  statusMessage: string,
  _locale: AppLocale = "ja",
): SignalConnector {
  return {
    kind,
    mode: "stub",
    async fetchSignals(): Promise<ConnectorFetchResult> {
      return {
        signals: [],
        status: {
          kind,
          mode: "stub",
          state: "ready",
          statusMessage,
        },
      };
    },
  };
}
