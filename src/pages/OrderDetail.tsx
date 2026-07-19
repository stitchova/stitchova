import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, User, Scissors, ChevronRight, Plus, CheckCircle2, Clock, AlertTriangle, UserPlus, Package, FileText, Receipt, Send, Sparkles, PackageCheck, Truck, MapPin, ChevronDown, ChevronUp, Image as ImageIcon, Flame, Flag } from "lucide-react";
import { useBrandInvoice, money, computeTotals } from "@/contexts/BrandInvoiceContext";
import { useNotifications, STAGE_TRIGGER_KEYS, NotifTriggerKey } from "@/contexts/NotificationsContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAtelier, PAYMENT_METHODS, DeliveryStatus, costFromFabricUse, costFromMaterialUse, TaskStatus } from "@/contexts/AtelierContext";
import StageTracker from "@/components/StageTracker";
import { useReviews } from "@/contexts/ReviewsContext";
import { AVAILABLE_WORKERS, WorkerRef } from "@/lib/workers";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

const statusCfg: Record<TaskStatus, { label: string; color: string; icon: typeof Clock }> = {
  not_started: { label: "Not Started", color: "text-muted-foreground", icon: Clock },
  in_progress: { label: "In Progress", color: "text-primary", icon: AlertTriangle },
  completed: { label: "Completed", color: "text-status-completed", icon: CheckCircle2 },
};

