import Image from "next/image";

export function ProductMedia({
  src,
  alt,
  priority = false,
  sizes,
  zoom = false,
}: {
  src: string | null;
  alt: string;
  priority?: boolean;
  sizes: string;
  zoom?: boolean;
}) {
  if (!src) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,#f8f1e6,#e7dccb_72%)]">
        <span className="font-serif text-6xl leading-none text-ink/80">A</span>
        <span className="mt-4 text-[10px] uppercase tracking-[0.42em] text-brass-deep">Aurane</span>
      </div>
    );
  }

  const remote = src.startsWith("https://") || src.startsWith("http://");

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      unoptimized={remote}
      className={zoom ? "object-cover transition duration-700 ease-out group-hover:scale-[1.04]" : "object-cover"}
    />
  );
}
