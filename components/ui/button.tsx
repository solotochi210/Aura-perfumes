import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm tracking-wide transition duration-300 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass",
  {
    variants: {
      variant: {
        default: "bg-ink text-cream hover:bg-ink-soft",
        brass: "bg-brass text-ink hover:bg-brass-deep hover:text-cream",
        outline: "border border-ink/20 bg-transparent text-ink hover:border-ink",
        ghost: "text-ink hover:bg-cream-deep",
        danger: "border border-danger/30 text-danger hover:bg-danger hover:text-cream",
      },
      size: {
        default: "h-12 px-6",
        sm: "h-10 px-4 text-xs uppercase tracking-[0.16em]",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