const OrderDetail = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const { orderById, orders, advanceStage, setStage, undoLastStage, addPayment, updateOrder, setDeliveryStatus, clientById, fabrics, materials,
    tasksByOrder, addTask, updateTask, deleteTask, measurementsByClient } = useAtelier();
  // clientId param may be an order id (new format) or legacy demo clientId
  const order =
    orderById(clientId || "") ||
    orders.find((o) => o.clientId === clientId) ||
    orders[0];
  const [received, setReceived] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState(PAYMENT_METHODS[0]);
  const [showCosts, setShowCosts] = useState(false);

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Order not found</p>
      </div>
    );
  }

  const productionStages = order.stages;
  const currentStage = order.currentStage;
  const paidTotal = order.payments.reduce((s, p) => s + p.amount, 0);
  const balance = Math.max(0, order.price - paidTotal);
  const clientRec = clientById(order.clientId);
  const preferredChannel = clientRec?.preferredChannel;

  // Cost breakdown — prefer designer-entered override, else derive from linked inventory pricing.
  const inventoryFabricCost = costFromFabricUse(order.fabricUse, fabrics);
  const inventoryMaterialsCost = costFromMaterialUse(order.materialUse, materials);
  const costs = order.costs || {};
  const fabricCost = costs.fabric ?? Math.round(inventoryFabricCost);
  const materialsCost = costs.materials ?? Math.round(inventoryMaterialsCost);
  const laborCost = costs.labor ?? (order.price - fabricCost - materialsCost > 0 ? order.price - fabricCost - materialsCost : 0);

  const deliveryStages: { key: DeliveryStatus; label: string }[] =
    order.deliveryMethod === "delivery"
      ? [
          { key: "pending", label: "Preparing" },
          { key: "ready", label: "Ready" },
          { key: "out_for_delivery", label: "Out for Delivery" },
          { key: "received", label: "Received" },
        ]
      : [
          { key: "pending", label: "Preparing" },
          { key: "ready", label: "Ready for Pickup" },
          { key: "received", label: "Received" },
        ];
  const deliveryIdx = Math.max(0, deliveryStages.findIndex(s => s.key === (order.deliveryStatus || "pending")));
  const paymentPlan = paidTotal >= order.price ? "Paid in Full" : paidTotal === 0 ? "Unpaid" : "Installment";
  const statusColor = order.status === "completed" ? "bg-status-completed"
    : order.status === "requested" ? "bg-primary/60"
    : order.status === "declined" ? "bg-destructive/70"
    : "bg-primary";
  const description = order.styleDesc;

  const { getByOrder, brand } = useBrandInvoice();
  const orderInvoices = getByOrder(order.id);
  const { send } = useNotifications();
  const { plan, isFeatureAvailable } = useSubscription();
  const commsUnlocked = isFeatureAvailable("auto_notifications");
  const { byOrder: reviewByOrder } = useReviews();
  const orderReview = reviewByOrder(order.id);

  const orderTasks = tasksByOrder(order.id);

  // Photo gating for the final stage transition — reuse the task photo grid
  // when a worker is on the order; otherwise (designer solo) prompt for a
  // completion photo via an inline file input.
  const finalPhotoRef = useRef<HTMLInputElement>(null);
  const [pendingFinalIdx, setPendingFinalIdx] = useState<number | null>(null);

  const hasFinishedPhoto = () =>
    orderTasks.some(t => t.images.length > 0) ||
    (order.stageHistory || []).some(h => !!h.photoUrl);

  const [showAssign, setShowAssign] = useState(false);
  const [assigningTaskId, setAssigningTaskId] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskStageIdx, setNewTaskStageIdx] = useState<number | "">("");
  const [newTaskPriority, setNewTaskPriority] = useState<"normal" | "urgent">("normal");
  const [newTaskWorker, setNewTaskWorker] = useState<WorkerRef | null>(null);

  const assignWorker = (taskId: string, worker: WorkerRef) => {
    updateTask(taskId, { workerId: worker.id, workerName: worker.name, workerAvatar: worker.avatar });
    setShowAssign(false); setAssigningTaskId(null);
    toast.success(`Assigned to ${worker.name}`);
  };

  const submitNewTask = () => {
    if (!newTaskTitle.trim()) return;
    const w = newTaskWorker || AVAILABLE_WORKERS[0];
    addTask({
      orderId: order.id,
      workerId: w.id, workerName: w.name, workerAvatar: w.avatar,
      title: newTaskTitle.trim(),
      deadline: newTaskDeadline || "TBD",
      stageIdx: newTaskStageIdx === "" ? undefined : Number(newTaskStageIdx),
      priority: newTaskPriority,
    });
    setNewTaskTitle(""); setNewTaskDeadline(""); setNewTaskStageIdx(""); setNewTaskPriority("normal"); setNewTaskWorker(null);
    setShowAddTask(false);
    toast.success(`Task assigned to ${w.name}`);
  };

  const completedCount = orderTasks.filter(t => t.status === "completed").length;
  const progress = orderTasks.length === 0 ? 0 : Math.round((completedCount / orderTasks.length) * 100);

  const runStageNotifications = (stageIdx: number) => {
    const isComplete = stageIdx === productionStages.length - 1;
    // Map by stage name so custom stages (Fitting etc.) still notify sensibly
    const stageName = productionStages[stageIdx];
    const stageKeyMap: Record<string, NotifTriggerKey> = {
      "Cutting": "stage_cutting",
      "Sewing": "stage_sewing",
      "Beading": "stage_beading",
      "Finishing": "stage_finishing",
      "Quality Check": "stage_quality",
      "Fitting": "custom",
    };
    const key: NotifTriggerKey = isComplete ? "completed" : (stageKeyMap[stageName] || "custom");
    if (!commsUnlocked) {
      toast("Stage updated. Upgrade to Pro to auto-notify clients.");
      return;
    }
    // Default to the client's preferred channel (sms, whatsapp, or email).
    const preferChannels = preferredChannel
      ? preferredChannel === "email"
        ? (["email"] as const)
        : preferredChannel === "whatsapp"
          ? (["whatsapp"] as const)
          : (["sms"] as const)
      : undefined;
    const recs = send({
      key,
      clientName: order.client,
      clientContact: order.client.split(" ")[0].toLowerCase() + "@client.local",
      brandName: brand.businessName,
      channels: preferChannels as any,
      tokens: {
        garment: order.garment.toLowerCase(),
        stage: productionStages[stageIdx],
        balance: money(balance, brand.currency),
      },
      orderRef: order.id,
    });
    if (recs.length) toast.success(`Notified ${order.client} via ${recs.map(r => r.channel).join(" + ")} as ${brand.businessName}`);
  };

  const applyStageChange = (stageIdx: number, photoUrl?: string) => {
    setStage(order.id, stageIdx, { photoUrl });
    runStageNotifications(stageIdx);
    const stageName = productionStages[stageIdx];
    toast.success(`Advanced to ${stageName}`, {
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          undoLastStage(order.id);
          toast("Stage change reverted");
        },
      },
    });
  };

  const handleStageTap = (stageIdx: number) => {
    if (stageIdx < 0 || stageIdx >= productionStages.length) return;
    if (stageIdx === order.currentStage) return;
    const isFinal = stageIdx === productionStages.length - 1;
    if (isFinal && !hasFinishedPhoto()) {
      setPendingFinalIdx(stageIdx);
      finalPhotoRef.current?.click();
      toast("Attach a finished-work photo to complete the final stage.");
      return;
    }
    const latestPhoto = isFinal
      ? (orderTasks.flatMap(t => t.images).slice(-1)[0])
      : undefined;
    applyStageChange(stageIdx, latestPhoto);
  };

  const onFinalPhotoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || pendingFinalIdx == null) { e.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      applyStageChange(pendingFinalIdx, url);
      setPendingFinalIdx(null);
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  const markReceived = () => {
    setReceived(true);
    setDeliveryStatus(order.id, "received");
    if (!commsUnlocked) {
      toast("Marked as received. Upgrade to Pro to send thank-you automatically.");
      return;
    }
    const recs = send({
      key: "received",
      clientName: order.client,
      clientContact: order.client.split(" ")[0].toLowerCase() + "@client.local",
      brandName: brand.businessName,
      tokens: { garment: order.garment.toLowerCase() },
      orderRef: order.id,
    });
    if (recs.length) toast.success(`Thank-you sent as ${brand.businessName}`);
  };

  const submitPayment = () => {
    const amount = parseFloat(payAmount.replace(/,/g, "")) || 0;
    if (amount <= 0) return;
    addPayment(order.id, { amount, method: payMethod, date: new Date().toISOString().split("T")[0] });
    setPayAmount(""); setShowPay(false);
    toast.success(`Payment of ${money(amount, brand.currency)} recorded.`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="relative h-56">
        <img src={order.img} alt={order.type} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-12 left-5 w-9 h-9 rounded-full bg-card/80 backdrop-blur border border-border flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="absolute bottom-4 left-5 right-5">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${statusColor} text-primary-foreground`}>{order.status}</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{order.category}</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{order.garment}</span>
          </div>
          <h1 className="text-xl font-bold text-foreground mt-2">{order.type}</h1>
          <p className="text-xs text-muted-foreground">{order.client}</p>
        </div>
      </div>

      <div className="px-5 space-y-5 pt-4">
        {/* Order Info */}
        <motion.div {...fadeUp} className="card-surface p-4 space-y-3">
          {orderReview && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/10 border border-primary/20">
              <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-foreground">
                  Client left a review · ★ {orderReview.rating.toFixed(1)}
                </p>
                {orderReview.text && (
                  <p className="text-[10px] text-muted-foreground truncate">"{orderReview.text}"</p>
                )}
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">{description}</p>
          <div className="card-glass p-3 rounded-xl">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Style Description</p>
            <p className="text-xs text-foreground">{order.styleDesc}</p>
          </div>
          {order.photos && order.photos.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> Reference Photos
              </p>
              <div className="flex gap-2 overflow-x-auto">
                {order.photos.map((p, i) => (
                  <img key={i} src={p} alt={`ref-${i}`} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-4">
            <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs text-foreground">Due: {order.dueDate}</span></div>
            <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs text-foreground">{order.client}</span></div>
          </div>
          {(order.fabricUse.length > 0 || order.materialUse.length > 0) && (
            <div className="flex items-start gap-2">
              <Scissors className="w-3.5 h-3.5 text-muted-foreground mt-1" />
              <div className="flex flex-wrap gap-1">
                {order.fabricUse.map(f => (
                  <span key={f.id} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-foreground">
                    {f.name} · {f.amount} {f.unit}
                  </span>
                ))}
                {order.materialUse.map(m => (
                  <span key={m.id} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-foreground">
                    {m.name} · {m.amount} {m.unit}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Payment Info */}
        <motion.div {...fadeUp} transition={{ delay: 0.03 }} className="card-surface p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground">Payment</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{paymentPlan}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center"><p className="text-xs text-muted-foreground">Total</p><p className="text-sm font-bold text-foreground">{money(order.price, brand.currency)}</p></div>
            <div className="text-center"><p className="text-xs text-muted-foreground">Paid</p><p className="text-sm font-bold text-status-completed">{money(paidTotal, brand.currency)}</p></div>
            <div className="text-center"><p className="text-xs text-muted-foreground">Balance</p><p className="text-sm font-bold text-primary">{money(balance, brand.currency)}</p></div>
          </div>
          {balance > 0 && (
            <button onClick={() => setShowPay(true)}
              className="mt-3 w-full py-2 rounded-xl bg-primary/10 text-primary text-[11px] font-bold">
              + Record Payment
            </button>
          )}
          {order.payments.length > 0 && (
            <div className="mt-3 space-y-1">
              {order.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{p.date} · {p.method}</span>
                  <span className="text-foreground font-semibold">{money(p.amount, brand.currency)}</span>
                </div>
              ))}
            </div>
          )}
          {/* Cost breakdown (designer-only, expandable) */}
          <button onClick={() => setShowCosts(s => !s)}
            className="mt-3 w-full flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/40 pt-2">
            <span>Cost breakdown (margin)</span>
            {showCosts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <AnimatePresence>
            {showCosts && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="pt-2 space-y-2">
                  {(["fabric", "materials", "labor"] as const).map((k) => {
                    const suggested = k === "fabric" ? Math.round(inventoryFabricCost)
                      : k === "materials" ? Math.round(inventoryMaterialsCost)
                      : 0;
                    return (
                      <div key={k} className="flex items-center justify-between gap-2">
                        <label className="text-[10px] text-muted-foreground uppercase capitalize flex-1">
                          {k} cost
                          {order.costs?.[k] == null && suggested > 0 && (
                            <span className="ml-1 text-[9px] text-primary/80 normal-case">· auto</span>
                          )}
                        </label>
                        <input key={`${k}-${suggested}`} type="number" inputMode="decimal"
                          defaultValue={String(order.costs?.[k] ?? (suggested || ""))}
                          onBlur={(e) => updateOrder(order.id, { costs: { ...(order.costs || {}), [k]: parseFloat(e.target.value) || 0 } })}
                          placeholder="0"
                          className="w-24 bg-secondary/50 border border-border rounded-lg px-2 py-1 text-[11px] text-foreground text-right outline-none" />
                      </div>
                    );
                  })}
                  {(() => {
                    const f = order.costs?.fabric ?? Math.round(inventoryFabricCost);
                    const m = order.costs?.materials ?? Math.round(inventoryMaterialsCost);
                    const l = order.costs?.labor ?? 0;
                    const total = f + m + l;
                    const margin = order.price - total;
                    return (
                      <div className="flex items-center justify-between pt-2 border-t border-border/40">
                        <span className="text-[10px] text-muted-foreground">Est. Margin</span>
                        <span className={`text-xs font-bold ${margin >= 0 ? "text-status-completed" : "text-destructive"}`}>
                          {money(margin, brand.currency)}
                        </span>
                      </div>
                    );
                  })()}
                  <p className="text-[9px] text-muted-foreground italic">Visible only to you — not shown to clients.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Delivery */}
        <motion.div {...fadeUp} transition={{ delay: 0.035 }} className="card-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              {order.deliveryMethod === "delivery" ? <Truck className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
              {order.deliveryMethod === "delivery" ? "Delivery" : "Pickup"}
            </span>
            <div className="flex gap-1">
              {(["pickup", "delivery"] as const).map(m => (
                <button key={m} onClick={() => updateOrder(order.id, { deliveryMethod: m })}
                  className={cn("px-2 py-0.5 rounded-md text-[9px] font-bold uppercase",
                    (order.deliveryMethod || "pickup") === m ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          {order.deliveryMethod === "delivery" && (
            <div className="mb-3 space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] text-foreground">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <input value={order.deliveryAddress || clientRec?.address || ""}
                  onChange={(e) => updateOrder(order.id, { deliveryAddress: e.target.value })}
                  placeholder="Delivery address"
                  className="flex-1 bg-secondary/40 rounded-md px-2 py-1 outline-none text-[11px]" />
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 text-[11px] text-foreground mb-3">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <input type="datetime-local"
              value={order.deliveryDate || ""}
              onChange={(e) => updateOrder(order.id, { deliveryDate: e.target.value })}
              className="flex-1 bg-secondary/40 rounded-md px-2 py-1 outline-none text-[11px]" />
          </div>
          <div className="flex items-center justify-between">
            {deliveryStages.map((s, i) => (
              <button key={s.key} onClick={() => setDeliveryStatus(order.id, s.key)}
                className="flex flex-col items-center flex-1 focus:outline-none">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border-2 transition-all",
                  i <= deliveryIdx ? "bg-primary border-primary text-primary-foreground" : "bg-secondary border-border text-muted-foreground")}>
                  {i < deliveryIdx ? "✓" : i + 1}
                </div>
                <span className={cn("text-[8px] mt-1 text-center leading-tight", i <= deliveryIdx ? "text-primary" : "text-muted-foreground")}>{s.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground mt-2 text-center">Tap a stage to update delivery status.</p>
        </motion.div>

        {/* Billing */}
        <motion.div {...fadeUp} transition={{ delay: 0.04 }} className="card-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-foreground">Billing Documents</span>
            <button onClick={() => navigate("/settings/brand")} className="text-[10px] text-muted-foreground underline">Brand settings</button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/order/${clientId}/invoice/new?type=invoice`)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/25">
              <FileText className="w-3.5 h-3.5" /> Create Invoice
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/order/${clientId}/invoice/new?type=receipt`)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary text-foreground text-xs font-bold border border-primary/30">
              <Receipt className="w-3.5 h-3.5" /> Issue Receipt
            </motion.button>
          </div>
          {orderInvoices.length > 0 && (
            <div className="space-y-1.5">
              {orderInvoices.slice(0, 3).map((inv) => {
                const t = computeTotals(inv);
                return (
                  <button key={inv.id} onClick={() => navigate(`/invoice/${inv.id}`)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {inv.type === "receipt" ? <Receipt className="w-4 h-4 text-primary" /> : <FileText className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[11px] font-semibold text-foreground font-mono">#{inv.number}</p>
                      <p className="text-[9px] text-muted-foreground uppercase">{inv.type} · {inv.status}</p>
                    </div>
                    <span className="text-xs font-bold text-foreground font-mono">{money(t.total, brand.currency)}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Production Stages */}
        <motion.div {...fadeUp} transition={{ delay: 0.05 }} className="card-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-foreground">Production Stages</span>
            {commsUnlocked ? (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Auto-notify ON
              </span>
            ) : (
              <button onClick={() => navigate("/subscription")} className="text-[9px] font-semibold text-primary underline">
                Enable auto-notify
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="w-full">
              <StageTracker
                stages={productionStages}
                currentIdx={order.currentStage}
                onSelect={handleStageTap}
              />
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground mt-3 text-center">Tap a stage to advance & auto-notify the client as <span className="text-primary font-semibold">{brand.businessName}</span>.</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button onClick={() => handleStageTap(productionStages.length - 1)}
              className="py-2.5 rounded-xl bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> Mark Completed
            </button>
            <button onClick={markReceived} disabled={received}
              className={`py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 ${received ? "bg-status-completed/20 text-status-completed" : "bg-secondary text-foreground border border-primary/30"}`}>
              <PackageCheck className="w-3.5 h-3.5" /> {received ? "Received ✓" : "Mark Received"}
            </button>
          </div>
          <input ref={finalPhotoRef} type="file" accept="image/*" capture="environment"
            className="hidden" onChange={onFinalPhotoPick} />
        </motion.div>

        {/* Task Progress */}
        <motion.div {...fadeUp} transition={{ delay: 0.07 }} className="card-surface p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground">Task Progress</span>
            <span className="text-xs font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }} className="h-full bg-primary rounded-full" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">{completedCount} of {orderTasks.length} tasks completed</p>
        </motion.div>

        {/* Tasks */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Tasks & Assignments</h2>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowAddTask(true)}
              className="flex items-center gap-1 text-xs text-primary font-medium">
              <Plus className="w-3.5 h-3.5" /> Add Task
            </motion.button>
          </div>
          <div className="space-y-2">
            {orderTasks.length === 0 && (
              <p className="text-[11px] text-muted-foreground text-center py-4">No tasks yet. Add one to assign work to your team.</p>
            )}
            {orderTasks.map((task, i) => {
              const sc = statusCfg[task.status];
              const isUrgent = task.priority === "urgent";
              const stageLabel = typeof task.stageIdx === "number" ? productionStages[task.stageIdx] : null;
              return (
                <motion.div key={task.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }} className="card-surface p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-semibold text-foreground">{task.title}</p>
                        {isUrgent && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[9px] font-bold">
                            <Flame className="w-2.5 h-2.5" /> URGENT
                          </span>
                        )}
                        {task.flaggedAt && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[9px] font-bold">
                            <Flag className="w-2.5 h-2.5" /> FLAGGED
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Due: {task.deadline}{stageLabel ? ` · Stage: ${stageLabel}` : ""}
                      </p>
                      {task.flagReason && (
                        <p className="text-[10px] text-amber-400 mt-1">⚠ {task.flagReason}</p>
                      )}
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${task.status === "completed" ? "bg-status-completed/10" : task.status === "in_progress" ? "bg-primary/10" : "bg-secondary"}`}>
                      <sc.icon className={`w-3 h-3 ${sc.color}`} />
                      <span className={`text-[9px] font-medium ${sc.color}`}>{sc.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    {task.workerName ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                          <span className="text-[9px] font-bold text-foreground">{task.workerAvatar}</span>
                        </div>
                        <span className="text-[10px] text-foreground font-medium">{task.workerName}</span>
                      </div>
                    ) : (
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => { setAssigningTaskId(task.id); setShowAssign(true); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                        <UserPlus className="w-4 h-4" /><span className="text-xs font-bold">Assign Worker</span>
                      </motion.button>
                    )}
                    {task.workerName && (
                      <div className="flex gap-2">
                        <button onClick={() => { setAssigningTaskId(task.id); setShowAssign(true); }}
                          className="text-[10px] text-muted-foreground">Reassign</button>
                        <button onClick={() => { deleteTask(task.id); toast("Task removed"); }}
                          className="text-[10px] text-destructive">Remove</button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Worker Activity Timeline */}
        <motion.div {...fadeUp} transition={{ delay: 0.13 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Worker Activity</h2>
            <span className="text-[10px] text-muted-foreground">Live</span>
          </div>
          {(() => {
            type Ev = { id: string; kind: "stage" | "photo" | "measurement"; title: string; sub: string; time: number; who?: string; avatar?: string; image?: string };
            const events: Ev[] = [];
            for (const t of orderTasks) {
              const created = new Date(t.createdAt).getTime() || Date.now();
              if (t.status === "completed") {
                const stageLabel = typeof t.stageIdx === "number" ? productionStages[t.stageIdx] : null;
                events.push({
                  id: `s-${t.id}`, kind: "stage",
                  title: stageLabel ? `Completed stage: ${stageLabel}` : `Completed: ${t.title}`,
                  sub: t.title, time: created, who: t.workerName, avatar: t.workerAvatar,
                });
              }
              t.images.forEach((img, idx) => events.push({
                id: `p-${t.id}-${idx}`, kind: "photo",
                title: "Finished-work photo uploaded", sub: t.title,
                time: created + idx, who: t.workerName, avatar: t.workerAvatar, image: img,
              }));
            }
            for (const m of measurementsByClient(order.clientId)) {
              const t = new Date(m.createdAt).getTime() || Date.now();
              events.push({
                id: `m-${m.id}`, kind: "measurement",
                title: `Measurement submitted: ${m.garment}`,
                sub: `${Object.keys(m.fields).length} fields recorded${m.unit ? ` (${m.unit})` : ""}`,
                time: t,
              });
            }
            events.sort((a, b) => b.time - a.time);
            if (events.length === 0) {
              return (
                <div className="card-surface p-4">
                  <p className="text-[11px] text-muted-foreground text-center">No worker activity yet. Completed stages, photo uploads, and measurement submissions will appear here.</p>
                </div>
              );
            }
            const iconFor = (k: Ev["kind"]) =>
              k === "stage" ? { Icon: CheckCircle2, color: "text-status-completed", bg: "bg-status-completed/10" }
              : k === "photo" ? { Icon: ImageIcon, color: "text-primary", bg: "bg-primary/10" }
              : { Icon: User, color: "text-amber-400", bg: "bg-amber-400/10" };
            const rel = (t: number) => {
              const diff = Date.now() - t;
              const m = Math.floor(diff / 60000);
              if (m < 1) return "just now";
              if (m < 60) return `${m}m ago`;
              const h = Math.floor(m / 60);
              if (h < 24) return `${h}h ago`;
              const d = Math.floor(h / 24);
              return `${d}d ago`;
            };
            return (
              <div className="card-surface divide-y divide-border">
                {events.slice(0, 12).map((e) => {
                  const { Icon, color, bg } = iconFor(e.kind);
                  return (
                    <div key={e.id} className="flex items-start gap-3 p-3">
                      <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{e.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{e.sub}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {e.who && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <span className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center text-[8px] font-bold text-foreground">{e.avatar}</span>
                              {e.who}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground">· {rel(e.time)}</span>
                        </div>
                      </div>
                      {e.image && (
                        <img src={e.image} alt="upload" className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-border" />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </motion.div>
      </div>

      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent className="max-w-sm mx-auto bg-card border-border">
          <DialogHeader><DialogTitle className="text-foreground">Assign Worker</DialogTitle></DialogHeader>
          <div className="space-y-2 mt-2">
            {AVAILABLE_WORKERS.map(w => (
              <motion.button key={w.id} whileTap={{ scale: 0.97 }}
                onClick={() => assigningTaskId && assignWorker(assigningTaskId, w)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-xs font-bold text-foreground">{w.avatar}</span>
                </div>
                <div className="text-left"><p className="text-sm font-semibold text-foreground">{w.name}</p><p className="text-[10px] text-muted-foreground">{w.role}</p></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
              </motion.button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent className="max-w-sm mx-auto bg-card border-border">
          <DialogHeader><DialogTitle className="text-foreground">Add New Task</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Task Title</label>
              <input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="e.g. Attach lace overlay"
                className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Deadline</label>
              <input value={newTaskDeadline} onChange={e => setNewTaskDeadline(e.target.value)} placeholder="e.g. Apr 10"
                className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Assign to</label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_WORKERS.map((w) => (
                  <button key={w.id} onClick={() => setNewTaskWorker(w)}
                    className={cn("px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-colors",
                      (newTaskWorker?.id || AVAILABLE_WORKERS[0].id) === w.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground")}>
                    {w.avatar} · {w.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Link to production stage (optional)</label>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setNewTaskStageIdx("")}
                  className={cn("px-2.5 py-1 rounded-lg text-[10px] font-medium border",
                    newTaskStageIdx === "" ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground")}>
                  None
                </button>
                {productionStages.map((s, i) => (
                  <button key={s} onClick={() => setNewTaskStageIdx(i)}
                    className={cn("px-2.5 py-1 rounded-lg text-[10px] font-medium border",
                      newTaskStageIdx === i ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground")}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
              <div className="flex gap-2">
                {(["normal", "urgent"] as const).map((p) => (
                  <button key={p} onClick={() => setNewTaskPriority(p)}
                    className={cn("flex-1 py-2 rounded-lg text-[11px] font-bold border capitalize",
                      newTaskPriority === p
                        ? p === "urgent" ? "border-red-500 bg-red-500/10 text-red-400" : "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground")}>
                    {p === "urgent" ? "🔥 Urgent" : "Normal"}
                  </button>
                ))}
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={submitNewTask}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold">Add Task</motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetail;
