import { Resend } from "resend";
import { formatNaira } from "@/lib/money";
import { getSiteUrl } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/constants";

export type MailOrder = {
  id: string;
  publicRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  items: { name: string; sizeMl: number; quantity: number; unitPrice: number }[];
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function itemRows(order: MailOrder) {
  return order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e4d9cb;">${escapeHtml(item.name)} · ${item.sizeMl}ml × ${item.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #e4d9cb;text-align:right;">${escapeHtml(formatNaira(item.unitPrice * item.quantity))}</td></tr>`,
    )
    .join("");
}

function shell(title: string, body: string) {
  return `<div style="background:#f6f1ea;padding:32px;font-family:Georgia,serif;color:#1c1612;"><div style="max-width:560px;margin:0 auto;background:#fbf8f4;padding:32px;"><p style="letter-spacing:0.28em;text-transform:uppercase;font-size:11px;font-family:Arial,sans-serif;">Aurane</p><h1 style="font-weight:500;font-size:32px;margin:8px 0 24px;">${escapeHtml(title)}</h1>${body}</div></div>`;
}

async function send(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from || !to) {
    console.warn("Email skipped: Resend is not configured or the recipient is missing.");
    return;
  }
  const resend = new Resend(apiKey);
  await resend.emails.send({ from, to, subject, html });
}

export async function sendOrderConfirmation(order: MailOrder, invoiceNumber?: string) {
  const url = `${getSiteUrl()}/order/${order.id}`;
  const html = shell(
    "Order confirmed",
    `<p style="font-family:Arial,sans-serif;line-height:1.6;">Thank you, ${escapeHtml(order.customerName)}. We have your order <strong>${escapeHtml(order.publicRef)}</strong>${invoiceNumber ? `. Invoice <strong>${escapeHtml(invoiceNumber)}</strong>` : ""}.</p><table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">${itemRows(order)}<tr><td style="padding-top:16px;"><strong>Total</strong></td><td style="padding-top:16px;text-align:right;"><strong>${escapeHtml(formatNaira(order.totalAmount))}</strong></td></tr></table><p style="font-family:Arial,sans-serif;"><a href="${url}" style="color:#8a6a3d;">View your invoice</a></p>`,
  );
  await send(order.customerEmail, `Order ${order.publicRef} · Aurane`, html);
}

export async function sendPaidReceipt(order: MailOrder, receiptNumber?: string) {
  const url = `${getSiteUrl()}/order/${order.id}`;
  const html = shell(
    "Your receipt",
    `<p style="font-family:Arial,sans-serif;line-height:1.6;">Thank you, ${escapeHtml(order.customerName)}. Order <strong>${escapeHtml(order.publicRef)}</strong> is paid${receiptNumber ? `. Receipt <strong>${escapeHtml(receiptNumber)}</strong>` : ""}.</p><table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">${itemRows(order)}<tr><td style="padding-top:16px;"><strong>Total</strong></td><td style="padding-top:16px;text-align:right;"><strong>${escapeHtml(formatNaira(order.totalAmount))}</strong></td></tr></table><p style="font-family:Arial,sans-serif;"><a href="${url}" style="color:#8a6a3d;">View your receipt</a></p>`,
  );
  await send(order.customerEmail, `Receipt ${order.publicRef} · Aurane`, html);
}

export async function notifyAdminOfOrder(order: MailOrder, note: string) {
  const to = process.env.ADMIN_EMAIL;
  if (!to) return;
  const html = shell(
    note,
    `<p style="font-family:Arial,sans-serif;line-height:1.6;">${escapeHtml(order.customerName)} · ${escapeHtml(order.customerPhone)} · ${escapeHtml(order.customerEmail)}</p><p style="font-family:Arial,sans-serif;">${escapeHtml(order.publicRef)} · ${escapeHtml(formatNaira(order.totalAmount))} · ${escapeHtml(order.paymentMethod)}</p><table style="width:100%;font-family:Arial,sans-serif;font-size:14px;">${itemRows(order)}</table>`,
  );
  await send(to, `${note}: ${order.publicRef}`, html);
}

export async function sendMarketingEmail(to: string, subject: string, message: string) {
  const html = shell(
    subject,
    `<p style="font-family:Arial,sans-serif;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</p>`,
  );
  await send(to, subject, html);
}

export async function sendOrderMailSafely(task: () => Promise<void>) {
  try {
    await task();
  } catch (error) {
    console.error("Email failed", error);
  }
}
