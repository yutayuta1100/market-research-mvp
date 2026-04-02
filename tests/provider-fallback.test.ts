import { describe, expect, it } from "vitest";

import { buildSignalConnectors } from "@/lib/connectors/registry";
import { getWatchTargets } from "@/lib/mock/fixtures";

describe("buildSignalConnectors", () => {
  it("keeps mock fallbacks active when live connectors are disabled or missing credentials", async () => {
    const connectors = buildSignalConnectors({
      useMockProviders: false,
      xEnabled: false,
      amazonEnabled: false,
      keepaEnabled: false,
      xBearerToken: "",
      amazonAccessKeyId: "",
      amazonSecretAccessKey: "",
      keepaApiKey: "",
      xRequestTimeoutMs: 15000,
      xDefaultQueryWindowDays: 7,
      xDefaultLocale: "ja",
      logLevel: "error",
    }, "en");

    const batches = await Promise.all(
      connectors.map((connector) =>
        connector.fetchSignals({
          keywords: ["limited release", "restock", "best seller", "price spike"],
          categories: ["Collectibles", "Audio", "Gaming", "Power"],
          targets: getWatchTargets("en"),
        }),
      ),
    );

    expect(connectors).toHaveLength(3);
    expect(connectors.every((connector) => connector.mode === "mock")).toBe(true);
    expect(batches.every((batch) => batch.status.statusMessage.includes("Mock fallback"))).toBe(true);
    expect(batches.flatMap((batch) => batch.signals).length).toBeGreaterThan(0);
  });

  it("falls back to mock X data when live X is enabled without a bearer token", async () => {
    const connectors = buildSignalConnectors(
      {
        useMockProviders: false,
        xEnabled: true,
        amazonEnabled: false,
        keepaEnabled: false,
        xBearerToken: "",
        amazonAccessKeyId: "",
        amazonSecretAccessKey: "",
        keepaApiKey: "",
        xRequestTimeoutMs: 15000,
        xDefaultQueryWindowDays: 7,
        xDefaultLocale: "ja",
        logLevel: "error",
      },
      "en",
    );

    const xResult = await connectors[0]?.fetchSignals({
      keywords: ["limited release"],
      categories: ["Collectibles"],
      targets: getWatchTargets("en"),
    });

    expect(connectors[0]?.mode).toBe("mock");
    expect(xResult?.status.mode).toBe("mock");
    expect(xResult?.status.statusMessage).toContain("Mock fallback");
    expect(xResult?.signals.length).toBeGreaterThan(0);
  });

  it("promotes X to live while exposing Amazon and Keepa as stubs when mock mode is disabled", () => {
    const connectors = buildSignalConnectors({
      useMockProviders: false,
      xEnabled: true,
      amazonEnabled: true,
      keepaEnabled: true,
      xBearerToken: "token",
      amazonAccessKeyId: "",
      amazonSecretAccessKey: "",
      keepaApiKey: "",
      xRequestTimeoutMs: 15000,
      xDefaultQueryWindowDays: 7,
      xDefaultLocale: "ja",
      logLevel: "error",
    }, "en");

    expect(connectors.map((connector) => connector.mode)).toEqual(["live", "stub", "stub"]);
  });
});
