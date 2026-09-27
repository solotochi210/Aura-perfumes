import type { Metadata } from "next";
import { Suspense } from "react";
import { BrandBar } from "@/components/storefront/brand-bar";
import { ProductCard } from "@/components/storefront/product-card";
import { ShopControls } from "@/components/storefront/shop-controls";
import { searchProducts } from "@/lib/catalog";
import { getPublicSettings } from "@/lib/settings";
import { shopQuerySchema } from "@/lib/validations/order";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse Aurane perfumes, oils, and skin care.",
};

function groupByBrand<T extends { category: string }>(products: T[]) {
  const order: string[] = [];
  const map = new Map<string, T[]>();
  for (const product of products) {
    const existing = map.get(product.category);
    if (existing) existing.push(product);
    else {
      map.set(product.category, [product]);
      order.push(product.category);
    }
  }
  return order.map((brand) => ({ brand, products: map.get(brand) ?? [] }));
}

function clean(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const parsed = shopQuerySchema.safeParse({
    q: clean(params.q),
    category: clean(params.category),
    size: clean(params.size),
    min: clean(params.min),
    max: clean(params.max),
    sort: clean(params.sort),
  });
  const query = parsed.success ? parsed.data : {};
  const [products, settings] = await Promise.all([searchProducts(query), getPublicSettings()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.28em] text-brass-deep">Collection</p>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl">The shop</h1>
      </header>
      <BrandBar active={query.category} />
      <Suspense fallback={<div className="mt-6 h-28 border border-line bg-paper" />}>
        <ShopControls />
      </Suspense>
      {products.length === 0 ? (
        <div className="py-20">
          <p className="font-serif text-4xl">No perfumes match</p>
          <p className="mt-3 text-sm text-muted">Try another name, family, or price.</p>
        </div>
      ) : (
        <div className="mt-10 space-y-14">
          {groupByBrand(products).map((group) => (
            <section key={group.brand}>
              <h2 className="font-serif text-3xl sm:text-4xl">{group.brand}</h2>
              <div className="mt-6 grid grid-cols-1 items-stretch gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {group.products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    whatsappNumber={settings.whatsappNumber}
                    priority={index < 2}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
