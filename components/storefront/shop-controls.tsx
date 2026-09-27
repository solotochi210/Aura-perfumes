"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function ShopControls() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [size, setSize] = useState(searchParams.get("size") ?? "");
  const [min, setMin] = useState(searchParams.get("min") ?? "");
  const [max, setMax] = useState(searchParams.get("max") ?? "");
  const incoming = searchParams.get("sort");
  const [sort, setSort] = useState(incoming === "price-asc" || incoming === "price-desc" ? incoming : "brand");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = new URLSearchParams();
      const q = searchParams.get("q");
      const category = searchParams.get("category");
      if (q) next.set("q", q);
      if (category) next.set("category", category);
      if (size) next.set("size", size);
      if (min) next.set("min", min);
      if (max) next.set("max", max);
      if (sort && sort !== "brand") next.set("sort", sort);
      const nextValue = next.toString();
      const current = searchParams.toString();
      if (nextValue !== current) {
        router.replace(nextValue ? `/shop?${nextValue}` : "/shop");
      }
    }, 300);
    return () => window.clearTimeout(handle);
  }, [size, min, max, sort, router, searchParams]);

  return (
    <form className="mt-6 grid gap-3 border border-line bg-paper p-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={(event) => event.preventDefault()}>
      <label>
        <span className="text-[11px] uppercase tracking-[0.16em] text-muted">Size</span>
        <select
          value={size}
          onChange={(event) => setSize(event.target.value)}
          className="mt-2 h-12 w-full border border-line bg-cream px-3 text-sm outline-none"
        >
          <option value="">All</option>
          {[30, 50, 75, 100].map((ml) => (
            <option key={ml} value={ml}>
              {ml}ml
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="text-[11px] uppercase tracking-[0.16em] text-muted">Min ₦</span>
        <input
          inputMode="numeric"
          value={min}
          onChange={(event) => setMin(event.target.value.replace(/[^\d]/g, ""))}
          className="mt-2 h-12 w-full border border-line bg-cream px-3 text-sm outline-none focus:border-brass"
        />
      </label>
      <label>
        <span className="text-[11px] uppercase tracking-[0.16em] text-muted">Max ₦</span>
        <input
          inputMode="numeric"
          value={max}
          onChange={(event) => setMax(event.target.value.replace(/[^\d]/g, ""))}
          className="mt-2 h-12 w-full border border-line bg-cream px-3 text-sm outline-none focus:border-brass"
        />
      </label>
      <label>
        <span className="text-[11px] uppercase tracking-[0.16em] text-muted">Sort</span>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="mt-2 h-12 w-full border border-line bg-cream px-3 text-sm outline-none"
        >
          <option value="brand">Brand</option>
          <option value="price-asc">Price, low to high</option>
          <option value="price-desc">Price, high to low</option>
        </select>
      </label>
    </form>
  );
}
