"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { actionError, isNextRedirect } from "@/lib/errors";
import { assertLoginAllowed, getRequestIp } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations/auth";

export async function loginAction(input: unknown) {
  try {
    const parsed = loginSchema.parse(input);
    const email = parsed.email.toLowerCase();
    await assertLoginAllowed(email, await getRequestIp());
    await signIn("credentials", {
      email,
      password: parsed.password,
      redirectTo: "/admin",
    });
    return { ok: true as const };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    if (error instanceof AuthError) {
      return { ok: false as const, error: "Invalid email or password." };
    }
    return { ok: false as const, error: actionError(error, "Sign-in is unavailable right now.") };
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
