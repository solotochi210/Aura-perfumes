import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/catalog";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ProductOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let name = "Ojoma";
  let detail = "Perfume";
  try {
    const product = await getProductBySlug(slug);
    if (product) {
      name = product.name;
      detail = `${product.sizeMl}ml · ${product.category}`;
    }
  } catch {
    name = "Ojoma";
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "#1c1612",
          color: "#f6f1ea",
          padding: "72px",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 8, color: "#a68456" }}>OJOMA</div>
        <div style={{ marginTop: 20, fontSize: 80, lineHeight: 0.95 }}>{name}</div>
        <div style={{ marginTop: 16, fontSize: 28 }}>{detail}</div>
      </div>
    ),
    { ...size },
  );
}
