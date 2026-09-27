import { NextResponse } from "next/server";
import { getVerifiedAdmin } from "@/lib/require-admin";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const session = await getVerifiedAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const preset = process.env.CLOUDINARY_UPLOAD_PRESET;
  if (!cloud || !preset) {
    return NextResponse.json(
      { error: "File upload is not set up yet. Paste an https image link instead." },
      { status: 500 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Use a JPG, PNG, or WebP image." }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Images must be under 5MB." }, { status: 400 });
  }

  const outgoing = new FormData();
  outgoing.append("file", file);
  outgoing.append("upload_preset", preset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: "POST",
    body: outgoing,
  });
  const payload = (await response.json()) as { secure_url?: string; error?: { message?: string } };
  if (!response.ok || !payload.secure_url?.startsWith("https://")) {
    return NextResponse.json(
      { error: payload.error?.message ?? "The image could not be uploaded." },
      { status: 502 },
    );
  }

  return NextResponse.json({ url: payload.secure_url });
}
