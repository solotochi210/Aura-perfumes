import bcrypt from "bcryptjs";
import { STARTER_HOUSE } from "../lib/constants";
import { db } from "../lib/db";

const samples = [
  {
    name: "Irora",
    slug: "irora",
    description:
      "A dawn floral. Neroli opens over a soft rose, then settles into warm musk. Made to be worn close, never announced across a room.",
    price: 4_500_000,
    costPrice: 1_800_000,
    category: "Floral",
    sizeMl: 50,
    featured: true,
    stockStatus: "IN_STOCK" as const,
  },
  {
    name: "Amber Veil",
    slug: "amber-veil",
    description:
      "Resin, vanilla, and a thread of smoke. Amber Veil stays on skin through a Lagos evening and leaves a quiet trace on a scarf.",
    price: 5_200_000,
    costPrice: 2_100_000,
    category: "Amber",
    sizeMl: 50,
    featured: true,
    stockStatus: "IN_STOCK" as const,
  },
  {
    name: "Cedar Psalm",
    slug: "cedar-psalm",
    description:
      "Dry cedar, a little incense, and sun-warmed woods. A deeper bottle for someone who prefers texture to sweetness.",
    price: 8_500_000,
    costPrice: 3_400_000,
    category: "Woody",
    sizeMl: 100,
    featured: true,
    stockStatus: "IN_STOCK" as const,
  },
  {
    name: "Citrus Hour",
    slug: "citrus-hour",
    description:
      "Bitter orange, green leaf, and a clean musk. Bright in the first hour, then soft enough for the rest of the day.",
    price: 2_800_000,
    costPrice: 1_100_000,
    category: "Citrus",
    sizeMl: 30,
    featured: true,
    stockStatus: "IN_STOCK" as const,
  },
  {
    name: "Noir Petal",
    slug: "noir-petal",
    description:
      "Dark rose, spice, and a balsamic base. Oriental in character, composed to feel intimate rather than heavy.",
    price: 6_200_000,
    costPrice: 2_500_000,
    category: "Oriental",
    sizeMl: 50,
    featured: false,
    stockStatus: "IN_STOCK" as const,
  },
  {
    name: "Salt Silk",
    slug: "salt-silk",
    description:
      "A fresh marine breeze over pale florals. Light, clean, and easy to wear in heat.",
    price: 3_200_000,
    costPrice: 1_300_000,
    category: "Fresh",
    sizeMl: 30,
    featured: false,
    stockStatus: "IN_STOCK" as const,
  },
];

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before seeding.");
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await db.adminUser.upsert({
    where: { email },
    update: { hashedPassword, name: "Ojoma Admin" },
    create: { email, hashedPassword, name: "Ojoma Admin" },
  });

  await db.settings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", ...STARTER_HOUSE },
  });

  const house = await db.settings.findUnique({ where: { id: "default" } });
  if (house) {
    const patch: Partial<typeof STARTER_HOUSE> = {};
    for (const key of Object.keys(STARTER_HOUSE) as (keyof typeof STARTER_HOUSE)[]) {
      if (house[key]) continue;
      if (key === "whatsappNumber" && house.businessPhone) {
        patch.whatsappNumber = house.businessPhone;
        continue;
      }
      patch[key] = STARTER_HOUSE[key];
    }
    if (Object.keys(patch).length > 0) {
      await db.settings.update({ where: { id: "default" }, data: patch });
    }
  }

  await db.invoiceSequence.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", current: 1000 },
  });

  const existing = await db.product.count();
  if (existing === 0) {
    await db.product.createMany({ data: samples });
  }

  const sampleRef = "OJ-SAMPLE";
  const sampleExists = await db.order.findUnique({ where: { publicRef: sampleRef } });
  if (!sampleExists) {
    const product = await db.product.findFirst({ where: { slug: "irora" } });
    if (product) {
      await db.order.create({
        data: {
          publicRef: sampleRef,
          customerName: "Sample order",
          customerPhone: STARTER_HOUSE.whatsappNumber,
          customerEmail: STARTER_HOUSE.businessEmail,
          totalAmount: product.price,
          status: "PAID",
          paymentMethod: "TRANSFER",
          items: {
            create: {
              productId: product.id,
              quantity: 1,
              unitPrice: product.price,
              unitCost: product.costPrice,
            },
          },
        },
      });
    }
  }

  console.log("Seed complete. Admin account is ready.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
