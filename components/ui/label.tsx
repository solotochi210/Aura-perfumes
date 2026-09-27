import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("text-xs uppercase tracking-[0.18em] text-muted", className)}
      {...props}
    />
  );
}
