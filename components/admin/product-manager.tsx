"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { STOCK_LABELS, STOCK_STATUSES, type StockStatus } from "@/lib/constants";
import { formatNaira, koboToNaira } from "@/lib/money";
import { deleteProduct, updateProductInline } from "@/app/admin/(panel)/products/actions";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ProductFormDialog,
  type EditableProduct,
} from "@/components/admin/product-form-dialog";

const tone: Record<StockStatus, "success" | "danger" | "warning"> = {
  IN_STOCK: "success",
  SOLD: "danger",
  OUT_OF_STOCK: "warning",
};

export function ProductManager({ products }: { products: EditableProduct[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EditableProduct | null>(null);

  async function saveInline(id: string, patch: Parameters<typeof updateProductInline>[0]) {
    const result = await updateProductInline(patch);
    if (!result.ok) toast.error(result.error);
    else toast.success("Saved");
    return result.ok;
  }

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-brass-deep">Catalogue</p>
          <h1 className="font-serif text-4xl">Perfumes</h1>
        </div>
        <button
          type="button"
          className="h-11 bg-ink px-5 text-sm text-cream"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Add perfume
        </button>
      </div>
      {products.length === 0 ? (
        <div className="border border-dashed border-line px-6 py-16 text-center">
          <p className="font-serif text-3xl">No perfumes yet</p>
          <p className="mt-2 text-sm text-muted">Add the first bottle to open the shop.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Perfume</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-[#f3ece3]">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          unoptimized
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center font-serif text-lg text-ink/70">
                          {product.name.slice(0, 1)}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted">
                        {product.category} · {product.sizeMl}ml
                        {product.color ? ` · ${product.color}` : ""}
                        {product.texture ? ` · ${product.texture}` : ""}
                      </p>
                      {product.history?.length ? (
                        <p className="mt-1 text-[11px] text-muted">{product.history[0]}</p>
                      ) : null}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <input
                    key={`price-${product.id}-${product.price}`}
                    defaultValue={koboToNaira(product.price)}
                    type="number"
                    aria-label={`Price for ${product.name}`}
                    className="h-10 w-28 border border-line bg-paper px-2 text-sm"
                    onBlur={(event) => {
                      const next = Number(event.target.value);
                      if (!Number.isFinite(next) || next === koboToNaira(product.price)) return;
                      void saveInline(product.id, { id: product.id, priceNaira: next });
                    }}
                  />
                  <p className="mt-1 text-[11px] text-muted">{formatNaira(product.price)}</p>
                </TableCell>
                <TableCell>
                  <input
                    key={`cost-${product.id}-${product.costPrice}`}
                    defaultValue={koboToNaira(product.costPrice)}
                    type="number"
                    aria-label={`Cost for ${product.name}`}
                    className="h-10 w-28 border border-line bg-paper px-2 text-sm"
                    onBlur={(event) => {
                      const next = Number(event.target.value);
                      if (!Number.isFinite(next) || next === koboToNaira(product.costPrice)) return;
                      void saveInline(product.id, { id: product.id, costPriceNaira: next });
                    }}
                  />
                </TableCell>
                <TableCell>
                  <select
                    aria-label={`Stock for ${product.name}`}
                    className="h-10 border border-line bg-paper px-2 text-sm"
                    value={product.stockStatus}
                    onChange={(event) => {
                      const stockStatus = event.target.value as StockStatus;
                      void saveInline(product.id, { id: product.id, stockStatus });
                    }}
                  >
                    {STOCK_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STOCK_LABELS[status]}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2">
                    <Badge tone={tone[product.stockStatus]}>{STOCK_LABELS[product.stockStatus]}</Badge>
                    <p className="mt-1 text-xs text-muted">{product.stockQty} on hand</p>
                  </div>
                </TableCell>
                <TableCell>
                  <input
                    type="checkbox"
                    aria-label={`Feature ${product.name}`}
                    checked={product.featured}
                    onChange={(event) => {
                      void saveInline(product.id, { id: product.id, featured: event.target.checked });
                    }}
                  />
                </TableCell>
                <TableCell className="space-x-3 text-right">
                  <button
                    type="button"
                    className="text-xs uppercase tracking-[0.14em]"
                    onClick={() => {
                      setEditing(product);
                      setOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-xs uppercase tracking-[0.14em] text-danger"
                    onClick={async () => {
                      if (!window.confirm(`Remove ${product.name}?`)) return;
                      const result = await deleteProduct(product.id);
                      if (!result.ok) toast.error(result.error);
                      else toast.success("Perfume removed");
                    }}
                  >
                    Delete
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <ProductFormDialog open={open} onOpenChange={setOpen} product={editing} />
    </div>
  );
}
