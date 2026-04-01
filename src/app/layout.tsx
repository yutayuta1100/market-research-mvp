import type { Metadata } from "next";
import type { ReactNode } from "react";

import { env } from "@/lib/config/env";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title: {
    default: env.APP_NAME,
    template: `%s | ${env.APP_NAME}`,
  },
  description:
    "Mock-first market research dashboard for identifying potentially profitable resale opportunities using public signals and reference links.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </body>
    </html>
  );
}
