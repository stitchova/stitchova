import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Package, CheckCircle2, Truck, Star, Clock, ShieldCheck, Compass, MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAtelier, money, materialsProgress, Order } from "@/contexts/AtelierContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useBrandInvoice } from "@/contexts/BrandInvoiceContext";
import { useReviews } from "@/contexts/ReviewsContext";
import StageTracker from "@/components/StageTracker";

/**
 * Tablet/desktop workspace for the client's "My Orders" screen. Same
 * list + detail pattern as the Designer Orders workspace, but read-only on
 * production stage (clients track, they don't move stages) and built around
 * the materials-the-client-needs-to-bring flow, which is the highest-value
 * piece of the client experience. Reuses the exact same data functions as
 * the mobile page (clientMarkDroppedOff, hasReviewedOrder) — no changes to
 * how that logic works, only how it's laid out.
 */

const tabs = ["Active", "Completed", "All"] as const;

const deliveryLabel: Record<string, string> = {
  pending: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  received: "Received",
};

const ClientOrdersWorkspace = () => {
  const navigate = useNavigate();
  const { orders, clientMarkDroppedOff } = useAtelier();
  const { send } = useNotifications();
  const { brand } = useBrandInvoice();
  const { hasReviewedOrder } = useReviews();

  const [tab, setTab] = useState<(typeof tabs)[number]>("Active");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => orders.filter((o) => {
    if (tab === "Active") return o.status === "active" || o.status === "requested";
    if (tab === "Completed") return o.status === "completed";
    return true;
  }), [orders, tab]);

  const selected = orders.find((o) => o.id === selectedId) || filtered[0] || null;
  const mp = selected ? materialsProgress(selected.materialsList) : null;
  const clientMaterials = selected ? (selected.materialsList || []).filter((m) => m.source === "client") : [];

  const markDropped = (o: Order, matId: string, matName: string) => {
    clientMarkDroppedOff(o.id, matId);
    send({
      key: "materials_dropped",
      clientName: o.client,
      brandName: brand.businessName,
      channels: ["whatsapp"],
      tokens: { garment: o.garment.toLowerCase(), materials: matName },
      orderRef: o.id,
    } as never);
    toast.success("Drop-off logged — your designer will confirm receipt.");
  };

  return (
    <div className="hidden lg:block px-8 pt-6 pb-16">
      {/* Header + tabs */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold shimmer-text leading-tight">My Orders</h1>
          <p className="text-xs text-muted-foreground mt-1">Track every order, and see what you still need to bring.</p>
        </div>
        <nav className="ml-6 flex items-center gap-1 rounded-full solid-panel p-1.5">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("relative px-5 py-2 rounded-full text-xs font-semibold transition-colors",
                tab === t ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {tab === t && (
                <motion.div layoutId="clientOrdersPill" className="absolute inset-0 rounded-full bg-primary glow-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }} />
              )}
              <span className="relative z-10">{t}</span>
            </button>
          ))}
        </nav>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate("/discover")}
          className="ml-auto flex items-center gap-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold px-5 py-3 glow-primary">
          <Compass className="w-4 h-4" /> Discover designers
        </motion.button>
      </div>

      {/* List + detail */}
      <div className="mt-6 grid grid-cols-[380px_1fr] gap-5 items-start">
        {/* List panel */}
        <div className="rounded-3xl solid-panel p-3 space-y-2 max-h-[calc(100vh-13rem)] overflow-y-auto">
          {filtered.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Package className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">No orders yet</p>
              <p className="text-xs text-muted-foreground mt-1">Discover a designer to place your first order.</p>
            </div>
          )}
          <AnimatePresence mode="popLayout">
            {filtered.map((o) => {
              const active = selected?.id === o.id;
              return (
                <motion.button
                  key={o.id}
                  layout
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setSelectedId(o.id)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                    active ? "bg-primary/10 border-primary/40" : "bg-card border-border hover:bg-secondary/40"
                  )}
                >
                  <img src={o.img} alt={o.type} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{o.type}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{o.stages?.[o.currentStage] || o.status} · Due {o.dueDate}</p>
                  </div>
                  <span className="text-[11px] font-bold text-primary flex-shrink-0">{money(o.price, o.currency)}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Detail panel */}
        {selected ? (
          <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }} className="space-y-5">
            {/* Hero */}
            <div className="relative h-56 rounded-3xl overflow-hidden">
              <img src={selected.img} alt={selected.type} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
                <div>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-primary text-primary-foreground">
                    {selected.awaitingMaterials ? "Awaiting Materials" : (selected.stages?.[selected.currentStage] || selected.status)}
                  </span>
                  <h2 className="text-2xl font-bold text-foreground mt-3">{selected.type}</h2>
                  <p className="text-xs text-muted-foreground mt-1">{selected.garment} · Due {selected.dueDate}</p>
                </div>
                <span className="text-lg font-bold text-foreground bg-card border border-border rounded-2xl px-4 py-2">
                  {money(selected.price, selected.currency)}
                </span>
              </div>
            </div>

            {/* Production stages — read only for clients */}
            <div className="rounded-2xl solid-panel p-6">
              <p className="text-sm font-semibold text-foreground mb-5">Production progress</p>
              <StageTracker
                stages={selected.stages}
                currentIdx={selected.currentStage}
                disabled
                size="md"
              />
              {selected.awaitingMaterials && (
                <p className="text-xs text-muted-foreground mt-4">
                  Your designer is waiting on materials before starting — see below for what's still needed.
                </p>
              )}
            </div>

            {/* Materials to bring */}
            {clientMaterials.length > 0 && (
              <div className="rounded-2xl solid-panel p-6">
                <p className="text-sm font-semibold text-foreground mb-1">What to bring</p>
                <p className="text-xs text-muted-foreground mb-4">
                  {mp?.received} of {mp?.total} materials received
                </p>
                <div className="space-y-3">
                  {clientMaterials.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 rounded-xl bg-secondary border border-border p-3.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          Bring: <span className="font-semibold">{m.name}</span>
                          {m.neededBy && (
                            <span className="text-muted-foreground"> — needed by {new Date(m.neededBy).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                          )}
                        </p>
                        {m.status === "dropped_off" && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> Dropped off — awaiting designer confirmation
                          </span>
                        )}
                        {m.status === "received" && m.confirmation && (
                          <span className="text-[11px] text-status-completed flex items-center gap-1 mt-0.5">
                            <ShieldCheck className="w-3 h-3" /> Confirmed {new Date(m.confirmation.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                      {m.status === "needed" && (
                        <motion.button whileTap={{ scale: 0.96 }}
                          onClick={() => markDropped(selected, m.id, m.name)}
                          className="text-xs font-bold px-3.5 py-2 rounded-lg bg-primary text-primary-foreground whitespace-nowrap">
                          I've dropped this off
                        </motion.button>
                      )}
                      {m.status === "received" && (
                        <CheckCircle2 className="w-5 h-5 text-status-completed flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery + review */}
            <div className="rounded-2xl solid-panel p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-foreground font-medium">
                    {(selected.deliveryMethod || "pickup") === "delivery" ? "Delivery" : "Pickup"}
                  </p>
                  {selected.deliveryStatus && (
                    <p className="text-xs text-muted-foreground">{deliveryLabel[selected.deliveryStatus]}</p>
                  )}
                </div>
              </div>
              {(selected.deliveryStatus === "received" || selected.status === "completed") && selected.designerId && (
                hasReviewedOrder(selected.id) ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-status-completed">
                    <CheckCircle2 className="w-4 h-4" /> Reviewed
                  </span>
                ) : (
                  <motion.button whileTap={{ scale: 0.96 }} onClick={() => navigate(`/review/${selected.id}`)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary-foreground bg-primary rounded-full px-4 py-2.5">
                    <Star className="w-3.5 h-3.5 fill-primary-foreground" /> Rate this order
                  </motion.button>
                )
              )}
            </div>
          </motion.div>
        ) : (
          <div className="rounded-3xl solid-panel p-16 flex flex-col items-center justify-center text-center">
            <MapPin className="w-8 h-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Select an order to see its details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientOrdersWorkspace;
