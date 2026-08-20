/**
 * Global currency preference (designer-selectable, mock/local persistence).
 * All monetary formatting in the app funnels through `formatMoney`.
 */

export type CurrencyDef = {
  code: string;
  symbol: string;
  label: string;
  locale: string;
  flag: string;
};

export const CURRENCIES: CurrencyDef[] = [
  { code: "GHS", symbol: "₵", label: "Ghanaian Cedi", locale: "en-GH", flag: "GH" },
  { code: "NGN", symbol: "₦", label: "Nigerian Naira", locale: "en-NG", flag: "NG" },
  { code: "USD", symbol: "$", label: "US Dollar", locale: "en-US", flag: "US" },
  { code: "EUR", symbol: "€", label: "Euro", locale: "en-IE", flag: "EU" },
  { code: "GBP", symbol: "£", label: "British Pound", locale: "en-GB", flag: "GB" },
  { code: "KES", symbol: "KSh", label: "Kenyan Shilling", locale: "en-KE", flag: "KE" },
  { code: "ZAR", symbol: "R", label: "South African Rand", locale: "en-ZA", flag: "ZA" },
  { code: "XOF", symbol: "CFA", label: "West African CFA", locale: "fr-SN", flag: "CFA" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar", locale: "en-CA", flag: "CA" },
  { code: "AED", symbol: "AED", label: "UAE Dirham", locale: "en-AE", flag: "AE" },
];

const STORAGE_KEY = "stitchova-currency";
const DEFAULT_CODE = "GHS";

let activeCode: string =
  (typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY)) || DEFAULT_CODE;

const listeners = new Set<(code: string) => void>();

export const getCurrencyCode = () => activeCode;

export const getCurrency = (code = activeCode): CurrencyDef =>
  CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];

export const setCurrencyCode = (code: string) => {
  activeCode = code;
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l(code));
};

export const subscribeCurrency = (fn: (code: string) => void) => {
  listeners.add(fn);
  return () => void listeners.delete(fn);
};

/** Format a number with the active (or explicitly overridden) currency. */
export const formatMoney = (
  n: number,
  opts: { code?: string; decimals?: boolean } = {},
) => {
  const c = getCurrency(opts.code || activeCode);
  const value = (Number.isFinite(n) ? n : 0).toLocaleString(c.locale, {
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : 0,
  });
  return `${c.symbol}${value}`;
};
