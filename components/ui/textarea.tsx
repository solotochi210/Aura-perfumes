import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full border border-line bg-paper px-3 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brass",
        className,
      )}
      {...props}
    />
  );
}
