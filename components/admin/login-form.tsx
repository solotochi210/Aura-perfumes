"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginAction } from "@/app/admin/login/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    const result = await loginAction(values);
    if (result && !result.ok) toast.error(result.error);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-sm space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-brass-deep">Atelier</p>
        <h1 className="mt-3 font-serif text-5xl">Ojoma</h1>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" className="mt-2" autoComplete="username" {...form.register("email")} />
        {form.formState.errors.email ? (
          <p className="mt-1 text-xs text-danger">{form.formState.errors.email.message}</p>
        ) : null}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          className="mt-2"
          autoComplete="current-password"
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p className="mt-1 text-xs text-danger">{form.formState.errors.password.message}</p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="h-12 w-full bg-ink text-sm text-cream disabled:opacity-50"
      >
        {form.formState.isSubmitting ? "Entering" : "Enter"}
      </button>
    </form>
  );
}
