import { describe, expect, it } from "vitest";

import { buildSignalConnectors } from "@/lib/connectors/registry";
import { getWatchTargets } from "@/lib/mock/fixtures";

describe("buildSignalConnectors", () => {
  it("uses the public-data live connectors when mock mode is disabled even without private credentials", async () => {
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
      socialRequestTimeoutMs: 15000,
      amazonRequestTimeoutMs: 15000,
      marketRequestTimeoutMs: 15000,
      liveDataRevalidateSeconds: 1800,
      xDefaultQueryWindowDays: 7,
      xDefaultLocale: "ja",
      logLevel: "error",
    }, "en");

    expect(connectors).toHaveLength(3);
    expect(connectors.every((connector) => connector.mode === "live")).toBe(true);
  });

  it("keeps mock fixtures active when mock mode is explicitly enabled", async () => {
    const connectors = buildSignalConnectors(
      {
        useMockProviders: true,
        xEnabled: true,
        amazonEnabled: false,
        keepaEnabled: false,
        xBearerToken: "",
        amazonAccessKeyId: "",
        amazonSecretAccessKey: "",
        keepaApiKey: "",
        xRequestTimeoutMs: 15000,
        socialRequestTimeoutMs: 15000,
        amazonRequestTimeoutMs: 15000,
        marketRequestTimeoutMs: 15000,
        liveDataRevalidateSeconds: 1800,
        xDefaultQueryWindowDays: 7,
        xDefaultLocale: "ja",
        logLevel: "error",
      },
      "en",
    );

    const xResult = await connectors[0]?.fetchSignals({
      keywords: [],
      categories: [],
      targets: getWatchTargets("en"),
    });

    expect(connectors[0]?.mode).toBe("mock");
    expect(xResult?.status.mode).toBe("mock");
    expect(xResult?.signals.length).toBeGreaterThan(0);
  });

  it("promotes all connector slots to live public-data mode when mock mode is disabled", () => {
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
      socialRequestTimeoutMs: 15000,
      amazonRequestTimeoutMs: 15000,
      marketRequestTimeoutMs: 15000,
      liveDataRevalidateSeconds: 1800,
      xDefaultQueryWindowDays: 7,
      xDefaultLocale: "ja",
      logLevel: "error",
    }, "en");

    expect(connectors.map((connector) => connector.mode)).toEqual(["live", "live", "live"]);
  });
});
