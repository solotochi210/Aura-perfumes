import { listCustomers } from "@/lib/analytics";
import { formatDate, formatNaira } from "@/lib/money";
import { getPublicSettings } from "@/lib/settings";
import { telHref, whatsappHref } from "@/lib/whatsapp";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function CustomersPage() {
  const [customers, settings] = await Promise.all([listCustomers(), getPublicSettings()]);

  return (
    <div>
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.22em] text-brass-deep">People</p>
        <h1 className="font-serif text-4xl">Customers</h1>
        <p className="mt-2 text-sm text-muted">Built from orders. There are no customer accounts.</p>
      </header>
      {customers.length === 0 ? (
        <p className="border border-dashed border-line px-6 py-16 text-center text-sm text-muted">
          Customers appear after the first order.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Spent</TableHead>
              <TableHead>Last order</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => {
              const whatsapp = whatsappHref(
                customer.phone,
                `Hello ${customer.name}, this is ${settings.businessName}.`,
              );
              const call = telHref(customer.phone);
              return (
                <TableRow key={customer.phone}>
                  <TableCell>
                    <p>{customer.name}</p>
                    <p className="text-xs text-muted">{customer.phone}</p>
                    <p className="text-xs text-muted">{customer.email}</p>
                  </TableCell>
                  <TableCell>{customer.orderCount}</TableCell>
                  <TableCell>{formatNaira(customer.totalSpent)}</TableCell>
                  <TableCell>{formatDate(customer.lastOrderAt)}</TableCell>
                  <TableCell className="space-x-3 text-right text-xs uppercase tracking-[0.14em]">
                    {whatsapp ? (
                      <a href={whatsapp} target="_blank" rel="noreferrer">
                        WhatsApp
                      </a>
                    ) : null}
                    {call ? <a href={call}>Call</a> : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
