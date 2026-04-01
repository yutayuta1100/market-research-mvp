import { describe, expect, it } from "vitest";

import { buildSignalConnectors } from "@/lib/connectors/registry";

describe("buildSignalConnectors", () => {
  it("keeps Milestone 0 and 1 in mock mode when live credentials are absent", async () => {
    const connectors = buildSignalConnectors({
      useMockProviders: false,
      xEnabled: false,
      amazonEnabled: false,
      keepaEnabled: false,
      xBearerToken: "",
      amazonAccessKeyId: "",
      amazonSecretAccessKey: "",
      keepaApiKey: "",
    });

    const batches = await Promise.all(
      connectors.map((connector) =>
        connector.fetchSignals({
          keywords: ["limited release", "restock", "best seller", "price spike"],
          categories: ["Collectibles", "Audio", "Gaming", "Power"],
        }),
      ),
    );

    expect(connectors).toHaveLength(3);
    expect(connectors.every((connector) => connector.mode === "mock")).toBe(true);
    expect(connectors.every((connector) => connector.statusMessage.includes("Mock fallback"))).toBe(true);
    expect(batches.flat().length).toBeGreaterThan(0);
  });
});
