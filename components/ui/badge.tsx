import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-2 py-1 text-[10px] uppercase tracking-[0.16em]",
  {
    variants: {
      tone: {
        default: "bg-cream-deep text-ink-soft",
        brass: "bg-brass/15 text-brass-deep",
        success: "bg-success/10 text-success",
        warning: "bg-brass/15 text-brass-deep",
        danger: "bg-danger/10 text-danger",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
