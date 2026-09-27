import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaUrl?: string;
};

function databaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;
  const extras: [string, string][] = [
    ["connect_timeout", "20"],
    ["pool_timeout", "30"],
    ["connection_limit", "5"],
  ];
  return extras.reduce((current, [key, value]) => {
    if (current.includes(`${key}=`)) return current;
    return `${current}${current.includes("?") ? "&" : "?"}${key}=${value}`;
  }, raw);
}

const url = databaseUrl();

if (globalForPrisma.prisma && globalForPrisma.prismaUrl !== url) {
  void globalForPrisma.prisma.$disconnect();
  globalForPrisma.prisma = undefined;
}

export const db =
  globalForPrisma.prisma ??
  (url ? new PrismaClient({ datasources: { db: { url } } }) : new PrismaClient());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.prismaUrl = url;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function isDatabaseUnavailable(error: unknown) {
  if (!(error instanceof Error)) return false;
  const code = "code" in error ? String(error.code) : "";
  return (
    error.name === "PrismaClientInitializationError" ||
    code === "P1001" ||
    code === "P1017" ||
    error.message.includes("Can't reach database server") ||
    error.message.includes("ECONNREFUSED") ||
    error.message.toLowerCase().includes("timed out")
  );
}

function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withDatabase<T>(fallback: T, query: () => Promise<T>): Promise<T> {
  if (!isDatabaseConfigured()) return fallback;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await query();
    } catch (error) {
      if (!isDatabaseUnavailable(error)) throw error;
      if (attempt === 0) {
        await pause(1500);
        continue;
      }
      console.warn("Database is unreachable. Continuing without live data.");
      return fallback;
    }
  }
  return fallback;
}
