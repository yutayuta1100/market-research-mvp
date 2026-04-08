import { describe, expect, it, vi } from "vitest";

import { runCandidateRefresh } from "@/lib/jobs/refresh-candidates";
import type { DashboardData } from "@/lib/candidates/service";

function buildDashboardData(): DashboardData {
  return {
    candidates: [
      {
        id: "candidate-1",
        slug: "aurora",
        title: "Aurora",
        brand: "Aurora",
        category: "Audio",
        thumbnailUrl: "",
        shortDescription: "Demo",
        estimatedBuyPrice: 10000,
        estimatedSellPrice: 15000,
        shippingCost: 500,
        otherCost: 0,
        riskFlags: [],
        externalLinks: [],
        lastObservedAt: "2026-03-31T12:00:00.000Z",
        signals: [
          {
            id: "signal-1",
            connector: "x",
            candidateSlug: "aurora",
            keyword: "Aurora",
            category: "Audio",
            metricLabel: "Mentions",
            metricValue: 5,
            strength: 70,
            summary: "Strong chatter",
            observedAt: "2026-03-31T12:00:00.000Z",
          },
        ],
        profit: {
          sellPrice: 15000,
          buyPrice: 10000,
          platformFeeRate: 0.1,
          platformFeeAmount: 1500,
          shippingCost: 500,
          otherCost: 0,
          costBasis: 10500,
          netProfit: 3000,
          marginRate: 0.2,
          roiRate: 0.2857,
          breakevenSalePrice: 11666.67,
        },
        score: {
          total: 62,
          band: "medium",
          summary: "Worth review",
          recommendation: "Keep watching",
          components: [],
          inputs: [],
          deductions: [],
          risks: [],
        },
      },
    ],
    connectorStatuses: [
      {
        kind: "x",
        mode: "mock",
        state: "ready",
        statusMessage: "Mock active",
      },
    ],
    watchKeywords: [],
    watchCategories: [],
    categories: ["Audio"],
  };
}

describe("runCandidateRefresh", () => {
  it("logs a successful refresh run with candidate and signal counts", async () => {
    const saveJobRun = vi.fn();
    const dashboard = buildDashboardData();

    const jobRun = await runCandidateRefresh(
      {
        locale: "en",
        trigger: "manual",
      },
      {
        loadDashboard: vi.fn().mockResolvedValue(dashboard),
        saveJobRun,
        now: vi
          .fn()
          .mockReturnValueOnce(new Date("2026-04-03T09:00:00.000Z"))
          .mockReturnValueOnce(new Date("2026-04-03T09:00:02.000Z")),
        retry: (operation) => operation(1),
      },
    );

    expect(jobRun.status).toBe("success");
    expect(jobRun.candidateCount).toBe(1);
    expect(jobRun.signalCount).toBe(1);
    expect(saveJobRun).toHaveBeenCalledTimes(1);
  });

  it("records a failed run when the refresh keeps throwing", async () => {
    const saveJobRun = vi.fn();

    await expect(
      runCandidateRefresh(
        {
          locale: "ja",
          trigger: "api",
        },
        {
          loadDashboard: vi.fn().mockRejectedValue(new Error("refresh failed")),
          saveJobRun,
          now: vi
            .fn()
            .mockReturnValueOnce(new Date("2026-04-03T09:00:00.000Z"))
            .mockReturnValueOnce(new Date("2026-04-03T09:00:01.000Z")),
          retry: async () => {
            throw new Error("refresh failed");
          },
        },
      ),
    ).rejects.toThrow("refresh failed");

    expect(saveJobRun).toHaveBeenCalledTimes(1);
    expect(saveJobRun.mock.calls[0]?.[0].status).toBe("failed");
  });
});
