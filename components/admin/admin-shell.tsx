"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Package, Settings, ShoppingBag, Store, Users } from "lucide-react";
import { signOutAction } from "@/app/admin/login/actions";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Perfumes", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/", label: "View shop", icon: Store },
];

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-cream text-ink md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-paper md:border-r md:border-b-0">
        <div className="px-5 py-6">
          <p className="font-serif text-3xl">Ojoma</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted">Atelier</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 md:flex-col md:px-3">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? false
                : pathname === link.href ||
                  (link.href !== "/admin" && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-3 text-sm whitespace-nowrap",
                  active ? "bg-cream-deep text-ink" : "text-ink-soft hover:bg-cream",
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <form action={signOutAction} className="hidden px-3 pb-6 md:block">
          <button type="submit" className="flex items-center gap-2 px-3 py-3 text-sm text-muted">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          <p className="px-3 text-xs text-muted">{email}</p>
        </form>
      </aside>
      <div>
        <div className="flex items-center justify-between border-b border-line px-5 py-3 md:hidden">
          <p className="text-xs text-muted">{email}</p>
          <form action={signOutAction}>
            <button type="submit" className="text-xs uppercase tracking-[0.14em]">
              Sign out
            </button>
          </form>
        </div>
        <div className="px-5 py-8 md:px-8">{children}</div>
      </div>
    </div>
  );
}
