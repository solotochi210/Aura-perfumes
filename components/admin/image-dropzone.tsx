"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateProductImages } from "@/app/admin/(panel)/products/actions";

export function ImageDropzone({
  images,
  onChange,
  productId,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  productId?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [link, setLink] = useState("");

  async function commit(next: string[], previous: string[], message: string) {
    onChange(next);
    if (!productId) {
      toast.success(message);
      return;
    }
    const result = await updateProductImages({ id: productId, images: next });
    if (!result.ok) {
      onChange(previous);
      toast.error(result.error);
      return;
    }
    toast.success(message);
  }

  async function uploadFile(file: File) {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body });
    const data = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !data.url) {
      toast.error(data.error ?? "The image could not be uploaded.");
      return null;
    }
    return data.url;
  }

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const next = [...images];
      for (const file of Array.from(files).slice(0, 8 - next.length)) {
        const url = await uploadFile(file);
        if (url) next.push(url);
      }
      if (next.length !== images.length) {
        await commit(next, images, "Picture added");
      }
    } finally {
      setUploading(false);
    }
  }

  async function replace(current: string, files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      if (!url) return;
      await commit(
        images.map((image) => (image === current ? url : image)),
        images,
        "Picture updated",
      );
    } finally {
      setUploading(false);
    }
  }

  async function addLink() {
    const url = link.trim();
    if (!url.startsWith("https://")) {
      toast.error("Use an https image link.");
      return;
    }
    if (images.length >= 8) {
      toast.error("A perfume can have up to 8 pictures.");
      return;
    }
    setLink("");
    await commit([...images, url], images, "Picture added");
  }

  return (
    <div>
      <p className="text-sm">Pictures</p>
      <p className="mt-1 text-xs text-muted">
        {productId
          ? "Replace or delete a photo here. The shop updates as soon as it saves."
          : "Add pictures, then save the perfume."}
      </p>
      <label
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void addFiles(event.dataTransfer.files);
        }}
        className="mt-3 flex min-h-28 cursor-pointer flex-col items-center justify-center border border-dashed border-brass/60 bg-cream px-4 py-6 text-center text-sm text-ink-soft"
      >
        <span>{uploading ? "Uploading…" : "Drop a new picture here, or click to choose"}</span>
        <span className="mt-1 text-xs text-muted">JPG, PNG, or WebP · up to 5MB</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          disabled={uploading}
          onChange={(event) => {
            void addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </label>
      <div className="mt-3 flex gap-2">
        <input
          value={link}
          onChange={(event) => setLink(event.target.value)}
          placeholder="Or paste an https image link"
          className="h-11 min-w-0 flex-1 border border-line bg-cream px-3 text-sm outline-none focus:border-brass"
        />
        <button
          type="button"
          onClick={() => void addLink()}
          className="h-11 shrink-0 border border-ink px-3 text-xs uppercase tracking-[0.14em]"
        >
          Add link
        </button>
      </div>
      {images.length > 0 ? (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((url) => (
            <li key={url} className="border border-line bg-paper p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="aspect-square w-full object-cover" />
              <div className="mt-2 grid grid-cols-2 gap-1">
                <label className="inline-flex h-9 cursor-pointer items-center justify-center border border-line text-[11px] uppercase tracking-[0.12em]">
                  Replace
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={uploading}
                    onChange={(event) => {
                      void replace(url, event.target.files);
                      event.target.value = "";
                    }}
                  />
                </label>
                <button
                  type="button"
                  className="h-9 text-[11px] uppercase tracking-[0.12em] text-danger"
                  onClick={() => void commit(images.filter((image) => image !== url), images, "Picture deleted")}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-muted">No pictures yet.</p>
      )}
    </div>
  );
}
