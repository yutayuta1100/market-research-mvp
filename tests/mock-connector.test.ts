import { describe, expect, it } from "vitest";

import { createMockConnector } from "@/lib/connectors/mock";
import { getWatchTargets } from "@/lib/mock/fixtures";

describe("createMockConnector", () => {
  it("filters fixture signals to the configured watch targets", async () => {
    const target = getWatchTargets("en")[1];
    if (!target) {
      throw new Error("Expected a seeded watch target.");
    }

    const connector = createMockConnector("x", "Mock feed active.", "en");
    const result = await connector.fetchSignals({
      keywords: ["restock"],
      categories: ["Gaming"],
      targets: [target],
    });

    expect(result.status.mode).toBe("mock");
    expect(result.signals.length).toBeGreaterThan(0);
    expect(result.signals.every((signal) => signal.candidateSlug === target.candidateSlug)).toBe(true);
  });
});
