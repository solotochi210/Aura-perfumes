"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { cartCount, useCart } from "@/store/cart";

const container = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";
const logoSrc =
  "https://dodptt9f4zk9h.cloudfront.net/stores/294798/da31fd5d-07dc-4849-91be-91e1c034f75a.jpeg";

export function SiteHeader({
  businessName,
  isAdmin,
}: {
  businessName: string;
  isAdmin: boolean;
}) {
  const items = useCart((state) => state.items);
  const open = useCart((state) => state.open);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const count = hydrated ? cartCount(items) : 0;
  const router = useRouter();
  const [query, setQuery] = useState("");

  function closeMenu() {
    setMenuOpen(false);
  }

  function search(event: FormEvent) {
    event.preventDefault();
    const term = query.trim();
    setMenuOpen(false);
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  }

  return (
    <header className="relative border-b border-line/80 bg-cream/95 backdrop-blur-md">
      <div className={`${container} flex h-16 items-center justify-between gap-3 md:h-20`}>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <nav className="hidden items-center gap-8 text-xs uppercase tracking-[0.22em] text-ink-soft md:flex">
          <Link href="/shop" className="inline-flex h-11 items-center transition hover:text-ink">
            Shop
          </Link>
          <Link href="/#contact" className="inline-flex h-11 items-center transition hover:text-ink">
            Contact
          </Link>
        </nav>
        <Link href="/" className="font-serif text-3xl tracking-wide text-ink">
          <Image
            src={logoSrc}
            alt={businessName}
            width={200}
            height={200}
            priority
            unoptimized
            className="h-12 w-auto md:h-16"
          />
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/admin"
            className="hidden h-11 items-center px-2 text-xs uppercase tracking-[0.18em] text-ink-soft transition hover:text-ink sm:inline-flex"
          >
            {isAdmin ? "Dashboard" : "Login"}
          </Link>
          <button
            type="button"
            onClick={open}
            className="inline-flex h-11 shrink-0 items-center gap-1 whitespace-nowrap px-1 text-xs uppercase tracking-[0.16em]"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5 shrink-0 -translate-y-px" aria-hidden />
            <span className="leading-none">Cart</span>
            <span className="min-w-4 leading-none text-brass-deep">{count}</span>
          </button>
        </div>
      </div>
      <form onSubmit={search} className={`${container} flex flex-wrap items-center gap-2 pb-3`}>
        <label className="sr-only" htmlFor="shop-search">
          Search perfumes
        </label>
        <input
          id="shop-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search perfumes"
          className="h-11 min-w-0 flex-1 border border-line bg-paper px-3 text-sm outline-none focus:border-brass"
        />
        <button
          type="submit"
          className="inline-flex h-11 items-center gap-2 bg-ink px-4 text-xs uppercase tracking-[0.16em] text-cream"
        >
          <Search className="h-4 w-4" aria-hidden />
          Search
        </button>
        <span
          className="inline-flex h-11 shrink-0 items-center gap-2 border border-line bg-paper px-3 text-sm"
          title="Nigeria · Naira"
        >
          <svg viewBox="0 0 18 12" className="h-4 w-6 shrink-0 border border-line/70" aria-label="Nigeria" role="img">
            <rect width="6" height="12" fill="#008751" />
            <rect x="6" width="6" height="12" fill="#ffffff" />
            <rect x="12" width="6" height="12" fill="#008751" />
          </svg>
          <span className="font-medium">₦</span>
        </span>
      </form>
      {menuOpen ? (
        <nav className="absolute inset-x-0 top-full z-40 flex h-[calc(100dvh-9.5rem)] flex-col gap-2 overflow-y-auto border-t border-line bg-cream px-4 py-6 md:hidden">
          <Link href="/shop" onClick={closeMenu} className="flex h-12 items-center text-sm uppercase tracking-[0.18em]">
            Shop
          </Link>
          <Link href="/#contact" onClick={closeMenu} className="flex h-12 items-center text-sm uppercase tracking-[0.18em]">
            Contact
          </Link>
          <Link href="/admin" onClick={closeMenu} className="flex h-12 items-center text-sm uppercase tracking-[0.18em]">
            {isAdmin ? "Dashboard" : "Login"}
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
