import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("border border-line bg-paper", className)} {...props} />;
}
