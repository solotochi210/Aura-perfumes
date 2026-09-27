import Link from "next/link";
import { formatNaira } from "@/lib/money";
import { STOCK_LABELS, type StockStatus } from "@/lib/constants";
import type { PublicProduct } from "@/lib/catalog";
import { ProductMedia } from "@/components/storefront/product-media";
import { PurchaseButtons } from "@/components/storefront/purchase-buttons";

export function ProductCard({
  product,
  whatsappNumber,
  priority = false,
}: {
  product: PublicProduct;
  whatsappNumber: string;
  priority?: boolean;
}) {
  const alt = `${product.name} perfume, ${product.sizeMl}ml`;
  const status = product.stockStatus as StockStatus;

  return (
    <article className="group flex h-full flex-col">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-cream-deep">
        <ProductMedia
          src={product.images[0] ?? null}
          alt={alt}
          priority={priority}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          zoom
        />
      </Link>
      <div className="flex flex-1 flex-col pt-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{product.category}</p>
        <h2 className="mt-1 font-serif text-2xl leading-tight text-balance">
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h2>
        <div className="mt-2 flex items-center justify-between gap-3 text-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-brass-deep">
            {product.sizeMl > 0 ? `${product.sizeMl}ml · ` : ""}
            {STOCK_LABELS[status]}
          </p>
          <p>{formatNaira(product.price)}</p>
        </div>
        <div className="mt-auto pt-4">
          <PurchaseButtons
            whatsappNumber={whatsappNumber}
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              sizeMl: product.sizeMl,
              images: product.images,
              stockStatus: status,
            }}
          />
        </div>
      </div>
    </article>
  );
}
