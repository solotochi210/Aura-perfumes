"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordVisit } from "@/app/(storefront)/actions";

export function VisitBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (sessionStorage.getItem("ojoma-visited")) return;
    sessionStorage.setItem("ojoma-visited", "1");
    void recordVisit(pathname);
  }, [pathname]);

  return null;
}
