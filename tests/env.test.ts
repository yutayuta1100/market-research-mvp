import { describe, expect, it } from "vitest";

import { parseEnvironment } from "@/lib/config/env";

describe("parseEnvironment", () => {
  it("treats empty strings as missing values and derives APP_URL from VERCEL_URL", () => {
    const parsed = parseEnvironment({
      NODE_ENV: "production",
      VERCEL_URL: "market-research-mvp.vercel.app",
      APP_URL: "",
      USE_MOCK_PROVIDERS: "true",
      ENABLE_X_CONNECTOR: "false",
      ENABLE_AMAZON_CONNECTOR: "false",
      ENABLE_KEEPA_CONNECTOR: "false",
      ENABLE_SCHEDULED_JOBS: "false",
      X_BEARER_TOKEN: "",
      AMAZON_ACCESS_KEY_ID: "",
      AMAZON_SECRET_ACCESS_KEY: "",
      KEEPA_API_KEY: "",
      CRON_SECRET: "",
    });

    expect(parsed.env.APP_URL).toBe("https://market-research-mvp.vercel.app");
    expect(parsed.env.X_BEARER_TOKEN).toBeUndefined();
    expect(parsed.envStatus.cronSecretConfigured).toBe(false);
  });

  it("parses scheduled-job settings and booleans explicitly", () => {
    const parsed = parseEnvironment({
      NODE_ENV: "development",
      USE_MOCK_PROVIDERS: "false",
      ENABLE_X_CONNECTOR: "true",
      ENABLE_AMAZON_CONNECTOR: "false",
      ENABLE_KEEPA_CONNECTOR: "false",
      ENABLE_SCHEDULED_JOBS: "true",
      JOB_RETRY_LIMIT: "4",
      JOB_RETRY_BACKOFF_MS: "2500",
      REFRESH_CRON: "0 */4 * * *",
      CRON_SECRET: "secret",
    });

    expect(parsed.env.ENABLE_SCHEDULED_JOBS).toBe(true);
    expect(parsed.env.JOB_RETRY_LIMIT).toBe(4);
    expect(parsed.env.JOB_RETRY_BACKOFF_MS).toBe(2500);
    expect(parsed.env.REFRESH_CRON).toBe("0 */4 * * *");
    expect(parsed.envStatus.scheduledJobsEnabled).toBe(true);
    expect(parsed.envStatus.cronSecretConfigured).toBe(true);
  });
});
