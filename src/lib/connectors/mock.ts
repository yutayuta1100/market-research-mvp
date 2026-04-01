import { mockSignalFixtures } from "@/lib/mock/fixtures";
import type { ConnectorContext, ConnectorKind, ConnectorSignal, SignalConnector } from "@/lib/connectors/types";

function matchesContext(signal: ConnectorSignal, context: ConnectorContext) {
  const keywordMatch =
    context.keywords.length === 0 || context.keywords.some((keyword) => keyword === signal.keyword);
  const categoryMatch =
    context.categories.length === 0 ||
    context.categories.some((category) => category.toLowerCase() === signal.category.toLowerCase());

  return keywordMatch && categoryMatch;
}

export function createMockConnector(kind: ConnectorKind, statusMessage: string): SignalConnector {
  return {
    kind,
    mode: "mock",
    statusMessage,
    async fetchSignals(context) {
      return mockSignalFixtures[kind].filter((signal) => matchesContext(signal, context));
    },
  };
}

