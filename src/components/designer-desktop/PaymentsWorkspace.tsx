import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Wallet, ExternalLink } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { useAtelier, money, Order } from "@/contexts/AtelierContext";
import {
  DesktopOnly, WorkspaceHeader, StatCards, ListDetail, ListPanel, ListRow, DetailPanel,
  DetailHeader, InfoGrid, SummaryBar, SectionCard, StatusPill, PillTone,
} from "./DesktopKit";

const tabs = ["All", "Unpaid", "Partial", "Paid"] as const;

export const paidTotal = (o: Order) => o.payments.reduce((s, p) => s + p.amount, 0);
export const paymentStatus = (o: Order): "Unpaid" | "Partial" | "Paid" => {
  const paid = paidTotal(o);
  if (paid <= 0) return "Unpaid";
  return paid >= o.price ? "Paid" : "Partial";
};
export const paymentTone: Record<string, PillTone> = {
  Unpaid: "danger", Partial: "warning", Paid: "success",
};

const methods = ["Cash", "Mobile Money", "Bank Transfer", "Card"];

/** Designer payments workspace (list + detail) for tablet/desktop. */
const PaymentsWorkspace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { orders, addPayment } = useAtelier();

  const [tab, setTab] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(methods[0]);

  const billable = useMemo(() => orders.filter((o) => o.status !== "declined" && o.status !== "requested"), [orders]);

  const filtered = useMemo(() => billable.filter((o) => {
    const byTab = tab === "All" ? true : paymentStatus(o) === tab;
    return byTab && `${o.client} ${o.type}`.toLowerCase().includes(query.toLowerCase());
  }), [billable, tab, query]);

  useEffect(() => {
    if (!filtered.find((o) => o.id === selectedId)) setSelectedId(filtered[0]?.id ?? null);
  }, [filtered, selectedId]);

  const selected = filtered.find((o) => o.id === selectedId) || null;

  const invoiced = billable.reduce((s, o) => s + o.price, 0);
  const collected = billable.reduce((s, o) => s + paidTotal(o), 0);
  const stats = [
    { label: "Collected", value: money(collected, "GHS"), hint: "Advances and balances received" },
    { label: "Outstanding", value: money(Math.max(0, invoiced - collected), "GHS"), hint: "Still owed by clients" },
    { label: "Unpaid orders", value: String(billable.filter((o) => paymentStatus(o) === "Unpaid").length), hint: "No payment recorded yet" },
  ];

  const record = () => {
    if (!selected) return;
    const n = parseFloat(amount);
    if (!n || n <= 0) { toast({ title: "Enter an amount", variant: "destructive" }); return; }
    addPayment(selected.id, { amount: n, method, date: new Date().toISOString().slice(0, 10) });
    setAmount("");
    toast({ title: "Payment recorded", description: `${money(n, selected.currency)} from ${selected.client}.` });
  };

  return (
    <DesktopOnly>
      <WorkspaceHeader
        title="Payments"
        subtitle="Track advances, balances and fully settled orders."
        tabs={tabs} activeTab={tab} onTab={setTab} pillId="paymentsDesktopPill"
        query={query} onQuery={setQuery} searchPlaceholder="Search clients or orders…"
      />
      <StatCards stats={stats} />

      <ListDetail
        list={
          <ListPanel title={`${tab} payments`} count={filtered.length}>
            {filtered.map((o) => {
              const status = paymentStatus(o);
              return (
                <ListRow key={o.id} active={o.id === selectedId} onClick={() => setSelectedId(o.id)}
                  title={`${o.client} · ${o.type}`}
                  meta={`Due ${o.dueDate} · ${money(Math.max(0, o.price - paidTotal(o)), o.currency)} outstanding`}
                  pill={{ label: status, tone: paymentTone[status] }} />
              );
            })}
            {filtered.length === 0 && (
              <EmptyState icon={Wallet} title="No payments" description="No orders match this payment filter." />
            )}
          </ListPanel>
        }
        detail={selected ? (
          <DetailPanel id={selected.id}>
            <DetailHeader
              eyebrow="Payment record"
              title={selected.client}
              pill={{ label: paymentStatus(selected), tone: paymentTone[paymentStatus(selected)] }}
              subtitle={`${selected.type} · ${selected.garment}`}
              right={{ label: "Order total", value: money(selected.price, selected.currency), hint: `Due ${selected.dueDate}` }}
              actions={
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => navigate(`/order/${selected.id}`)}
                  className="rounded-full frost-card px-4 py-2 text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  Open order <ExternalLink className="w-3 h-3" />
                </motion.button>
              }
            />

            <InfoGrid blocks={[
              { label: "Advance", value: selected.payments[0] ? money(selected.payments[0].amount, selected.currency) : "None" },
              { label: "Payments made", value: String(selected.payments.length) },
              { label: "Stage", value: selected.awaitingMaterials ? "Awaiting Materials" : selected.stages[selected.currentStage] || "—" },
              { label: "Delivery", value: selected.deliveryMethod === "delivery" ? "Delivery" : "Pickup" },
            ]} />

            <div className="grid grid-cols-2 gap-4">
              <SectionCard title="Payment history">
                <div className="space-y-2">
                  {selected.payments.map((p) => (
                    <div key={p.id} className="rounded-2xl bg-card/60 border border-border/40 p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{money(p.amount, selected.currency)}</p>
                        <p className="text-[11px] text-muted-foreground">{p.method} · {p.date}</p>
                      </div>
                      <StatusPill label="Received" tone="success" />
                    </div>
                  ))}
                  {selected.payments.length === 0 && (
                    <p className="text-xs text-muted-foreground py-4 text-center">No payments recorded yet.</p>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Record a payment">
                <div className="space-y-3">
                  <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" inputMode="decimal"
                    placeholder={`Amount in ${selected.currency}`}
                    className="w-full bg-card border border-border rounded-xl py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors" />
                  <div className="flex flex-wrap gap-2">
                    {methods.map((m) => (
                      <button key={m} onClick={() => setMethod(m)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors ${
                          method === m ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={record}
                    className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold">
                    Save payment
                  </motion.button>
                </div>
              </SectionCard>
            </div>

            <SummaryBar items={[
              { label: "Order total", value: money(selected.price, selected.currency) },
              { label: "Paid", value: money(paidTotal(selected), selected.currency) },
              { label: "Balance due", value: money(Math.max(0, selected.price - paidTotal(selected)), selected.currency), accent: true },
            ]}>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate(`/order/${selected.id}/invoice/new`)}
                className="rounded-full bg-primary text-primary-foreground text-xs font-semibold px-6 py-2.5">
                Create receipt
              </motion.button>
            </SummaryBar>
          </DetailPanel>
        ) : (
          <div className="rounded-3xl bg-card/70 border border-border/40">
            <EmptyState icon={Wallet} title="Select an order" description="Pick an order to see its payment record." />
          </div>
        )}
      />
    </DesktopOnly>
  );
};

export default PaymentsWorkspace;
