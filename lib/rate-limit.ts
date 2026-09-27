import { headers } from "next/headers";
import { db } from "@/lib/db";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function clientIp(headerList: Headers) {
  return headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function getRequestIp() {
  const headerList = await headers();
  return clientIp(headerList);
}

export async function assertLoginAllowed(email: string, ip: string) {
  const since = new Date(Date.now() - WINDOW_MS);
  try {
    const [emailCount, ipCount] = await Promise.all([
      db.loginAttempt.count({
        where: { key: `email:${email}`, createdAt: { gte: since } },
      }),
      db.loginAttempt.count({
        where: { key: `ip:${ip}`, createdAt: { gte: since } },
      }),
    ]);
    if (emailCount >= MAX_ATTEMPTS || ipCount >= MAX_ATTEMPTS) {
      throw new Error("Too many sign-in attempts. Please wait 15 minutes.");
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Too many")) throw error;
    throw new Error("Sign-in is unavailable right now.");
  }
}

export async function recordFailedLogin(email: string, ip: string) {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await db.$transaction([
    db.loginAttempt.deleteMany({ where: { createdAt: { lt: dayAgo } } }),
    db.loginAttempt.create({ data: { key: `email:${email}` } }),
    db.loginAttempt.create({ data: { key: `ip:${ip}` } }),
  ]);
}
