import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { getBusinessReport, getDashboardMetrics } from "@/lib/analytics";
import { STARTER_HOUSE } from "@/lib/constants";
import { getPublicSettings } from "@/lib/settings";
import { ORDER_STATUS_LABELS, PAYMENT_LABELS, type OrderStatus } from "@/lib/constants";
import { formatDate, formatNaira } from "@/lib/money";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const periodParam = Array.isArray(params.period) ? params.period[0] : params.period;
  const period = periodParam === "day" || periodParam === "week" ? periodParam : "month";
  const [metrics, settings, report] = await Promise.all([
    getDashboardMetrics(),
    getPublicSettings(),
    getBusinessReport(period),
  ]);
  const usingStarterHouse =
    settings.whatsappNumber === STARTER_HOUSE.whatsappNumber ||
    settings.accountNumber === STARTER_HOUSE.accountNumber;

  const cards = [
    { label: "Revenue this month", value: formatNaira(metrics.revenueMonth) },
    { label: "Profit this month", value: formatNaira(metrics.profitMonth) },
    { label: "Orders this month", value: String(metrics.orderCountMonth) },
    { label: "Unique customers", value: String(metrics.uniqueCustomers) },
    {
      label: "Conversion this month",
      value: `${metrics.conversionRate}%`,
      hint: `${metrics.visitorsThisMonth} visits · paid orders ÷ visits`,
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-brass-deep">Overview</p>
        <h1 className="font-serif text-4xl">The atelier</h1>
      </header>
      {usingStarterHouse ? (
        <p className="border border-brass/40 bg-paper px-5 py-4 text-sm leading-6">
          WhatsApp, bank transfer, invoices, and receipts are using starter house details.{" "}
          <Link href="/admin/settings" className="underline underline-offset-4">
            Replace them in Settings
          </Link>{" "}
          with your real number and account before you take orders.
        </p>
      ) : null}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label} className="p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{card.label}</p>
            <p className="mt-3 font-serif text-3xl">{card.value}</p>
            {card.hint ? <p className="mt-2 text-xs text-muted">{card.hint}</p> : null}
          </Card>
        ))}
      </section>
      <section>
        <h2 className="mb-4 font-serif text-2xl">Revenue and profit</h2>
        <RevenueChart data={metrics.trend} />
      </section>
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif text-2xl">Business report</h2>
          <div className="flex gap-2 text-xs uppercase tracking-[0.14em]">
            {(
              [
                ["day", "Daily"],
                ["week", "Weekly"],
                ["month", "Monthly"],
              ] as const
            ).map(([value, label]) => (
              <Link
                key={value}
                href={value === "month" ? "/admin" : `/admin?period=${value}`}
                className={period === value ? "bg-ink px-3 py-2 text-cream" : "border border-line px-3 py-2"}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Sales</p>
            <p className="mt-3 font-serif text-3xl">{formatNaira(report.revenue)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Expenses</p>
            <p className="mt-3 font-serif text-3xl">{formatNaira(report.expenses)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Profit</p>
            <p className="mt-3 font-serif text-3xl">{formatNaira(report.profit)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Paid orders</p>
            <p className="mt-3 font-serif text-3xl">{report.orders}</p>
          </Card>
        </div>
        <div className="mt-4">
          <h3 className="mb-3 font-serif text-xl">Best sellers</h3>
          {report.bestSellers.length === 0 ? (
            <p className="text-sm text-muted">No paid sales in this period.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {report.bestSellers.map((item) => (
                <li key={item.name} className="flex items-center justify-between border-b border-line py-2">
                  <span>{item.name}</span>
                  <span className="text-muted">
                    {item.quantity} sold · {formatNaira(item.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl">Recent orders</h2>
          <Link href="/admin/orders" className="text-xs uppercase tracking-[0.16em] text-brass-deep">
            All orders
          </Link>
        </div>
        {metrics.recent.length === 0 ? (
          <p className="border border-dashed border-line px-6 py-12 text-center text-sm text-muted">
            Orders will gather here.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.recent.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link href={`/admin/orders/${order.id}`} className="underline-offset-4 hover:underline">
                      {order.publicRef}
                    </Link>
                  </TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{formatNaira(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge>{ORDER_STATUS_LABELS[order.status as OrderStatus]}</Badge>
                    <span className="ml-2 text-xs text-muted">{PAYMENT_LABELS[order.paymentMethod]}</span>
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
