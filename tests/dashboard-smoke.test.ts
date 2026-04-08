import { describe, expect, it } from "vitest";

import { getCandidateBySlug, loadDashboardData } from "@/lib/candidates/service";

describe("dashboard smoke", () => {
  it("loads the default Japanese dashboard without crashing in mock mode", async () => {
    const dashboard = await loadDashboardData({}, "ja");

    expect(dashboard.candidates.length).toBeGreaterThan(0);
    expect(dashboard.connectorStatuses.length).toBe(3);
  });

  it("loads an English candidate detail record by slug", async () => {
    const dashboard = await loadDashboardData({}, "en");
    const candidate = await getCandidateBySlug(dashboard.candidates[0]?.slug ?? "", "en");

    expect(candidate).not.toBeNull();
    expect(candidate?.score.summary.length).toBeGreaterThan(0);
  });
});
