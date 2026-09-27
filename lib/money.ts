const MAX_KOBO = 2_000_000_000;

export function nairaToKobo(naira: number) {
  const kobo = Math.round(naira * 100);
  if (!Number.isSafeInteger(kobo) || kobo < 0 || kobo > MAX_KOBO) {
    throw new Error("That amount cannot be stored.");
  }
  return kobo;
}

export function koboToNaira(kobo: number) {
  return kobo / 100;
}

export function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
