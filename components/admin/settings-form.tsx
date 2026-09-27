"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { settingsSchema, type SettingsInput } from "@/lib/validations/settings";
import { saveSettings } from "@/app/admin/(panel)/settings/actions";
import type { PublicSettings } from "@/lib/settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SettingsForm({ settings }: { settings: PublicSettings }) {
  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  });

  async function onSubmit(values: SettingsInput) {
    const result = await saveSettings(values);
    if (!result.ok) toast.error(result.error);
    else toast.success("Settings saved");
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-5">
      <Field label="Business name" error={form.formState.errors.businessName?.message}>
        <Input {...form.register("businessName")} />
      </Field>
      <Field label="Tagline" error={form.formState.errors.tagline?.message}>
        <Input {...form.register("tagline")} />
      </Field>
      <Field label="Email on invoices" error={form.formState.errors.businessEmail?.message}>
        <Input type="email" {...form.register("businessEmail")} />
      </Field>
      <Field label="Phone" error={form.formState.errors.businessPhone?.message}>
        <Input {...form.register("businessPhone")} />
      </Field>
      <Field label="Address" error={form.formState.errors.businessAddress?.message}>
        <Textarea {...form.register("businessAddress")} />
      </Field>
      <Field label="Bank name" error={form.formState.errors.bankName?.message}>
        <Input {...form.register("bankName")} />
      </Field>
      <Field label="Account name" error={form.formState.errors.accountName?.message}>
        <Input {...form.register("accountName")} />
      </Field>
      <Field label="Account number" error={form.formState.errors.accountNumber?.message}>
        <Input {...form.register("accountNumber")} />
      </Field>
      <Field label="WhatsApp number" error={form.formState.errors.whatsappNumber?.message}>
        <Input placeholder="0803 000 0000" {...form.register("whatsappNumber")} />
      </Field>
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="h-12 bg-ink px-6 text-sm text-cream disabled:opacity-50"
      >
        {form.formState.isSubmitting ? "Saving" : "Save settings"}
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
