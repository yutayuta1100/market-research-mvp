import { PrismaClient } from "@prisma/client";

import { envStatus } from "@/lib/config/env";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const isDatabaseConfigured = envStatus.databaseConfigured;

export function getPrismaClient() {
  if (!isDatabaseConfigured) {
    throw new Error(
      "DATABASE_URL is not configured. Database-backed runtime features require local Postgres or an external managed Postgres service in Vercel.",
    );
  }

  const prismaClient = globalForPrisma.prisma ?? new PrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaClient;
  }

  return prismaClient;
}
