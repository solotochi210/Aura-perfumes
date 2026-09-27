import { db } from "@/lib/db";
import { ProductManager } from "@/components/admin/product-manager";

export default async function ProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { history: { orderBy: { createdAt: "desc" }, take: 3 } },
  });
  return (
    <ProductManager
      products={products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        costPrice: product.costPrice,
        stockStatus: product.stockStatus,
        stockQty: product.stockQty,
        color: product.color,
        texture: product.texture,
        images: product.images,
        category: product.category,
        sizeMl: product.sizeMl,
        featured: product.featured,
        history: product.history.map((entry) => entry.note),
      }))}
    />
  );
}
