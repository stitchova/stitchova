import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  CURRENCIES,
  CurrencyDef,
  getCurrency,
  getCurrencyCode,
  setCurrencyCode,
  subscribeCurrency,
  formatMoney,
} from "@/lib/currency";

type Ctx = {
  code: string;
  currency: CurrencyDef;
  currencies: CurrencyDef[];
  setCurrency: (code: string) => void;
  format: (n: number, decimals?: boolean) => string;
};

const CurrencyContext = createContext<Ctx | null>(null);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [code, setCode] = useState(getCurrencyCode());

  useEffect(() => subscribeCurrency(setCode), []);

  const value: Ctx = {
    code,
    currency: getCurrency(code),
    currencies: CURRENCIES,
    setCurrency: setCurrencyCode,
    format: (n, decimals) => formatMoney(n, { decimals }),
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};
