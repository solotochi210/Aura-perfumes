import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/storefront/product-detail";
import { getProductBySlug } from "@/lib/catalog";
import { getPublicSettings } from "@/lib/settings";
import { formatNaira } from "@/lib/money";
import { getSiteUrl } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Perfume" };
  const description = product.description.slice(0, 160);
  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} · Aurane`,
      description,
      images: product.images[0]
        ? [{ url: product.images[0], alt: `${product.name} perfume, ${product.sizeMl}ml` }]
        : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getPublicSettings()]);
  if (!product) notFound();

  const availability =
    product.stockStatus === "IN_STOCK" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    brand: { "@type": "Brand", name: settings.businessName },
    offers: {
      "@type": "Offer",
      url: `${getSiteUrl()}/product/${product.slug}`,
      priceCurrency: "NGN",
      price: (product.price / 100).toFixed(2),
      availability,
    },
  };

  return (
    <article className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductDetail
        whatsappNumber={settings.whatsappNumber}
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          price: product.price,
          sizeMl: product.sizeMl,
          category: product.category,
          images: product.images,
          stockStatus: product.stockStatus,
        }}
      />
      <p className="sr-only">{formatNaira(product.price)}</p>
    </article>
  );
}
