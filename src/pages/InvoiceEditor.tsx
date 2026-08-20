import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Receipt, FileText, Sparkles, CalendarDays, Percent, BadgePercent, Wallet, StickyNote, GripVertical } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { toast } from "sonner";
import { useBrandInvoice, InvoiceLineItem, InvoiceType, computeTotals, money } from "@/contexts/BrandInvoiceContext";

// Local mock: keep in sync with OrderDetail
const ordersData: Record<string, { type: string; client: string; price: string; amountPaid: string; balance: string; fabrics: string[]; }> = {
  "ama-serwaa": { type: "Wedding Gown", client: "Ama Serwaa", price: "GHS 2,500", amountPaid: "GHS 1,500", balance: "GHS 1,000", fabrics: ["French Lace – Ivory", "Silk Satin – White"] },
  "kofi-mensah": { type: "3-Piece Suit", client: "Kofi Mensah", price: "GHS 1,800", amountPaid: "GHS 1,800", balance: "GHS 0", fabrics: ["English Wool – Navy"] },
  "yaw-boateng": { type: "Agbada Set", client: "Yaw Boateng", price: "GHS 3,200", amountPaid: "GHS 2,500", balance: "GHS 700", fabrics: ["Guinea Brocade – Royal Blue"] },
};

const parseAmount = (s: string) => Number((s || "").replace(/[^\d.]/g, "")) || 0;
const uid = () => Math.random().toString(36).slice(2, 9);

const QUICK_ITEMS = ["Tailoring Labour", "Fabric", "Lining", "Beadwork", "Delivery", "Alteration"];

const glass = "rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-[0_8px_40px_-16px_hsl(var(--primary)/0.25)]";

