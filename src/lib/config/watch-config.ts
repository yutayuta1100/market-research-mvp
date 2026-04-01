import { env, splitCsv } from "@/lib/config/env";

export const watchConfig = {
  keywords: splitCsv(env.MOCK_WATCH_KEYWORDS),
  categories: splitCsv(env.MOCK_WATCH_CATEGORIES),
};

