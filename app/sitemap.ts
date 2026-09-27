import type { MetadataRoute } from "next";
import { listProductSlugs } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  try {
    if (!process.env.DATABASE_URL) return entries;
    const products = await listProductSlugs();
    for (const product of products) {
      entries.push({
        url: `${base}/product/${product.slug}`,
        lastModified: product.createdAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch (error) {
    console.error("Sitemap product list skipped", error);
  }

  return entries;
}
