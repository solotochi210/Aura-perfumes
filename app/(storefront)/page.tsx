import Image from "next/image";
import Link from "next/link";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { BrandBar } from "@/components/storefront/brand-bar";
import { ProductCard } from "@/components/storefront/product-card";
import { listFeaturedProducts } from "@/lib/catalog";
import { getPublicSettings } from "@/lib/settings";
import { telHref, whatsappHref } from "@/lib/whatsapp";

const shell = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";
const heroImage =
  "https://dodptt9f4zk9h.cloudfront.net/stores/294798/media/2999f189b913447a47915d53100ff75564fa0a2d.jpeg";

export default async function HomePage() {
  const [featured, settings] = await Promise.all([listFeaturedProducts(), getPublicSettings()]);
  const whatsapp = settings.whatsappNumber
    ? whatsappHref(settings.whatsappNumber, `Hello ${settings.businessName}, I would like to order.`)
    : null;
  const phone = settings.businessPhone ? telHref(settings.businessPhone) : null;

  return (
    <>
      <section>
        <Image
          src={heroImage}
          alt={`${settings.businessName} welcome`}
          width={1640}
          height={430}
          priority
          unoptimized
          sizes="100vw"
          className="h-auto w-full"
        />
        <div className={`${shell} py-8 sm:py-12 lg:py-16`}>
          <p className="text-xs uppercase tracking-[0.28em] text-brass-deep">Benin City</p>
          <h1 className="mt-4 font-serif text-5xl leading-[0.95] sm:text-7xl lg:text-8xl">Welcome to Aurane</h1>
          <p className="mt-6 max-w-md font-serif text-2xl leading-snug text-ink sm:text-3xl">
            {settings.tagline}
          </p>
          <p className="mt-4 max-w-md text-sm leading-7 text-ink-soft">
            Sales of perfumes and skin care products.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className="inline-flex h-12 items-center justify-center bg-ink px-6 text-sm text-cream">
              Shop the latest
            </Link>
            <Link
              href="#contact"
              className="inline-flex h-12 items-center justify-center border border-ink/20 px-6 text-sm"
            >
              Contact Aurane
            </Link>
          </div>
        </div>
      </section>

      <section className={`${shell} pb-16 sm:pb-20`}>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-4xl sm:text-5xl">Latest products</h2>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">Top trending products this week</p>
          </div>
          <Link href="/shop" className="inline-flex h-11 shrink-0 items-center text-xs uppercase tracking-[0.18em] text-brass-deep">
            View all
          </Link>
        </div>
        <div className="mb-8">
          <BrandBar />
        </div>
        {featured.length === 0 ? (
          <p className="border border-dashed border-line px-6 py-16 text-center text-sm text-muted">
            New bottles will appear here.
          </p>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                whatsappNumber={settings.whatsappNumber}
                priority={index < 2}
              />
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-line bg-paper">
        <div className={`${shell} grid gap-6 py-12 sm:py-16 md:grid-cols-2`}>
          <div className="flex gap-4 border border-line bg-cream p-6">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-brass-deep" />
            <div>
              <h2 className="font-serif text-2xl">Original bottles</h2>
              <p className="mt-2 text-sm leading-6 text-ink-soft">
                Scan the barcode on your perfume to confirm it is authentic.
              </p>
            </div>
          </div>
          <div className="flex gap-4 border border-line bg-cream p-6">
            <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-brass-deep" />
            <div>
              <h2 className="font-serif text-2xl">Order on WhatsApp</h2>
              <p className="mt-2 text-sm leading-6 text-ink-soft">
                Most orders start from a phone. Message Aurane and we will reply in the chat.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className={`${shell} grid gap-10 py-16 sm:py-20 lg:grid-cols-2`}>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-brass-deep">Contact</p>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl">Be the first to hear what arrives.</h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-ink-soft">
            Stay on top of fresh updates, discounts, and offers. Write to us on WhatsApp or email.
          </p>
        </div>
        <div className="space-y-3 text-sm leading-7">
          <p>{settings.businessAddress}</p>
          {phone ? (
            <p>
              <a className="inline-flex min-h-11 items-center underline-offset-4 hover:underline" href={phone}>
                {settings.businessPhone}
              </a>
            </p>
          ) : null}
          {settings.businessEmail ? (
            <p>
              <a
                className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                href={`mailto:${settings.businessEmail}`}
              >
                {settings.businessEmail}
              </a>
            </p>
          ) : null}
          {whatsapp ? (
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center bg-ink px-6 text-sm text-cream"
            >
              Message on WhatsApp
            </a>
          ) : null}
          <p className="text-ink-soft">
            <a className="underline-offset-4 hover:underline" href="https://www.instagram.com/aurane02" target="_blank" rel="noreferrer">
              Instagram @aurane02
            </a>
            <span className="px-2">·</span>
            <a className="underline-offset-4 hover:underline" href="https://www.tiktok.com/@aurane1" target="_blank" rel="noreferrer">
              TikTok @aurane1
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
