"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatNaira } from "@/lib/money";
import { ProductMedia } from "@/components/storefront/product-media";

type Slide = {
  slug: string;
  name: string;
  price: number;
  sizeMl: number;
  category: string;
  image: string | null;
};

export function FeaturedCarousel({ products }: { products: Slide[] }) {
  const [index, setIndex] = useState(0);
  if (products.length === 0) {
    return (
      <p className="text-sm text-muted">The collection is being composed. Please visit again shortly.</p>
    );
  }

  const visible = products.slice(index, index + 1);
  const product = visible[0];

  return (
    <div>
      <div className="grid items-center gap-8 md:grid-cols-2">
        <Link href={`/product/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-cream-deep">
          <ProductMedia
            src={product.image}
            alt={`${product.name} perfume, ${product.sizeMl}ml`}
            sizes="(min-width: 768px) 40vw, 90vw"
            priority
          />
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-brass-deep">{product.category}</p>
          <h3 className="mt-3 font-serif text-5xl md:text-6xl">{product.name}</h3>
          <p className="mt-4 text-sm text-ink-soft">
            {product.sizeMl}ml · {formatNaira(product.price)}
          </p>
          <Link
            href={`/product/${product.slug}`}
            className="mt-8 inline-flex h-12 items-center bg-ink px-6 text-sm text-cream"
          >
            View perfume
          </Link>
          <div className="mt-10 flex gap-3">
            <button
              type="button"
              aria-label="Previous perfume"
              className="inline-flex h-11 w-11 items-center justify-center border border-line"
              onClick={() => setIndex((current) => (current === 0 ? products.length - 1 : current - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next perfume"
              className="inline-flex h-11 w-11 items-center justify-center border border-line"
              onClick={() => setIndex((current) => (current + 1) % products.length)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
