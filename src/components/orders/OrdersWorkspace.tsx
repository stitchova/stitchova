import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Package, Truck, User, CheckCircle2, XCircle, ExternalLink, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import OrderMaterials from "@/components/OrderMaterials";
import EmptyState from "@/components/EmptyState";
import { useAtelier, money, materialsProgress, Order } from "@/contexts/AtelierContext";
import { useBrandInvoice } from "@/contexts/BrandInvoiceContext";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const tabs = ["All", "Requested", "Active", "Completed"] as const;

const orderNo = (i: number) => `#ORD-${String(1000 + i + 1)}`;

const statusOf = (o: Order) => {
  if (o.status === "requested") return "Requested";
  if (o.status === "completed") return "Completed";
  if (o.status === "declined") return "Declined";
  if (o.awaitingMaterials) return "Awaiting Materials";
  return o.stages[o.currentStage] || "Active";
};

const pillClass = (o: Order) => {
  if (o.status === "completed") return "bg-status-completed/15 text-status-completed";
  if (o.status === "declined") return "bg-destructive/15 text-destructive";
  if (o.status === "requested") return "bg-accent/20 text-accent-foreground";
  if (o.awaitingMaterials) return "bg-secondary text-muted-foreground";
  const s = o.stages[o.currentStage];
  if (s === "Cutting") return "bg-status-cutting/15 text-status-cutting";
  if (s === "Sewing") return "bg-status-sewing/15 text-status-sewing";
  return "bg-primary/15 text-primary";
};

interface Props {
  onNewOrder: () => void;
}

/**
 * Tablet/desktop Orders workspace: pill nav → stat cards → list + detail split.
 * Mobile keeps the existing stacked order list (this component is hidden below lg).
 */
