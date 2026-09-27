import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { OrderFilters } from "@/components/admin/order-filters";
import { ORDER_STATUS_LABELS, PAYMENT_LABELS, type OrderStatus, type PaymentMethod } from "@/lib/constants";
import { formatDate, formatNaira } from "@/lib/money";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function clean(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() || undefined;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = clean(params.status);
  const from = clean(params.from);
  const to = clean(params.to);
  const allowed = ["PENDING", "PAID", "FULFILLED", "CANCELLED"] as const;
  const statusFilter = allowed.find((item) => item === status);

  const createdAt: { gte?: Date; lte?: Date } = {};
  if (from) createdAt.gte = new Date(`${from}T00:00:00`);
  if (to) createdAt.lte = new Date(`${to}T23:59:59`);

  const orders = await db.order.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(from || to ? { createdAt } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.22em] text-brass-deep">Sales</p>
        <h1 className="font-serif text-4xl">Orders</h1>
      </header>
      <Suspense fallback={null}>
        <OrderFilters />
      </Suspense>
      {orders.length === 0 ? (
        <p className="border border-dashed border-line px-6 py-16 text-center text-sm text-muted">
          No orders in this view.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ref</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link href={`/admin/orders/${order.id}`} className="underline-offset-4 hover:underline">
                    {order.publicRef}
                  </Link>
                </TableCell>
                <TableCell>
                  <p>{order.customerName}</p>
                  <p className="text-xs text-muted">{order.customerPhone}</p>
                </TableCell>
                <TableCell>{formatNaira(order.totalAmount)}</TableCell>
                <TableCell>{PAYMENT_LABELS[order.paymentMethod as PaymentMethod]}</TableCell>
                <TableCell>
                  <Badge>{ORDER_STATUS_LABELS[order.status as OrderStatus]}</Badge>
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
