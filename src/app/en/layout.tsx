import type { Metadata } from "next";
import type { ReactNode } from "react";

import { env } from "@/lib/config/env";
import { getDictionary } from "@/lib/i18n";

const dictionary = getDictionary("en");

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  description: dictionary.metadataDescription,
};

export default function EnglishLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <div lang="en">{children}</div>;
}
