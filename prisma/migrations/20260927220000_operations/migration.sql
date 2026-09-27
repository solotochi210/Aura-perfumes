-- Inventory, order channels, customers, gift cards, and campaigns.
-- Existing rows keep their data. New columns have defaults.

ALTER TABLE "Product" ADD COLUMN "color" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN "texture" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN "stockQty" INTEGER NOT NULL DEFAULT 10;

UPDATE "Product" SET "stockQty" = 0 WHERE "stockStatus" <> 'IN_STOCK';

CREATE TYPE "OrderChannel" AS ENUM ('WEBSITE', 'WHATSAPP', 'INSTAGRAM', 'STORE');

ALTER TABLE "Order" ADD COLUMN "channel" "OrderChannel" NOT NULL DEFAULT 'WEBSITE';

CREATE TABLE "ProductHistory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProductHistory_productId_createdAt_idx" ON "ProductHistory"("productId", "createdAt");

ALTER TABLE "ProductHistory" ADD CONSTRAINT "ProductHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

CREATE TABLE "GiftCard" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "balance" INTEGER NOT NULL,
    "initial" INTEGER NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GiftCard_code_key" ON "GiftCard"("code");

CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "recipientCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);
