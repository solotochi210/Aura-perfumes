import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { brandFromName } from "../lib/brands";

for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (!match || process.env[match[1]]) continue;
  let value = match[2].trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  process.env[match[1]] = value;
}

async function main() {
  const db = new PrismaClient();
  const products = await db.product.findMany({ select: { id: true, name: true, category: true } });
  let updated = 0;
  const fallback: string[] = [];
  for (const product of products) {
    const brand = brandFromName(product.name);
    const first = product.name.trim().split(/\s+/)[0] ?? "";
    if (brand.toLowerCase() === first.toLowerCase()) fallback.push(product.name);
    if (brand === product.category) continue;
    await db.product.update({ where: { id: product.id }, data: { category: brand } });
    updated += 1;
  }
  const brands = await db.product.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });
  console.log(`updated ${updated} of ${products.length}`);
  console.log(brands.map((row) => row.category).join(", "));
  console.log("--- unmatched ---");
  console.log(fallback.join("\n"));
  await db.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Brand update failed");
  process.exit(1);
});
