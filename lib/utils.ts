import { clsx, type ClassValue } from "clsx";
import { format, formatDistanceToNowStrict } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyFromPaise(value = 0) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function formatCompactCurrency(value = 0) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function formatDate(value?: Date | string | null, pattern = "dd MMM yyyy") {
  if (!value) {
    return "—";
  }

  return format(new Date(value), pattern);
}

export function formatDateTime(value?: Date | string | null) {
  if (!value) {
    return "—";
  }

  return format(new Date(value), "dd MMM yyyy, hh:mm a");
}

export function formatRelativeTime(value?: Date | string | null) {
  if (!value) {
    return "—";
  }

  return formatDistanceToNowStrict(new Date(value), { addSuffix: true });
}

export function toTitleCase(input: string) {
  return input
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function buildPagination(page = 1, pageSize = 10) {
  const normalizedPage = Number.isNaN(page) ? 1 : Math.max(1, page);
  const normalizedPageSize = Number.isNaN(pageSize) ? 10 : Math.max(1, Math.min(100, pageSize));

  return {
    page: normalizedPage,
    pageSize: normalizedPageSize,
    skip: (normalizedPage - 1) * normalizedPageSize,
    take: normalizedPageSize,
  };
}

export function maybeNumber(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}
