import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Receipt, FileText } from "lucide-react";
import { motion } from "framer-motion";
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

  const updateItem = (id: string, patch: Partial<InvoiceLineItem>) =>
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, ...patch } : it));

  const save = () => {
    if (!items.length) return toast.error("Add at least one line item");
    const paidForRecord = type === "receipt" ? Math.min(amountPaid || totals.total, totals.total) : amountPaid;
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
    toast.success(`${type === "receipt" ? "Receipt" : "Invoice"} ${rec.number} created`);
    navigate(`/invoice/${rec.id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <div>
          <h1 className="text-xl font-bold text-foreground">New {type === "receipt" ? "Receipt" : "Invoice"}</h1>
          <p className="text-xs text-muted-foreground">For {order.client} · {order.type}</p>
        </div>
      </div>

      <div className="px-5 space-y-5">
        {/* Type toggle */}
        <div className="card-surface p-1 grid grid-cols-2 gap-1">
          {(["invoice", "receipt"] as const).map((t) => (
            <button key={t} onClick={() => setType(t)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                type === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}>
              {t === "invoice" ? <FileText className="w-3.5 h-3.5" /> : <Receipt className="w-3.5 h-3.5" />}
              {t === "invoice" ? "Invoice" : "Receipt"}
            </button>
          ))}
        </div>

        {/* Line items */}
        <div className="card-surface p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Line Items</span>
            <button onClick={() => setItems((p) => [...p, { id: uid(), description: "", qty: 1, price: 0 }])}
              className="flex items-center gap-1 text-xs text-primary font-medium">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {items.map((it) => (
            <div key={it.id} className="bg-secondary/40 rounded-xl p-3 space-y-2">
              <div className="flex gap-2">
                <input value={it.description} onChange={(e) => updateItem(it.id, { description: e.target.value })}
                  placeholder="Description"
                  className="flex-1 bg-background rounded-lg px-3 py-2 text-sm text-foreground outline-none" />
                <button onClick={() => setItems((p) => p.filter((x) => x.id !== it.id))}
                  className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[9px] text-muted-foreground uppercase">Qty</label>
                  <input type="number" min={1} value={it.qty} onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) || 1 })}
                    className="w-full bg-background rounded-lg px-2 py-1.5 text-sm text-foreground outline-none" />
                </div>
                <div>
                  <label className="text-[9px] text-muted-foreground uppercase">Price</label>
                  <input type="number" min={0} value={it.price} onChange={(e) => updateItem(it.id, { price: Number(e.target.value) || 0 })}
                    className="w-full bg-background rounded-lg px-2 py-1.5 text-sm text-foreground outline-none" />
                </div>
                <div>
                  <label className="text-[9px] text-muted-foreground uppercase">Total</label>
                  <div className="px-2 py-1.5 text-sm font-bold text-primary font-mono">{money(it.qty * it.price, brand.currency)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Adjustments */}
        <div className="card-surface p-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-[9px] text-muted-foreground uppercase font-semibold">Discount</label>
            <input type="number" min={0} value={discount} onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              className="mt-1 w-full bg-secondary rounded-xl px-3 py-2 text-sm text-foreground outline-none" />
          </div>
          <div>
            <label className="text-[9px] text-muted-foreground uppercase font-semibold">Tax %</label>
            <input type="number" min={0} max={100} value={taxPct} onChange={(e) => setTaxPct(Number(e.target.value) || 0)}
              className="mt-1 w-full bg-secondary rounded-xl px-3 py-2 text-sm text-foreground outline-none" />
          </div>
          <div>
            <label className="text-[9px] text-muted-foreground uppercase font-semibold">
              {type === "receipt" ? "Amount Received" : "Amount Paid"}
            </label>
            <input type="number" min={0} value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
              className="mt-1 w-full bg-secondary rounded-xl px-3 py-2 text-sm text-foreground outline-none" />
          </div>
          <div>
            <label className="text-[9px] text-muted-foreground uppercase font-semibold">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full bg-secondary rounded-xl px-3 py-2 text-sm text-foreground outline-none" />
          </div>
        </div>

        {/* Notes */}
        <div className="card-surface p-4">
          <label className="text-[9px] text-muted-foreground uppercase font-semibold">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            placeholder="Delivery: 2 weeks. Balance on fitting day."
            className="mt-1 w-full bg-secondary rounded-xl px-3 py-2 text-sm text-foreground outline-none resize-none" />
        </div>

        {/* Summary */}
        <div className="card-surface p-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground"><span>Subtotal</span><span className="font-mono text-foreground">{money(totals.subtotal, brand.currency)}</span></div>
          {totals.discount > 0 && <div className="flex justify-between text-xs text-muted-foreground"><span>Discount</span><span className="font-mono">-{money(totals.discount, brand.currency)}</span></div>}
          {taxPct > 0 && <div className="flex justify-between text-xs text-muted-foreground"><span>Tax ({taxPct}%)</span><span className="font-mono text-foreground">{money(totals.tax, brand.currency)}</span></div>}
          <div className="flex justify-between text-sm font-bold pt-2 border-t border-border"><span>Total</span><span className="text-primary font-mono">{money(totals.total, brand.currency)}</span></div>
          <div className="flex justify-between text-xs"><span className="text-muted-foreground">Balance</span><span className="font-mono font-bold text-foreground">{money(totals.balance, brand.currency)}</span></div>
        </div>
      </div>

      <div className="fixed bottom-24 left-0 right-0 px-5 max-w-md mx-auto">
        <motion.button whileTap={{ scale: 0.98 }} onClick={save}
          className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-xl shadow-primary/30">
          Generate {type === "receipt" ? "Receipt" : "Invoice"}
        </motion.button>
      </div>
    </div>
  );
};

export default InvoiceEditor;