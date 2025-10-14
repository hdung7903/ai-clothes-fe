/**
 * Formats a date to a readable string format
 * @param date - Date object or date string
 * @param format - Format type: 'short', 'long', 'iso', 'custom'
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  format: "short" | "long" | "iso" | "custom" | "ddmmyyyy" = "short"
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    throw new Error("Invalid date");
  }

  switch (format) {
    case "short":
      // MM/DD/YYYY
      return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(
        d.getDate()
      ).padStart(2, "0")}/${d.getFullYear()}`;

    case "long":
      // January 1, 2025
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

    case "iso":
      // 2025-01-01
      return d.toISOString().split("T")[0];

    case "ddmmyyyy":
      // DD/MM/YYYY
      return `${String(d.getDate()).padStart(2, "0")}/${String(
        d.getMonth() + 1
      ).padStart(2, "0")}/${d.getFullYear()}`;

    case "custom":
      // DD/MM/YYYY HH:MM
      return `${String(d.getDate()).padStart(2, "0")}/${String(
        d.getMonth() + 1
      ).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(
        2,
        "0"
      )}:${String(d.getMinutes()).padStart(2, "0")}`;

    default:
      return d.toLocaleDateString();
  }
}

/**
 * Capitalizes the first character of each word in a string
 * @param text - Input string
 * @returns String with first character of each word capitalized
 */
export function capitalizeEachWord(text: string): string {
  if (!text) return "";

  return text
    .split(" ")
    .map((word) => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/**
 * Capitalizes only the first character of the entire string
 * @param text - Input string
 * @returns String with only first character capitalized
 */
export function capitalizeFirst(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Formats number to currency
 * @param amount - Numeric value
 * @param currency - ISO currency code, e.g. 'USD', 'VND'
 * @param locale - Locale code, e.g. 'en-US'
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: currency === "VND" ? 0 : 2,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(amount);
}

/**
 * Formats number to Vietnamese Dong (VND) with proper formatting
 * @param amount - Numeric value
 * @returns Formatted VND string (e.g., "1.000.000 ₫")
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats ENUM-like strings to human readable text
 * @example formatEnumString("ONLINE_PAYMENT_AWAITING") => "Online Payment Awaiting"
 * @example formatEnumString("DELIVERY_FAILED", false) => "Delivery failed"
 * @param text - Enum-like string (e.g. "ONLINE_PAYMENT_AWAITING")
 * @param capitalizeAll - Whether to capitalize each word or only the first word
 */
export function formatEnumString(
  text: string,
  capitalizeAll: boolean = true
): string {
  if (!text) return "";

  const formatted = text
    .replace(/_/g, " ")
    .toLowerCase()
    .trim();

  return capitalizeAll ? capitalizeEachWord(formatted) : capitalizeFirst(formatted);
}
