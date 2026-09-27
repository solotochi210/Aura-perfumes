"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CATEGORIES, STOCK_LABELS, STOCK_STATUSES, type StockStatus } from "@/lib/constants";
import { koboToNaira } from "@/lib/money";
import { productFormSchema, type ProductFormInput } from "@/lib/validations/product";
import { createProduct, updateProduct } from "@/app/admin/(panel)/products/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageDropzone } from "@/components/admin/image-dropzone";

export type EditableProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  costPrice: number;
  stockStatus: StockStatus;
  stockQty: number;
  color: string;
  texture: string;
  images: string[];
  category: string;
  sizeMl: number;
  featured: boolean;
  history?: string[];
};

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: EditableProduct | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <ProductForm
          key={product?.id ?? "new"}
          product={product}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function ProductForm({
  product,
  onDone,
}: {
  product: EditableProduct | null;
  onDone: () => void;
}) {
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const form = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      priceNaira: product ? koboToNaira(product.price) : 0,
      costPriceNaira: product ? koboToNaira(product.costPrice) : 0,
          stockStatus: product?.stockStatus ?? "IN_STOCK",
          stockQty: product?.stockQty ?? 10,
          color: product?.color ?? "",
          texture: product?.texture ?? "",
          images: product?.images ?? [],
      category: product?.category ?? CATEGORIES[0],
      sizeMl: product?.sizeMl ?? 50,
      featured: product?.featured ?? false,
    },
  });

  async function onSubmit(values: ProductFormInput) {
    const payload = { ...values, images };
    const result = product
      ? await updateProduct({ ...payload, id: product.id })
      : await createProduct(payload);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(product ? "Perfume updated" : "Perfume added");
    onDone();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{product ? "Edit perfume" : "Add perfume"}</DialogTitle>
      </DialogHeader>
      <Field label="Name" error={form.formState.errors.name?.message}>
        <Input {...form.register("name")} />
      </Field>
      <Field label="Description" error={form.formState.errors.description?.message}>
        <Textarea {...form.register("description")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Price (₦)" error={form.formState.errors.priceNaira?.message}>
          <Input type="number" step="1" {...form.register("priceNaira", { valueAsNumber: true })} />
        </Field>
        <Field label="Cost price (₦)" error={form.formState.errors.costPriceNaira?.message}>
          <Input type="number" step="1" {...form.register("costPriceNaira", { valueAsNumber: true })} />
        </Field>
        <Field label="Category" error={form.formState.errors.category?.message}>
          <Input list="categories" {...form.register("category")} />
          <datalist id="categories">
            {CATEGORIES.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </Field>
        <Field label="Size (ml)" error={form.formState.errors.sizeMl?.message}>
          <Input type="number" {...form.register("sizeMl", { valueAsNumber: true })} />
        </Field>
        <Field label="Colour" error={form.formState.errors.color?.message}>
          <Input {...form.register("color")} placeholder="Optional" />
        </Field>
        <Field label="Texture" error={form.formState.errors.texture?.message}>
          <Input {...form.register("texture")} placeholder="Optional, such as oil or spray" />
        </Field>
        <Field label="Stock on hand" error={form.formState.errors.stockQty?.message}>
          <Input type="number" {...form.register("stockQty", { valueAsNumber: true })} />
        </Field>
      </div>
      <Field label="Stock" error={form.formState.errors.stockStatus?.message}>
        <Select
          value={form.watch("stockStatus")}
          onValueChange={(value) =>
            form.setValue("stockStatus", value as ProductFormInput["stockStatus"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STOCK_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {STOCK_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register("featured")} />
        Feature on the homepage
      </label>
      <ImageDropzone images={images} onChange={setImages} productId={product?.id} />
      {form.formState.errors.images ? (
        <p className="text-xs text-danger">{form.formState.errors.images.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="h-12 w-full bg-ink text-sm text-cream disabled:opacity-50"
      >
        {form.formState.isSubmitting ? "Saving" : "Save perfume"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </label>
  );
}
