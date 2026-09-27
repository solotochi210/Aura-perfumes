import { AnnouncementMarquee } from "@/components/storefront/announcement-marquee";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SiteHeader } from "@/components/storefront/site-header";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { VisitBeacon } from "@/components/storefront/visit-beacon";
import { isConfiguredAdmin } from "@/lib/admin-identity";
import { auth } from "@/lib/auth";
import { getPublicSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [settings, session] = await Promise.all([getPublicSettings(), auth()]);
  const isAdmin = isConfiguredAdmin(session?.user?.email);

  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <VisitBeacon />
      <div className="sticky top-0 z-40">
        <AnnouncementMarquee />
        <SiteHeader businessName={settings.businessName} isAdmin={isAdmin} />
      </div>
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} isAdmin={isAdmin} />
      <CartDrawer />
    </div>
  );
}
