import { getCategoryLabel, getKeywordLabel, type AppLocale } from "@/lib/i18n";
import { getMockSignalFixtures } from "@/lib/mock/fixtures";
import type { ConnectorContext, ConnectorKind, ConnectorSignal, SignalConnector } from "@/lib/connectors/types";

function matchesContext(signal: ConnectorSignal, context: ConnectorContext, locale: AppLocale) {
  const localizedKeywords = context.keywords.map((keyword) => getKeywordLabel(keyword, locale).toLowerCase());
  const localizedCategories = context.categories.map((category) => getCategoryLabel(category, locale).toLowerCase());
  const keywordMatch =
    localizedKeywords.length === 0 || localizedKeywords.some((keyword) => keyword === signal.keyword.toLowerCase());
  const categoryMatch =
    localizedCategories.length === 0 || localizedCategories.some((category) => category === signal.category.toLowerCase());

  return keywordMatch && categoryMatch;
}

export function createMockConnector(
  kind: ConnectorKind,
  statusMessage: string,
  locale: AppLocale = "ja",
): SignalConnector {
  return {
    kind,
    mode: "mock",
    statusMessage,
    async fetchSignals(context) {
      return getMockSignalFixtures(locale)[kind].filter((signal) => matchesContext(signal, context, locale));
    },
  };
}
