# Ojoma

A perfume storefront and a single-owner atelier dashboard. Customers browse and check out as guests. The owner manages stock, orders, invoices, and house details without a developer.

## What you get

- Public shop: homepage, search and filters, product pages, cart, and checkout
- Payments: Paystack, bank transfer, and WhatsApp
- Email receipts through Resend after a payment is confirmed
- Admin atelier at `/admin`: overview, perfumes, orders, customers, settings
- Invoice and receipt PDFs, SEO metadata, and a sitemap

There is no customer account system.

## Requirements

- Node.js 20 or newer
- A Neon Postgres database (or any Postgres database)
- Accounts for Paystack, Cloudinary, and Resend when you are ready to take payment, upload photos, and send email

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and fill it in:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Create the database tables:

```bash
npx prisma migrate dev
```

4. Create the owner login and, if the catalogue is empty, a few sample perfumes:

```bash
npx prisma db seed
```

`ADMIN_EMAIL` and `ADMIN_PASSWORD` come from `.env`. The password is hashed before it is stored. Running the seed again resets that admin password to the current environment value and does not overwrite perfumes or settings you have already saved.

5. Start the shop:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The atelier is at [http://localhost:3000/admin/login](http://localhost:3000/admin/login). The shop does not link to it.

## Environment variables

| Name | Where it is used |
| --- | --- |
| `DATABASE_URL` | Pooled Neon connection for the running app |
| `DIRECT_URL` | Direct Neon connection for migrations. Use the same URL as `DATABASE_URL` if you are not on Neon |
| `AUTH_SECRET` | Signs the admin session. Generate one with `npx auth secret` |
| `AUTH_TRUST_HOST` | Set to `true` on Vercel |
| `AUTH_URL` | Public site origin, for example `https://your-domain.com` |
| `ADMIN_EMAIL` | Owner email, read only by the seed script |
| `ADMIN_PASSWORD` | Owner password, read only by the seed script |
| `PAYSTACK_SECRET_KEY` | Starts payments and verifies the webhook signature |
| `CLOUDINARY_CLOUD_NAME` | Image host |
| `CLOUDINARY_UPLOAD_PRESET` | Unsigned preset. Uploads are accepted only from a signed-in admin |
| `RESEND_API_KEY` | Sends receipts and owner notices |
| `EMAIL_FROM` | From address, verified in Resend |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for links, callbacks, and SEO |

Money is stored in kobo (integer). Prices are shown in naira only when a page is rendered.

## Paystack

In the Paystack dashboard, set the webhook URL to:

```text
https://YOUR_DOMAIN/api/webhooks/paystack
```

The handler rejects any body whose `x-paystack-signature` does not match. A successful charge marks the order paid and emails a receipt.

## Cloudinary

Create an unsigned upload preset in Cloudinary. Put the cloud name and preset name in the environment. The upload route at `/api/upload` checks the admin session before it accepts a file. Do not put the Cloudinary API secret in client code.

## Deploy on Vercel

1. Push this project to GitHub and import it in Vercel.
2. Add every variable from `.env.example` in the Vercel project settings. Set `NEXT_PUBLIC_SITE_URL` and `AUTH_URL` to the production domain, and `AUTH_TRUST_HOST` to `true`.
3. Set the build command to:

```bash
prisma migrate deploy && prisma generate && next build
```

4. Deploy, then seed the owner once from your machine against the production database:

```bash
npx prisma db seed
```

Use the production `DATABASE_URL`, `DIRECT_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in that shell. Do not commit them.

5. Add the Paystack webhook URL, the Cloudinary preset, and a verified Resend sender.

## Day to day

- Add a perfume from **Perfumes**. Photos upload from the form. Price and cost are entered in naira.
- Change price, cost, stock, or the featured flag directly in the table. Marking a bottle **Sold** or **Out of stock** updates the shop immediately. Deleting a perfume that already appears on an order is blocked; mark it sold instead.
- Open an order to mark a transfer as paid, mark a paid order fulfilled, download an invoice or receipt, or message the customer on WhatsApp.
- Bank details, the WhatsApp number, and the name printed on invoices live under **Settings**.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local shop |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npx prisma migrate dev` | Create a migration locally |
| `npx prisma db seed` | Create the admin user |
| `npx prisma studio` | Browse the database |
