import { SettingsForm } from "@/components/admin/settings-form";
import { getPublicSettings } from "@/lib/settings";

export default async function SettingsPage() {
  const settings = await getPublicSettings();
  return (
    <div>
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.22em] text-brass-deep">House</p>
        <h1 className="font-serif text-4xl">Settings</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          These details appear on the shop, on bank-transfer checkout, on WhatsApp messages, and on
          invoices and receipts. Replace the starter number and account with yours.
        </p>
      </header>
      <SettingsForm settings={settings} />
    </div>
  );
}
