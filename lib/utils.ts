import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSiteUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return url.replace(/\/$/, "");
}
