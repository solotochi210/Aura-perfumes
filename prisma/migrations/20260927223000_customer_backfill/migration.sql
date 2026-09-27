-- Keep every past buyer on the customer list, with loyalty points from paid orders.

INSERT INTO "Customer" ("id", "name", "phone", "email", "points", "createdAt", "updatedAt")
SELECT
  md5(grouped.phone),
  grouped.name,
  grouped.phone,
  grouped.email,
  grouped.points,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (
  SELECT
    regexp_replace("customerPhone", '\D', '', 'g') AS phone,
    (ARRAY_AGG("customerName" ORDER BY "createdAt" DESC))[1] AS name,
    (ARRAY_AGG("customerEmail" ORDER BY "createdAt" DESC))[1] AS email,
    FLOOR(
      SUM(CASE WHEN "status" IN ('PAID', 'FULFILLED') THEN "totalAmount" ELSE 0 END) / 10000.0
    )::int AS points
  FROM "Order"
  GROUP BY regexp_replace("customerPhone", '\D', '', 'g')
  HAVING regexp_replace("customerPhone", '\D', '', 'g') <> ''
) AS grouped
ON CONFLICT ("phone") DO NOTHING;