const Field = ({
  label, icon: Icon, children,
}: { label: string; icon?: React.ElementType; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {Icon && <Icon className="w-3 h-3 text-primary" />} {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full bg-secondary/60 border border-border/50 rounded-2xl px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary/60 focus:bg-secondary";

const InvoiceEditor = () => {
  const navigate = useNavigate();
  const { clientId = "ama-serwaa" } = useParams();
  const [params] = useSearchParams();
  const { brand, createInvoice } = useBrandInvoice();
  const order = ordersData[clientId] || ordersData["ama-serwaa"];

  const [type, setType] = useState<InvoiceType>((params.get("type") as InvoiceType) || "invoice");
  const [items, setItems] = useState<InvoiceLineItem[]>(() => [
    { id: uid(), description: order.type, qty: 1, price: parseAmount(order.price) },
    ...order.fabrics.map((f) => ({ id: uid(), description: f, qty: 1, price: 0 })),
  ]);
  const [discount, setDiscount] = useState(0);
  const [taxPct, setTaxPct] = useState(0);
  const [amountPaid, setAmountPaid] = useState(parseAmount(order.amountPaid));
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });

  const totals = useMemo(() => computeTotals({ items, discount, taxPct, amountPaid }), [items, discount, taxPct, amountPaid]);
  const status = type === "receipt" || totals.balance === 0 ? "paid" : amountPaid > 0 ? "partial" : "unpaid";
  const isReceipt = type === "receipt";
  const paidPct = totals.total > 0 ? Math.min(100, (amountPaid / totals.total) * 100) : 0;

  const updateItem = (id: string, patch: Partial<InvoiceLineItem>) =>
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, ...patch } : it));

  const addItem = (description = "") =>
    setItems((p) => [...p, { id: uid(), description, qty: 1, price: 0 }]);

  const save = () => {
    if (!items.length) return toast.error("Add at least one line item");
    const paidForRecord = isReceipt ? Math.min(amountPaid || totals.total, totals.total) : amountPaid;
    const rec = createInvoice({
      type, status,
      orderId: clientId,
      clientName: order.client,
      clientPhone: "",
      clientAddress: "",
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate,
      items,
      discount,
      taxPct,
      amountPaid: paidForRecord,
      notes,
    });
    toast.success(`${isReceipt ? "Receipt" : "Invoice"} ${rec.number} created`);
    navigate(`/invoice/${rec.id}`);
  };

  const statusTone =
    status === "paid" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : status === "partial" ? "bg-primary/15 text-primary border-primary/30"
        : "bg-destructive/15 text-destructive border-destructive/30";

  return (
    <div className="min-h-screen bg-background pb-40">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-[radial-gradient(70%_100%_at_50%_0%,hsl(var(--primary)/0.16),transparent_70%)]" />

      {/* Header */}
      <div className="relative px-5 pt-6 pb-3 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full border border-border/60 bg-card/60 backdrop-blur-xl flex items-center justify-center"
          aria-label="Go back">
          <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
        </motion.button>
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold tracking-tight text-foreground leading-tight">
            New {isReceipt ? "Receipt" : "Invoice"}
          </h1>
          <p className="text-[11px] text-muted-foreground truncate">{order.client} · {order.type}</p>
        </div>
        <span className={`ml-auto shrink-0 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusTone}`}>
          {status}
        </span>
      </div>

      <div className="relative px-5 space-y-4 lg:grid lg:grid-cols-[1.4fr_1fr] lg:gap-5 lg:space-y-0 lg:items-start">
        <div className="space-y-4">
          {/* Type toggle */}
          <LayoutGroup id="doc-type">
            <div className={`${glass} p-1.5 grid grid-cols-2 gap-1`}>
              {(["invoice", "receipt"] as const).map((t) => {
                const active = type === t;
                return (
                  <button key={t} onClick={() => setType(t)}
                    className="relative flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold">
                    {active && (
                      <motion.span layoutId="doc-type-pill"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        className="absolute inset-0 rounded-2xl bg-primary shadow-lg shadow-primary/25" />
                    )}
                    <span className={`relative flex items-center gap-2 ${active ? "text-primary-foreground" : "text-muted-foreground"}`}>
                      {t === "invoice" ? <FileText className="w-3.5 h-3.5" /> : <Receipt className="w-3.5 h-3.5" />}
                      {t === "invoice" ? "Invoice" : "Receipt"}
                    </span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>

          {/* Line items */}
          <div className={`${glass} p-4 space-y-3`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground">Line Items</p>
                <p className="text-[10px] text-muted-foreground">{items.length} {items.length === 1 ? "entry" : "entries"}</p>
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => addItem()}
                className="flex items-center gap-1.5 rounded-full bg-primary/12 border border-primary/30 px-3 py-1.5 text-[11px] font-bold text-primary">
                <Plus className="w-3.5 h-3.5" /> Add
              </motion.button>
            </div>

            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-0.5">
              {QUICK_ITEMS.map((q) => (
                <button key={q} onClick={() => addItem(q)}
                  className="shrink-0 rounded-full border border-border/60 bg-secondary/50 px-3 py-1 text-[10px] font-medium text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                  + {q}
                </button>
              ))}
            </div>

            <AnimatePresence initial={false}>
              {items.map((it, i) => (
                <motion.div key={it.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -12, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.22, delay: Math.min(i, 6) * 0.02 }}
                  className="rounded-2xl border border-border/50 bg-secondary/30 p-3 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-bold text-primary font-mono">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <input value={it.description} onChange={(e) => updateItem(it.id, { description: e.target.value })}
                      placeholder="Description"
                      className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground" />
                    <button onClick={() => setItems((p) => p.filter((x) => x.id !== it.id))}
                      aria-label="Remove line item"
                      className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-background/70 border border-border/40 px-2.5 py-1.5">
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Qty</p>
                      <input type="number" min={1} value={it.qty}
                        onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) || 1 })}
                        className="w-full bg-transparent text-sm font-mono text-foreground outline-none" />
                    </div>
                    <div className="rounded-xl bg-background/70 border border-border/40 px-2.5 py-1.5">
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Price</p>
                      <input type="number" min={0} value={it.price}
                        onChange={(e) => updateItem(it.id, { price: Number(e.target.value) || 0 })}
                        className="w-full bg-transparent text-sm font-mono text-foreground outline-none" />
                    </div>
                    <div className="rounded-xl bg-primary/10 border border-primary/25 px-2.5 py-1.5">
                      <p className="text-[9px] uppercase tracking-wider text-primary/80">Amount</p>
                      <p className="text-sm font-bold text-primary font-mono truncate">{money(it.qty * it.price, brand.currency)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {!items.length && (
              <div className="rounded-2xl border border-dashed border-border/60 py-8 text-center">
                <GripVertical className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">No line items yet — add one above.</p>
              </div>
            )}
          </div>

          {/* Adjustments */}
          <div className={`${glass} p-4 grid grid-cols-2 gap-3`}>
            <Field label="Discount" icon={BadgePercent}>
              <input type="number" min={0} value={discount} onChange={(e) => setDiscount(Number(e.target.value) || 0)} className={inputCls} />
            </Field>
            <Field label="Tax %" icon={Percent}>
              <input type="number" min={0} max={100} value={taxPct} onChange={(e) => setTaxPct(Number(e.target.value) || 0)} className={inputCls} />
            </Field>
            <Field label={isReceipt ? "Amount Received" : "Amount Paid"} icon={Wallet}>
              <input type="number" min={0} value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value) || 0)} className={inputCls} />
            </Field>
            <Field label="Due Date" icon={CalendarDays}>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
            </Field>
          </div>

          {/* Notes */}
          <div className={`${glass} p-4`}>
            <Field label="Notes" icon={StickyNote}>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                placeholder="Delivery: 2 weeks. Balance on fitting day."
                className={`${inputCls} resize-none`} />
            </Field>
          </div>
        </div>

        {/* Summary */}
        <div className={`${glass} overflow-hidden lg:sticky lg:top-6`}>
          <div className="px-4 pt-4 pb-3 flex items-center gap-2 border-b border-border/50">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-foreground">Summary</span>
          </div>

          <div className="p-4 space-y-2.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subtotal</span><span className="font-mono text-foreground">{money(totals.subtotal, brand.currency)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Discount</span><span className="font-mono text-destructive">-{money(totals.discount, brand.currency)}</span>
              </div>
            )}
            {taxPct > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tax ({taxPct}%)</span><span className="font-mono text-foreground">{money(totals.tax, brand.currency)}</span>
              </div>
            )}

            <div className="mt-1 rounded-2xl bg-primary/12 border border-primary/25 px-3.5 py-3 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Total</span>
              <span className="text-lg font-bold font-mono text-primary">{money(totals.total, brand.currency)}</span>
            </div>

            <div className="pt-1 space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">{isReceipt ? "Received" : "Paid"}</span>
                <span className="font-mono font-semibold text-foreground">{money(amountPaid, brand.currency)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <motion.div className="h-full rounded-full bg-primary"
                  animate={{ width: `${paidPct}%` }} transition={{ type: "spring", stiffness: 220, damping: 30 }} />
              </div>
              <div className="flex justify-between text-[11px] pt-0.5">
                <span className="text-muted-foreground">Balance due</span>
                <span className="font-mono font-bold text-foreground">{money(totals.balance, brand.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom action */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.15 }}
        className="fixed bottom-24 left-0 right-0 z-40 px-4 sm:max-w-md mx-auto lg:max-w-lg"
      >
        <div className="rounded-[2rem] border border-primary/20 bg-card/85 backdrop-blur-2xl shadow-[0_-12px_40px_-12px_hsl(var(--primary)/0.18),0_8px_30px_-10px_hsl(0_0%_0%/0.3)] p-2">
          <motion.button
            whileHover={{ scale: 1.02, y: -1.5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            onClick={save}
            className="relative w-full overflow-hidden rounded-[1.5rem] bg-primary py-4 text-sm font-bold text-primary-foreground shadow-2xl shadow-primary/40 ring-1 ring-primary-foreground/25 flex items-center justify-center gap-2"
          >
            {/* shimmer sweep */}
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 2.4, ease: "linear" }}
            />
            <span className="relative flex items-center justify-center gap-2">
              {isReceipt ? <Receipt className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              Generate {isReceipt ? "Receipt" : "Invoice"}
              <span className="font-mono opacity-85">· {money(totals.total, brand.currency)}</span>
            </span>
          </motion.button>
        </div>
      </motion.div>

    </div>
  );
};

export default InvoiceEditor;
