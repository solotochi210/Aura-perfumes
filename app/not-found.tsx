import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-start justify-center bg-cream px-6 text-ink">
      <p className="text-xs uppercase tracking-[0.28em] text-brass-deep">Aurane</p>
      <h1 className="mt-3 font-serif text-5xl">This page is not in the house.</h1>
      <Link href="/shop" className="mt-8 inline-flex h-12 items-center bg-ink px-6 text-sm text-cream">
        Browse the collection
      </Link>
    </div>
  );
}
