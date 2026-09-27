import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

export async function takeStock(tx: Tx, productId: string, quantity: number, note: string) {
  const product = await tx.product.findUnique({ where: { id: productId } });
  const taken = await tx.product.updateMany({
    where: {
      id: productId,
      stockStatus: { not: "SOLD" },
      stockQty: { gte: quantity },
    },
    data: { stockQty: { decrement: quantity } },
  });
  if (taken.count !== 1) {
    throw new Error(`${product?.name ?? "A perfume"} does not have enough stock.`);
  }
  const next = await tx.product.findUnique({ where: { id: productId } });
  if (next) {
    await tx.product.update({
      where: { id: productId },
      data: { stockStatus: next.stockQty === 0 ? "OUT_OF_STOCK" : "IN_STOCK" },
    });
  }
  await tx.productHistory.create({ data: { productId, note } });
}

export async function returnStock(tx: Tx, productId: string, quantity: number, note: string) {
  const product = await tx.product.findUnique({ where: { id: productId } });
  if (!product) return;
  const stockQty = product.stockQty + quantity;
  await tx.product.update({
    where: { id: productId },
    data: {
      stockQty,
      stockStatus: product.stockStatus === "SOLD" ? "SOLD" : "IN_STOCK",
    },
  });
  await tx.productHistory.create({ data: { productId, note } });
}
