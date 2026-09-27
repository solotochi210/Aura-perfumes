import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-5">
      <LoginForm />
      <Link href="/" className="mt-8 text-xs uppercase tracking-[0.18em] text-muted">
        Back to the shop
      </Link>
    </div>
  );
}
