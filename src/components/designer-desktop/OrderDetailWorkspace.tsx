import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Truck, MapPin, Wallet, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useAtelier, money, materialsProgress, Order, PAYMENT_METHODS, DeliveryStatus,
} from "@/contexts/AtelierContext";
import StageTracker from "@/components/StageTracker";
import OrderMaterials from "@/components/OrderMaterials";
import { useBrandInvoice } from "@/contexts/BrandInvoiceContext";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

/**
 * Tablet/desktop Order Detail workspace. This screen previously had NO
 * desktop treatment at all — it fell back to the mobile layout at every
 * width. Deliberately built with solid, high-contrast panels (not the
 * translucent "frost-card" look used elsewhere) to match the reference
 * structure: a real hero image, a readable stage timeline, and working
 * dropdowns for delivery status and payment method.
 *
 * Mobile view (src/pages/OrderDetail.tsx) is untouched — this component
 * renders only from `lg` upward.
 */

const deliveryStatusLabel: Record<DeliveryStatus, string> = {
  pending: "Pending",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  received: "Received",
};

interface Props {
  order: Order;
}

const OrderDetailWorkspace = ({ order }: Props) => {
  const navigate = useNavigate();
  const { setStage, addPayment, setDeliveryStatus, clientById } = useAtelier();
  const { brand } = useBrandInvoice();

  const [showAddPayment, setShowAddPayment] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState(PAYMENT_METHODS[0]);

  const client = clientById(order.clientId);
  const paid = order.payments.reduce((s, p) => s + p.amount, 0);
  const balance = Math.max(0, order.price - paid);
  const mp = materialsProgress(order.materialsList);

  const handleAddPayment = () => {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    addPayment(order.id, { amount, method: payMethod, date: new Date().toISOString() } as never);
    toast.success("Payment recorded");
    setPayAmount("");
    setShowAddPayment(false);
  };

  const fadeUp = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="hidden lg:block">
      {/* Hero banner — real image, not a thumbnail */}
      <div className="relative h-72 -mx-8 -mt-6">
        <img src={order.img} alt={order.type} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-8 w-10 h-10 rounded-full bg-background/90 border border-border flex items-center justify-center hover:bg-background transition-colors"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
        </button>

        <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-primary text-primary-foreground">
                {order.awaitingMaterials ? "Awaiting Materials" : order.stages[order.currentStage] || order.status}
              </span>
              {order.status === "requested" && (
                <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-secondary text-foreground">
                  New request
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-foreground mt-3">{order.type}</h1>
            <p className="text-sm text-muted-foreground mt-1">{order.garment} · {order.category}</p>
          </div>
          <div className="text-right bg-card border border-border rounded-2xl px-5 py-4">
            <p className="text-[11px] text-muted-foreground">Client</p>
            <p className="text-base font-semibold text-foreground mt-0.5">{order.client}</p>
            {client?.phone && <p className="text-xs text-muted-foreground mt-0.5">{client.phone}</p>}
          </div>
        </div>
      </div>

      <div className="px-8 pb-16 pt-8 grid grid-cols-[1fr_360px] gap-6 items-start">
        {/* Main column */}
        <div className="space-y-6">
          {/* Stage tracker */}
          <motion.div {...fadeUp} transition={{ duration: 0.3 }}
            className="rounded-2xl bg-card border border-border p-6">
            <p className="text-sm font-semibold text-foreground mb-5">Production stages</p>
            <StageTracker
              stages={order.stages}
              currentIdx={order.currentStage}
              onSelect={(idx) => { setStage(order.id, idx); toast.success(`Moved to ${order.stages[idx]}`); }}
              disabled={order.awaitingMaterials}
              size="md"
            />
            {order.awaitingMaterials && (
              <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Production is locked until the materials required to start are received below.
              </p>
            )}
          </motion.div>

          {/* Key info grid */}
          <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.05 }}
            className="grid grid-cols-4 gap-3">
            {[
              { label: "Due date", value: order.dueDate, icon: CalendarDays },
              { label: "Delivery", value: order.deliveryMethod === "delivery" ? "Delivery" : "Pickup", icon: Truck },
              { label: "Materials", value: mp.total > 0 ? `${mp.received}/${mp.total} received` : "None added", icon: Sparkles },
              { label: "Order value", value: money(order.price, order.currency), icon: Wallet },
            ].map((b) => (
              <div key={b.label} className="rounded-2xl bg-card border border-border p-4">
                <b.icon className="w-4 h-4 text-primary mb-2" />
                <p className="text-[11px] text-muted-foreground">{b.label}</p>
                <p className="text-sm font-semibold text-foreground mt-1 leading-snug">{b.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Materials checklist — reuses the existing, already-working logic */}
          <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-2xl bg-card border border-border p-6">
            <p className="text-sm font-semibold text-foreground mb-4">Materials checklist</p>
            <OrderMaterials orderId={order.id} actorName={brand.businessName || "Designer"} actorRole="designer" />
          </motion.div>

          {/* Delivery */}
          <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.15 }}
            className="rounded-2xl bg-card border border-border p-6">
            <p className="text-sm font-semibold text-foreground mb-4">Delivery</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-1">
                <MapPin className="w-4 h-4" />
                {order.deliveryAddress || "No delivery address on file"}
              </div>
              <Select
                value={order.deliveryStatus || "pending"}
                onValueChange={(v) => setDeliveryStatus(order.id, v as DeliveryStatus)}
              >
                <SelectTrigger className="w-48 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {(Object.keys(deliveryStatusLabel) as DeliveryStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{deliveryStatusLabel[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        </div>

        {/* Side column — payments */}
        <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-2xl bg-card border border-border p-6 space-y-5 sticky top-24">
          <p className="text-sm font-semibold text-foreground">Payments</p>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order total</span>
              <span className="font-semibold text-foreground">{money(order.price, order.currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Paid</span>
              <span className="font-semibold text-foreground">{money(paid, order.currency)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Balance due</span>
              <span className="font-bold text-primary">{money(balance, order.currency)}</span>
            </div>
          </div>

          {order.payments.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-[11px] text-muted-foreground">History</p>
              {order.payments.map((p, i) => (
                <div key={i} className="flex justify-between text-xs bg-secondary/50 rounded-lg px-3 py-2">
                  <span className="text-muted-foreground">{p.method} · {new Date(p.date).toLocaleDateString()}</span>
                  <span className="font-semibold text-foreground">{money(p.amount, order.currency)}</span>
                </div>
              ))}
            </div>
          )}

          {!showAddPayment ? (
            <button
              onClick={() => setShowAddPayment(true)}
              disabled={balance <= 0}
              className={cn(
                "w-full rounded-xl text-sm font-semibold py-3 flex items-center justify-center gap-2 transition-colors",
                balance <= 0
                  ? "bg-secondary text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              )}
            >
              <Plus className="w-4 h-4" /> {balance <= 0 ? "Fully paid" : "Record payment"}
            </button>
          ) : (
            <div className="space-y-3 pt-1">
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder={`Up to ${money(balance, order.currency)}`}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
              <Select value={payMethod} onValueChange={setPayMethod}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <button onClick={handleAddPayment}
                  className="flex-1 rounded-xl bg-primary text-primary-foreground text-sm font-semibold py-2.5">
                  Save payment
                </button>
                <button onClick={() => setShowAddPayment(false)}
                  className="rounded-xl bg-secondary text-foreground text-sm font-semibold px-4 py-2.5">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetailWorkspace;
