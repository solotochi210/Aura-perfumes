import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-12 w-full border border-line bg-paper px-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brass",
        className,
      )}
      {...props}
    />
  );
}
