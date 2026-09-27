import Link from "next/link";
import { leadingBrands } from "@/lib/brands";

export function BrandBar({ active }: { active?: string }) {
  const chip = (selected: boolean) =>
    `inline-flex h-11 shrink-0 items-center whitespace-nowrap px-3 text-xs uppercase tracking-[0.14em] sm:px-4 ${
      selected ? "bg-ink text-cream" : "border border-line bg-paper text-ink hover:border-ink"
    }`;

  return (
    <div className="flex flex-nowrap items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Link href="/shop" className={chip(!active)}>
        All
      </Link>
      {leadingBrands.map((brand) => (
        <Link
          key={brand}
          href={`/shop?category=${encodeURIComponent(brand)}`}
          className={chip(active === brand)}
        >
          {brand}
        </Link>
      ))}
    </div>
  );
}
