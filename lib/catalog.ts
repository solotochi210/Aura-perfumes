import { Prisma } from "@prisma/client";
import { db, withDatabase } from "@/lib/db";
import type { ShopQuery } from "@/lib/validations/order";

export const publicProductSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  stockStatus: true,
  images: true,
  category: true,
  slug: true,
  sizeMl: true,
  featured: true,
  createdAt: true,
} satisfies Prisma.ProductSelect;

export type PublicProduct = Prisma.ProductGetPayload<{
  select: typeof publicProductSelect;
}>;

type AssertNoCost = "costPrice" extends keyof PublicProduct ? never : true;
const _assertNoCost: AssertNoCost = true;
void _assertNoCost;

const retiredSampleNames = ["Irora", "Amber Veil", "Cedar Psalm", "Citrus Hour", "Noir Petal", "Salt Silk"];

export async function listFeaturedProducts() {
  return withDatabase([], () => db.product.findMany({
    where: { featured: true, stockStatus: "IN_STOCK", name: { notIn: retiredSampleNames } },
    select: publicProductSelect,
    orderBy: [{ category: "asc" }, { name: "asc" }],
    take: 8,
  }));
}

export async function listCategories() {
  const rows = await withDatabase([], () => db.product.findMany({
    where: { name: { notIn: retiredSampleNames } },
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  }));
  return rows.map((row) => row.category);
}

export async function searchProducts(query: ShopQuery) {
  const price: Prisma.IntFilter = {};
  if (query.min !== undefined) price.gte = Math.round(query.min * 100);
  if (query.max !== undefined) price.lte = Math.round(query.max * 100);

  const orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] =
    query.sort === "price-asc"
      ? { price: "asc" }
      : query.sort === "price-desc"
        ? { price: "desc" }
        : [{ category: "asc" }, { name: "asc" }];

  return withDatabase([], () => db.product.findMany({
    where: {
      name: { notIn: retiredSampleNames },
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" } },
              { description: { contains: query.q, mode: "insensitive" } },
              { category: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.size ? { sizeMl: query.size } : {}),
      ...(query.min !== undefined || query.max !== undefined ? { price } : {}),
    },
    select: publicProductSelect,
    orderBy,
    take: 200,
  }));
}

export async function getProductBySlug(slug: string) {
  return withDatabase(null, () =>
    db.product.findUnique({
      where: { slug },
      select: publicProductSelect,
    }),
  );
}

export async function listProductSlugs() {
  return withDatabase([], () =>
    db.product.findMany({
      select: { slug: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  );
}
