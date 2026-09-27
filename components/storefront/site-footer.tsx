import Link from "next/link";
import type { PublicSettings } from "@/lib/settings";
import { telHref, whatsappHref } from "@/lib/whatsapp";

export function SiteFooter({
  settings,
  isAdmin = false,
}: {
  settings: PublicSettings;
  isAdmin?: boolean;
}) {
  const whatsapp = settings.whatsappNumber
    ? whatsappHref(settings.whatsappNumber, `Hello ${settings.businessName}, I have a question.`)
    : null;
  const phone = settings.businessPhone ? telHref(settings.businessPhone) : null;

  return (
    <footer className="border-t border-line bg-ink text-cream">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-serif text-4xl">{settings.businessName}</p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-cream/70">{settings.tagline}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-brass">Visit</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/shop" className="hover:text-brass">
                The collection
              </Link>
            </li>
            <li>
              <Link href="/#contact" className="inline-flex min-h-11 items-center hover:text-brass">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-brass">
                {isAdmin ? "Dashboard" : "Login"}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-brass">Atelier</p>
          <ul className="mt-4 space-y-2 text-sm text-cream/80">
            {settings.businessAddress ? <li>{settings.businessAddress}</li> : null}
            {settings.businessEmail ? (
              <li>
                <a href={`mailto:${settings.businessEmail}`} className="hover:text-cream">
                  {settings.businessEmail}
                </a>
              </li>
            ) : null}
            {phone ? (
              <li>
                <a href={phone} className="hover:text-cream">
                  {settings.businessPhone}
                </a>
              </li>
            ) : null}
            {whatsapp ? (
              <li>
                <a href={whatsapp} className="hover:text-cream">
                  WhatsApp
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-[11px] uppercase tracking-[0.18em] text-cream/50">
        {settings.businessName} · Benin City
      </div>
    </footer>
  );
}