const OrdersWorkspace = ({ onNewOrder }: Props) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { orders, confirmOrder, declineOrder } = useAtelier();
  const { brand } = useBrandInvoice();

  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");

  const clientOptions = useMemo(
    () => Array.from(new Set(orders.map((o) => o.client))).sort(),
    [orders]
  );
  const stageOptions = useMemo(
    () => Array.from(new Set(orders.map((o) => statusOf(o)))),
    [orders]
  );

  const filtered = useMemo(() => orders.filter((o) => {
    const byTab =
      tab === "All" ? true :
      tab === "Requested" ? o.status === "requested" :
      tab === "Active" ? o.status === "active" :
      o.status === "completed";
    const bySearch = `${o.type} ${o.client} ${o.garment}`.toLowerCase().includes(query.toLowerCase());
    const byClient = clientFilter === "all" ? true : o.client === clientFilter;
    const byStage = stageFilter === "all" ? true : statusOf(o) === stageFilter;
    return byTab && bySearch && byClient && byStage;
  }), [orders, tab, query, clientFilter, stageFilter]);

  useEffect(() => {
    if (!filtered.find((o) => o.id === selectedId)) setSelectedId(filtered[0]?.id ?? null);
  }, [filtered, selectedId]);

  const selected = filtered.find((o) => o.id === selectedId) || null;
  const selectedIdx = orders.findIndex((o) => o.id === selected?.id);

  const activeCount = orders.filter((o) => o.status === "active").length;
  const awaitingCount = orders.filter((o) => o.status === "active" && o.awaitingMaterials).length;
  const inProduction = orders.filter((o) => o.status === "active").reduce((sum, o) => sum + o.price, 0);

  const stats = [
    { label: "Active orders", value: String(activeCount), hint: "In the workshop now" },
    { label: "Awaiting materials", value: String(awaitingCount), hint: "Blocked before cutting" },
    { label: "Value in production", value: money(inProduction, "GHS"), hint: "Across active orders" },
  ];

  const paid = selected ? selected.payments.reduce((s, p) => s + p.amount, 0) : 0;
  const mp = selected ? materialsProgress(selected.materialsList) : null;

  return (
    <div className="hidden lg:block px-8 pt-6 pb-16">
      {/* Top nav bar — pill active state */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold shimmer-text leading-tight">Orders</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage and track all your orders in one place.</p>
        </div>
        <nav className="ml-6 flex items-center gap-1 rounded-full solid-panel p-1.5">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("relative px-5 py-2 rounded-full text-xs font-semibold transition-colors",
                tab === t ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {tab === t && (
                <motion.div layoutId="ordersDesktopPill" className="absolute inset-0 rounded-full bg-primary glow-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }} />
              )}
              <span className="relative z-10">{t}</span>
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-44 solid-input text-xs">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                <SelectValue placeholder="All customers" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">All customers</SelectItem>
              {clientOptions.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-44 solid-input text-xs">
              <div className="flex items-center gap-2">
                <ListFilter className="w-3.5 h-3.5 text-muted-foreground" />
                <SelectValue placeholder="All statuses" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">All statuses</SelectItem>
              {stageOptions.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 solid-input px-4 py-2.5 w-56">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search orders…"
              className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground flex-1 outline-none" />
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onNewOrder}
            className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold px-5 py-3 glow-primary">
            <Plus className="w-4 h-4" /> Create an order
          </motion.button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-5 mt-6">
        {stats.map((s) => (
          <div key={s.label} className="solid-panel p-5">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-2">{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{s.hint}</p>
          </div>
        ))}
      </div>

      {/* List + detail split */}
      <div className="mt-6 rounded-3xl card-elevated p-5 grid grid-cols-[minmax(320px,380px)_1fr] gap-5 items-start">
        {/* List panel */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground px-1 pb-1">
            {tab} orders <span className="text-muted-foreground font-normal">({filtered.length})</span>
          </p>
          <div className="space-y-2 max-h-[620px] overflow-y-auto scrollbar-hide pr-1">
            {filtered.map((o) => {
              const active = o.id === selectedId;
              return (
                <button key={o.id} onClick={() => setSelectedId(o.id)}
                  className={cn("w-full text-left rounded-2xl p-3 flex items-center gap-3 transition-colors border",
                    active ? "bg-primary/10 border-primary/40" : "bg-card border-border hover:bg-secondary/40")}>
                  <img src={o.img} alt={o.type} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{orderNo(orders.indexOf(o))} · {o.type}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{o.client} · Due {o.dueDate}</p>
                  </div>
                  <span className={cn("text-[9px] font-semibold px-2 py-1 rounded-full whitespace-nowrap", pillClass(o))}>
                    {statusOf(o)}
                  </span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <EmptyState icon={Package} title="No orders" description="No orders match this filter yet." />
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selected ? (
          <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl bg-card border border-border p-6 space-y-5">
            {/* Header info */}
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[11px] text-muted-foreground">Order details</p>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-xl font-bold text-foreground">{orderNo(selectedIdx)}</h2>
                  <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full", pillClass(selected))}>
                    {statusOf(selected)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{selected.type} · {selected.garment}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground">Client</p>
                <p className="text-sm font-semibold text-foreground mt-1">{selected.client}</p>
                <p className="text-[11px] text-muted-foreground">{brand.businessName || "Atelier"}</p>
              </div>
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => navigate(`/order/${selected.id}`)}
                className="rounded-full solid-panel px-4 py-2 text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                Open <ExternalLink className="w-3 h-3" />
              </motion.button>
            </div>

            {/* Key info grid */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Due date", value: selected.dueDate },
                { label: "Stage", value: selected.awaitingMaterials ? "Awaiting Materials" : selected.stages[selected.currentStage] || "—" },
                { label: "Category", value: `${selected.category} · ${selected.garment}` },
                { label: "Delivery", value: selected.deliveryMethod === "delivery" ? "Delivery" : "Pickup" },
              ].map((b) => (
                <div key={b.label} className="rounded-2xl bg-secondary border border-border p-4">
                  <p className="text-[10px] text-muted-foreground">{b.label}</p>
                  <p className="text-sm font-semibold text-foreground mt-1.5 leading-snug">{b.value}</p>
                </div>
              ))}
            </div>

            {/* Materials summary chips */}
            {mp && mp.total > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-1 rounded-full bg-secondary text-foreground flex items-center gap-1">
                  <Package className="w-3 h-3 text-primary" /> {mp.received}/{mp.total} materials received
                </span>
                {mp.waitingOnClient > 0 && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                    <User className="w-3 h-3" /> waiting on client
                  </span>
                )}
                {mp.waitingOnUs > 0 && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-secondary text-muted-foreground flex items-center gap-1">
                    <Truck className="w-3 h-3" /> to procure
                  </span>
                )}
              </div>
            )}

            <OrderMaterials orderId={selected.id} actorName={brand.businessName || "Designer"} actorRole="designer" />

            {/* Summary / totals */}
            <div className="rounded-2xl bg-secondary border border-border p-5 flex items-center justify-between">
              <div className="flex gap-10">
                <div>
                  <p className="text-[10px] text-muted-foreground">Sub total</p>
                  <p className="text-sm font-bold text-foreground mt-1">{money(selected.price, selected.currency)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Paid</p>
                  <p className="text-sm font-bold text-foreground mt-1">{money(paid, selected.currency)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Balance due</p>
                  <p className="text-sm font-bold text-primary mt-1">{money(Math.max(0, selected.price - paid), selected.currency)}</p>
                </div>
              </div>
              {selected.status === "requested" ? (
                <div className="flex gap-2">
                  <button onClick={() => { confirmOrder(selected.id); toast({ title: "Order confirmed" }); }}
                    className="rounded-full bg-primary text-primary-foreground text-xs font-semibold px-5 py-2.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                  </button>
                  <button onClick={() => { declineOrder(selected.id); toast({ title: "Order declined" }); }}
                    className="rounded-full bg-destructive/15 text-destructive text-xs font-semibold px-5 py-2.5 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Decline
                  </button>
                </div>
              ) : (
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate(`/order/${selected.id}`)}
                  className="rounded-full bg-primary text-primary-foreground text-xs font-semibold px-6 py-2.5">
                  Manage order
                </motion.button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="rounded-3xl bg-card border border-border">
            <EmptyState icon={Package} title="Select an order" description="Pick an order from the list to see its details." />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersWorkspace;
