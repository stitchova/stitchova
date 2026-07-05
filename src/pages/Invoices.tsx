import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Receipt as ReceiptIcon, Plus, Settings2 } from "lucide-react";
import { useState } from "react";
import { useBrandInvoice, computeTotals, money } from "@/contexts/BrandInvoiceContext";

const filters = ["All", "Unpaid", "Paid", "Receipts"] as const;

const Invoices = () => {
  const navigate = useNavigate();
  const { invoices, brand } = useBrandInvoice();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const list = invoices.filter((i) => {
    if (filter === "All") return true;
    if (filter === "Receipts") return i.type === "receipt";
    if (filter === "Paid") return i.status === "paid";
    if (filter === "Unpaid") return i.status !== "paid" && i.type === "invoice";
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Invoices</h1>
            <p className="text-xs text-muted-foreground">{invoices.length} total documents</p>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/settings/brand")}
          className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <Settings2 className="w-4 h-4 text-foreground" />
        </motion.button>
      </div>

      <div className="px-5 mb-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}>{f}</button>
        ))}
      </div>

      <div className="px-5 space-y-2.5">
        {list.length === 0 && (
          <div className="card-surface p-8 text-center">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">No documents yet</p>
            <p className="text-[11px] text-muted-foreground mt-1">Open an order to create your first invoice.</p>
            <button onClick={() => navigate("/orders")} className="mt-3 text-xs font-bold text-primary">Go to Orders →</button>
          </div>
        )}
        {list.map((inv, i) => {
          const t = computeTotals(inv);
          const Icon = inv.type === "receipt" ? ReceiptIcon : FileText;
          const statusColor =
            inv.status === "paid" ? "text-status-completed bg-status-completed/10" :
            inv.status === "partial" ? "text-primary bg-primary/10" :
            "text-destructive bg-destructive/10";
          return (
            <motion.button key={inv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/invoice/${inv.id}`)}
              className="card-surface w-full p-3.5 flex items-center gap-3 text-left">
              <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">{inv.clientName}</p>
                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${statusColor}`}>
                    {inv.type === "receipt" ? "Receipt" : inv.status}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground font-mono">#{inv.number} · {new Date(inv.issueDate).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground font-mono">{money(t.total, brand.currency)}</p>
                {inv.type === "invoice" && t.balance > 0 && (
                  <p className="text-[10px] text-destructive">Due {money(t.balance, brand.currency)}</p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate("/orders")}
        className="fixed bottom-28 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40 flex items-center justify-center z-40">
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

export default Invoices;