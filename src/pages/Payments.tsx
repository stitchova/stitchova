import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAtelier, money } from "@/contexts/AtelierContext";
import PaymentsWorkspace, { paidTotal, paymentStatus } from "@/components/designer-desktop/PaymentsWorkspace";

const tabs = ["All", "Unpaid", "Partial", "Paid"];

const toneClass: Record<string, string> = {
  Unpaid: "bg-destructive/15 text-destructive",
  Partial: "bg-status-cutting/15 text-status-cutting",
  Paid: "bg-status-completed/15 text-status-completed",
};

const Payments = () => {
  const navigate = useNavigate();
  const { orders } = useAtelier();
  const [tab, setTab] = useState("All");

  const billable = useMemo(
    () => orders.filter((o) => o.status !== "declined" && o.status !== "requested"),
    [orders]
  );
  const filtered = billable.filter((o) => (tab === "All" ? true : paymentStatus(o) === tab));
  const outstanding = billable.reduce((s, o) => s + Math.max(0, o.price - paidTotal(o)), 0);

  return (
    <>
      <PaymentsWorkspace />

      {/* Mobile view */}
      <div className="lg:hidden min-h-screen bg-background pb-24">
        <div className="designer-hero px-5 pt-6 pb-5 rounded-b-3xl">
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </motion.button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold shimmer-text">Payments</h1>
              <p className="text-xs text-muted-foreground mt-1">
                {money(outstanding, "GHS")} outstanding
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl frost-card flex items-center justify-center">
              <Wallet className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-5 my-4">
          {tabs.map((t) => (
            <motion.button key={t} whileTap={{ scale: 0.95 }} onClick={() => setTab(t)}
              className={cn("px-4 py-2 rounded-xl text-xs font-medium transition-colors",
                tab === t ? "bg-primary text-primary-foreground glow-primary" : "frost-card text-muted-foreground")}>
              {t}
            </motion.button>
          ))}
        </div>

        <div className="px-5 space-y-3">
          {filtered.map((o) => {
            const status = paymentStatus(o);
            return (
              <motion.button key={o.id} whileTap={{ scale: 0.98 }} onClick={() => navigate(`/order/${o.id}`)}
                className="frost-card p-4 w-full flex items-center gap-3 text-left">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{o.client}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{o.type} · Due {o.dueDate}</p>
                  <p className="text-[11px] text-primary mt-1">
                    {money(Math.max(0, o.price - paidTotal(o)), o.currency)} balance
                  </p>
                </div>
                <span className={cn("text-[9px] font-semibold px-2 py-1 rounded-full", toneClass[status])}>{status}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-12">No orders in this filter</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Payments;
