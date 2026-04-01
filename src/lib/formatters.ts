import type { AppLocale } from "@/lib/i18n";

const currencyFormatters: Record<AppLocale, Intl.NumberFormat> = {
  ja: new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }),
  en: new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }),
};

const percentFormatters: Record<AppLocale, Intl.NumberFormat> = {
  ja: new Intl.NumberFormat("ja-JP", {
    style: "percent",
    maximumFractionDigits: 1,
  }),
  en: new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }),
};

const dateFormatters: Record<AppLocale, Intl.DateTimeFormat> = {
  ja: new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }),
  en: new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }),
};

export function formatCurrency(value: number, locale: AppLocale = "ja") {
  return currencyFormatters[locale].format(value);
}

export function formatPercent(value: number, locale: AppLocale = "ja") {
  return percentFormatters[locale].format(value);
}

export function formatDate(value: string | null, locale: AppLocale = "ja") {
  if (!value) {
    return locale === "ja" ? "シグナルなし" : "No signal yet";
  }

  return dateFormatters[locale].format(new Date(value));
}
