import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return <AdminShell email={session.user.email ?? ""}>{children}</AdminShell>;
}
