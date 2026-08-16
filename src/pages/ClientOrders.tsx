import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, Package, CheckCircle2, Truck, Sparkles, Clock, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAtelier, money, Order, materialsProgress } from "@/contexts/AtelierContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useBrandInvoice } from "@/contexts/BrandInvoiceContext";
import { useReviews } from "@/contexts/ReviewsContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ease = [0.16, 1, 0.3, 1];
const tabs = ["Active", "Completed", "All"];

const deliveryLabel: Record<string, string> = {
  pending: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for Delivery",
  received: "Received",
};

const OrderTimeline = ({ o }: { o: Order }) => {
  const stages = o.stages || [];
  return (
    <div className="mt-3">
      <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1.5">Production</p>
      {o.awaitingMaterials && (
        <p className="text-[9px] text-primary font-semibold mb-1.5">Awaiting materials — production hasn't started</p>
      )}
      <div className="flex items-center gap-1">
        {stages.map((s, i) => (
          <div key={s + i} className="flex items-center flex-1">
            <div className={cn(
              "flex-1 h-1.5 rounded-full",
              i <= o.currentStage ? "bg-primary" : "bg-secondary"
            )} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[9px] text-muted-foreground">
          {stages[o.currentStage] || "—"}
        </span>
        <span className="text-[9px] text-primary font-semibold">
          Stage {Math.min(o.currentStage + 1, stages.length)} / {stages.length}
        </span>
      </div>
      {o.deliveryStatus && (
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/40">
          <Truck className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-foreground">
            {(o.deliveryMethod || "pickup") === "delivery" ? "Delivery" : "Pickup"} · <span className="text-primary font-semibold">{deliveryLabel[o.deliveryStatus]}</span>
          </span>
          {o.deliveryDate && (
            <span className="text-[9px] text-muted-foreground ml-auto">
              {new Date(o.deliveryDate).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const ClientOrders = () => {
  const navigate = useNavigate();
  const { orders } = useAtelier();
  const { hasReviewedOrder } = useReviews();
  const [activeTab, setActiveTab] = useState("Active");

  const filtered = orders.filter((o) => {
    if (activeTab === "Active") return o.status === "active" || o.status === "requested";
    if (activeTab === "Completed") return o.status === "completed";
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <h1 className="text-xl font-bold text-foreground">My Orders</h1>
      </div>

      {/* Animated Tab Bar */}
      <div className="px-5 mb-5">
        <div className="flex gap-1 glass-card p-1.5 relative">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 text-xs font-semibold rounded-xl relative z-10 transition-colors"
              style={{ color: activeTab === tab ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))" }}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 bg-primary rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Received banner: prompt review for the most recent received-but-unreviewed order */}
      {(() => {
        const pending = orders.find(o => o.deliveryStatus === "received" && o.designerId && !hasReviewedOrder(o.id));
        if (!pending) return null;
        return (
          <motion.button
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/review/${pending.id}`)}
            className="mx-5 mb-4 w-[calc(100%-2.5rem)] rounded-2xl bg-primary/10 border border-primary/30 p-4 flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground">How was your {pending.type}?</p>
              <p className="text-[10px] text-muted-foreground">Leave a review to help other clients.</p>
            </div>
            <Star className="w-4 h-4 text-primary fill-primary" />
          </motion.button>
        );
      })()}

      <div className="px-5 space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease }}
              className="glass-card overflow-hidden"
            >
              <div className="flex">
                <div className="relative w-24 h-full flex-shrink-0">
                  <img src={o.img} alt={o.type} className="w-24 h-full min-h-[120px] object-cover" />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">{o.type}</p>
                      <p className="text-[11px] text-muted-foreground">{o.client} · {o.category}</p>
                    </div>
                    <span className="text-xs font-bold text-primary">{money(o.price, o.currency)}</span>
                  </div>

                  <OrderTimeline o={o} />

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground">Due: {o.dueDate}</span>
                    {(o.deliveryStatus === "received" || o.status === "completed") && o.designerId && (
                      hasReviewedOrder(o.id) ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-status-completed">
                          <CheckCircle2 className="w-3 h-3" /> Reviewed
                        </span>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); navigate(`/review/${o.id}`); }}
                          className="flex items-center gap-1 text-[10px] font-semibold text-primary"
                        >
                          <Star className="w-3 h-3 fill-primary" /> Rate
                        </motion.button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">No orders yet</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">Discover talented designers to get started</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/discover")}
              className="text-xs font-semibold text-primary-foreground bg-primary px-5 py-2.5 rounded-full"
            >
              Discover Designers
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ClientOrders;
