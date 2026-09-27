import { db } from "@/lib/db";

export type TrendPoint = {
  label: string;
  revenue: number;
  profit: number;
};

export async function getDashboardMetrics() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWindow = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const paid = ["PAID", "FULFILLED"] as const;

  const [monthOrders, windowOrders, customerRows, visitorsThisMonth, paidThisMonth, recent] =
    await Promise.all([
      db.order.findMany({
        where: { status: { in: [...paid] }, createdAt: { gte: startOfMonth } },
        include: { items: { select: { quantity: true, unitPrice: true, unitCost: true } } },
      }),
      db.order.findMany({
        where: { status: { in: [...paid] }, createdAt: { gte: startOfWindow } },
        include: { items: { select: { quantity: true, unitPrice: true, unitCost: true } } },
      }),
      db.order.findMany({
        where: { status: { not: "CANCELLED" } },
        select: { customerPhone: true },
        distinct: ["customerPhone"],
      }),
      db.visit.count({ where: { createdAt: { gte: startOfMonth } } }),
      db.order.count({
        where: { status: { in: [...paid] }, createdAt: { gte: startOfMonth } },
      }),
      db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          publicRef: true,
          customerName: true,
          totalAmount: true,
          status: true,
          paymentMethod: true,
          createdAt: true,
        },
      }),
    ]);

  const orderCountMonth = await db.order.count({
    where: { createdAt: { gte: startOfMonth }, status: { not: "CANCELLED" } },
  });

  const revenueMonth = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const profitMonth = monthOrders.reduce(
    (sum, order) =>
      sum +
      order.items.reduce(
        (inner, item) => inner + (item.unitPrice - item.unitCost) * item.quantity,
        0,
      ),
    0,
  );

  const buckets = new Map<string, { revenue: number; profit: number; date: Date }>();
  for (let index = 0; index < 12; index += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    buckets.set(key, { revenue: 0, profit: 0, date });
  }

  for (const order of windowOrders) {
    const key = `${order.createdAt.getFullYear()}-${order.createdAt.getMonth()}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.revenue += order.totalAmount;
    bucket.profit += order.items.reduce(
      (inner, item) => inner + (item.unitPrice - item.unitCost) * item.quantity,
      0,
    );
  }

  const trend: TrendPoint[] = [...buckets.values()].map((bucket) => ({
    label: new Intl.DateTimeFormat("en-NG", { month: "short" }).format(bucket.date),
    revenue: bucket.revenue,
    profit: bucket.profit,
  }));

  const conversionRate =
    visitorsThisMonth === 0 ? 0 : Math.round((paidThisMonth / visitorsThisMonth) * 1000) / 10;

  return {
    revenueMonth,
    profitMonth,
    orderCountMonth,
    uniqueCustomers: customerRows.length,
    visitorsThisMonth,
    conversionRate,
    trend,
    recent,
  };
}

export async function listCustomers() {
  const orders = await db.order.findMany({
    where: { status: { not: "CANCELLED" } },
    select: {
      customerName: true,
      customerPhone: true,
      customerEmail: true,
      totalAmount: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const grouped = new Map<
    string,
    {
      name: string;
      phone: string;
      email: string;
      orderCount: number;
      totalSpent: number;
      lastOrderAt: Date;
    }
  >();

  for (const order of orders) {
    const key = order.customerPhone.replace(/\D/g, "") || order.customerEmail;
    const current = grouped.get(key);
    const spent = order.status === "PAID" || order.status === "FULFILLED" ? order.totalAmount : 0;
    if (!current) {
      grouped.set(key, {
        name: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail,
        orderCount: 1,
        totalSpent: spent,
        lastOrderAt: order.createdAt,
      });
      continue;
    }
    current.orderCount += 1;
    current.totalSpent += spent;
    if (order.createdAt > current.lastOrderAt) {
      current.lastOrderAt = order.createdAt;
      current.name = order.customerName;
      current.email = order.customerEmail;
    }
  }

  return [...grouped.values()].sort((a, b) => b.totalSpent - a.totalSpent);
}
