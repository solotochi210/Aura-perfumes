"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";

export function OrderFilters() {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const query = next.toString();
    router.replace(query ? `/admin/orders?${query}` : "/admin/orders");
  }

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      <label>
        <span className="text-[11px] uppercase tracking-[0.16em] text-muted">Status</span>
        <select
          className="mt-2 h-11 w-full border border-line bg-paper px-3 text-sm"
          value={params.get("status") ?? ""}
          onChange={(event) => update("status", event.target.value)}
        >
          <option value="">All</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="text-[11px] uppercase tracking-[0.16em] text-muted">From</span>
        <input
          type="date"
          className="mt-2 h-11 w-full border border-line bg-paper px-3 text-sm"
          value={params.get("from") ?? ""}
          onChange={(event) => update("from", event.target.value)}
        />
      </label>
      <label>
        <span className="text-[11px] uppercase tracking-[0.16em] text-muted">To</span>
        <input
          type="date"
          className="mt-2 h-11 w-full border border-line bg-paper px-3 text-sm"
          value={params.get("to") ?? ""}
          onChange={(event) => update("to", event.target.value)}
        />
      </label>
    </div>
  );
}
