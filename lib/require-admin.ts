import type { Session } from "next-auth";
import { redirect } from "next/navigation";
import { isConfiguredAdmin } from "@/lib/admin-identity";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getVerifiedAdmin() {
  const session = await auth();
  const email = session?.user?.email;
  if (!session?.user?.id || !isConfiguredAdmin(email)) return null;

  const admin = await db.adminUser.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true },
  });
  if (!admin || !isConfiguredAdmin(admin.email)) return null;
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await getVerifiedAdmin();
  if (session) return session;

  const current = await auth();
  if (current?.user) {
    await signOut({ redirectTo: "/admin/login" });
  }
  redirect("/admin/login");
}
