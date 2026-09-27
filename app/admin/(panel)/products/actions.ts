"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { actionError, type ActionResult } from "@/lib/errors";
import { nairaToKobo } from "@/lib/money";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/slug";
import {
  inlineProductSchema,
  productEditSchema,
  productFormSchema,
} from "@/lib/validations/product";

function refreshCatalogue(slug?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  if (slug) revalidatePath(`/product/${slug}`);
}

export async function createProduct(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  try {
    const data = productFormSchema.parse(input);
    await db.$transaction(async (tx) => {
      const base = slugify(data.name);
      let slug = base;
      let suffix = 1;
      while (await tx.product.findUnique({ where: { slug } })) {
        suffix += 1;
        slug = `${base}-${suffix}`;
      }
      await tx.product.create({
        data: {
          name: data.name,
          description: data.description,
          price: nairaToKobo(data.priceNaira),
          costPrice: nairaToKobo(data.costPriceNaira),
          stockStatus: data.stockStatus,
          stockQty: data.stockQty,
          color: data.color ?? "",
          texture: data.texture ?? "",
          images: data.images,
          category: data.category,
          slug,
          sizeMl: data.sizeMl,
          featured: data.featured,
          history: {
            create: {
              note: `Added. Stock ${data.stockQty}. Size ${data.sizeMl}ml${data.color ? ` · ${data.color}` : ""}${data.texture ? ` · ${data.texture}` : ""}.`,
            },
          },
        },
      });
    });
    refreshCatalogue();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: actionError(error, "The perfume could not be saved.") };
  }
}

export async function updateProduct(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  try {
    const data = productEditSchema.parse(input);
    const current = await db.product.findUnique({ where: { id: data.id } });
    if (!current) return { ok: false, error: "That perfume no longer exists." };
    await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: data.id },
        data: {
          name: data.name,
          description: data.description,
          price: nairaToKobo(data.priceNaira),
          costPrice: nairaToKobo(data.costPriceNaira),
          stockStatus: data.stockStatus,
          stockQty: data.stockQty,
          color: data.color ?? "",
          texture: data.texture ?? "",
          images: data.images,
          category: data.category,
          sizeMl: data.sizeMl,
          featured: data.featured,
          history: {
            create: {
              note: `Updated. Stock ${data.stockQty}. Size ${data.sizeMl}ml${data.color ? ` · ${data.color}` : ""}${data.texture ? ` · ${data.texture}` : ""}.`,
            },
          },
        },
      });
    });
    refreshCatalogue(current.slug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: actionError(error, "The perfume could not be updated.") };
  }
}

export async function updateProductImages(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  try {
    const data = productEditSchema.pick({ id: true, images: true }).parse(input);
    const current = await db.product.findUnique({ where: { id: data.id } });
    if (!current) return { ok: false, error: "That perfume no longer exists." };
    await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: data.id },
        data: { images: data.images },
      });
    });
    refreshCatalogue(current.slug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: actionError(error, "The pictures could not be saved.") };
  }
}

export async function updateProductInline(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  try {
    const data = inlineProductSchema.parse(input);
    const current = await db.product.findUnique({ where: { id: data.id } });
    if (!current) return { ok: false, error: "That perfume no longer exists." };
    await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: data.id },
        data: {
          ...(data.priceNaira !== undefined ? { price: nairaToKobo(data.priceNaira) } : {}),
          ...(data.costPriceNaira !== undefined
            ? { costPrice: nairaToKobo(data.costPriceNaira) }
            : {}),
          ...(data.stockStatus ? { stockStatus: data.stockStatus } : {}),
          ...(data.featured !== undefined ? { featured: data.featured } : {}),
        },
      });
    });
    refreshCatalogue(current.slug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: actionError(error, "The change could not be saved.") };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const current = await db.product.findUnique({ where: { id } });
    if (!current) return { ok: false, error: "That perfume no longer exists." };
    await db.$transaction(async (tx) => {
      await tx.product.delete({ where: { id } });
    });
    refreshCatalogue(current.slug);
    return { ok: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return {
        ok: false,
        error: "This perfume is on an order. Mark it sold instead of deleting it.",
      };
    }
    return { ok: false, error: actionError(error, "The perfume could not be removed.") };
  }
}
