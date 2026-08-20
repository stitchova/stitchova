import { formatMoney } from "@/lib/currency";
import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";

export interface BrandProfile {
  businessName: string;
  tagline: string;
  logoDataUrl: string; // base64 for portability
  phone: string;
  email: string;
  address: string;
  city: string;
  momo: string;
  bank: string;
  tin: string;
  website: string;
  instagram: string;
  currency: string;
  measurementUnit: "in" | "cm";
  accentColor: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  footerNote: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  qty: number;
  price: number;
}

export type InvoiceType = "invoice" | "receipt";
export type InvoiceStatus = "unpaid" | "partial" | "paid";

export interface InvoiceRecord {
  id: string;
  number: string;
  type: InvoiceType;
  status: InvoiceStatus;
  orderId: string;
  clientName: string;
  clientPhone?: string;
  clientAddress?: string;
  issueDate: string; // ISO date
  dueDate: string;
  items: InvoiceLineItem[];
  discount: number;
  taxPct: number;
  amountPaid: number;
  notes: string;
  createdAt: number;
}

const DEFAULT_BRAND: BrandProfile = {
  businessName: "Stitchova Atelier",
  tagline: "Bespoke tailoring, refined.",
  logoDataUrl: "",
  phone: "053 698 7839",
  email: "hello@stitchova.app",
  address: "12 Ridge Ave, East Legon",
  city: "Accra, Ghana",
  momo: "MTN MoMo · 053 698 7839",
  bank: "GCB · 1441000123456",
  tin: "",
  website: "stitchova.app",
  instagram: "@stitchova",
  currency: "GHS",
  measurementUnit: "in",
  accentColor: "#D4A94A",
  invoicePrefix: "STV",
  nextInvoiceNumber: 1001,
  footerNote: "Thank you for choosing us. Every stitch made with care.",
};

const BRAND_KEY = "stitchova.brand.v1";
const INV_KEY = "stitchova.invoices.v1";

interface Ctx {
  brand: BrandProfile;
  updateBrand: (patch: Partial<BrandProfile>) => void;
  invoices: InvoiceRecord[];
  getInvoice: (id: string) => InvoiceRecord | undefined;
  getByOrder: (orderId: string) => InvoiceRecord[];
  createInvoice: (draft: Omit<InvoiceRecord, "id" | "number" | "createdAt">) => InvoiceRecord;
  updateInvoice: (id: string, patch: Partial<InvoiceRecord>) => void;
  deleteInvoice: (id: string) => void;
}

const BrandInvoiceContext = createContext<Ctx | null>(null);

export const BrandInvoiceProvider = ({ children }: { children: ReactNode }) => {
  const [brand, setBrand] = useState<BrandProfile>(() => {
    try {
      const raw = localStorage.getItem(BRAND_KEY);
      return raw ? { ...DEFAULT_BRAND, ...JSON.parse(raw) } : DEFAULT_BRAND;
    } catch {
      return DEFAULT_BRAND;
    }
  });
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(() => {
    try {
      const raw = localStorage.getItem(INV_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => { localStorage.setItem(BRAND_KEY, JSON.stringify(brand)); }, [brand]);
  useEffect(() => { localStorage.setItem(INV_KEY, JSON.stringify(invoices)); }, [invoices]);

  const value = useMemo<Ctx>(() => ({
    brand,
    updateBrand: (patch) => setBrand((b) => ({ ...b, ...patch })),
    invoices,
    getInvoice: (id) => invoices.find((i) => i.id === id),
    getByOrder: (orderId) => invoices.filter((i) => i.orderId === orderId).sort((a,b)=>b.createdAt-a.createdAt),
    createInvoice: (draft) => {
      const number = `${brand.invoicePrefix}-${brand.nextInvoiceNumber}`;
      const rec: InvoiceRecord = {
        ...draft,
        id: `inv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        number,
        createdAt: Date.now(),
      };
      setInvoices((prev) => [rec, ...prev]);
      setBrand((b) => ({ ...b, nextInvoiceNumber: b.nextInvoiceNumber + 1 }));
      return rec;
    },
    updateInvoice: (id, patch) =>
      setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i))),
    deleteInvoice: (id) => setInvoices((prev) => prev.filter((i) => i.id !== id)),
  }), [brand, invoices]);

  return <BrandInvoiceContext.Provider value={value}>{children}</BrandInvoiceContext.Provider>;
};

export const useBrandInvoice = () => {
  const ctx = useContext(BrandInvoiceContext);
  if (!ctx) throw new Error("useBrandInvoice must be used within BrandInvoiceProvider");
  return ctx;
};

export const computeTotals = (inv: Pick<InvoiceRecord, "items" | "discount" | "taxPct" | "amountPaid">) => {
  const subtotal = inv.items.reduce((s, it) => s + it.qty * it.price, 0);
  const discount = Math.max(0, inv.discount || 0);
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * ((inv.taxPct || 0) / 100);
  const total = taxable + tax;
  const balance = Math.max(0, total - (inv.amountPaid || 0));
  return { subtotal, discount, tax, total, balance };
};

export const money = (n: number, _currency?: string) => formatMoney(n, { decimals: true });