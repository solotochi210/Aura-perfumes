import { ZodError } from "zod";

export function isNextRedirect(error: unknown) {
  if (typeof error !== "object" || error === null || !("digest" in error)) {
    return false;
  }
  const digest = (error as { digest: unknown }).digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

export function actionError(error: unknown, fallback: string) {
  if (isNextRedirect(error)) throw error;
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? fallback;
  }
  if (
    error instanceof Error &&
    error.message.length > 0 &&
    error.message.length < 180 &&
    !/prisma|invocation|invalid `prisma/i.test(error.message)
  ) {
    return error.message;
  }
  return fallback;
}

export type ActionResult = { ok: true } | { ok: false; error: string };
