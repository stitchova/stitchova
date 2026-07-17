import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, User, Scissors, ChevronRight, Plus, CheckCircle2, Clock, AlertTriangle, UserPlus, Package, FileText, Receipt, Send, Sparkles, PackageCheck, Truck, MapPin, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import { useBrandInvoice, money, computeTotals } from "@/contexts/BrandInvoiceContext";
import { useNotifications, STAGE_TRIGGER_KEYS, NotifTriggerKey } from "@/contexts/NotificationsContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAtelier, PAYMENT_METHODS, DeliveryStatus } from "@/contexts/AtelierContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

const availableWorkers = [
  { id: "w1", name: "Tunde A.", role: "Tailor", avatar: "TA" },
  { id: "w2", name: "Amina K.", role: "Cutter", avatar: "AK" },
  { id: "w3", name: "Kwesi B.", role: "Finisher", avatar: "KB" },
  { id: "w4", name: "Esi M.", role: "Beader", avatar: "EM" },
];

type TaskStatus = "not_started" | "in_progress" | "completed";

interface OrderTask {
  id: number; title: string; assignee: string | null; assigneeAvatar: string | null;
  status: TaskStatus; deadline: string;
}

const statusCfg: Record<TaskStatus, { label: string; color: string; icon: typeof Clock }> = {
  not_started: { label: "Not Started", color: "text-muted-foreground", icon: Clock },
  in_progress: { label: "In Progress", color: "text-primary", icon: AlertTriangle },
  completed: { label: "Completed", color: "text-status-completed", icon: CheckCircle2 },
};

const OrderDetail = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const { orderById, orders, advanceStage, addPayment, updateOrder, setDeliveryStatus, clientById } = useAtelier();
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

  // Cost breakdown auto-suggestion from linked inventory
  const inventoryFabricCost = order.fabricUse.reduce((s, f) => {
    // best-effort: use inventory fabric price
    return s + 0; // amounts stored, price lives on Fabric entity; keep 0 as fallback
  }, 0);
  const costs = order.costs || {};
  const fabricCost = costs.fabric ?? 0;
  const materialsCost = costs.materials ?? 0;
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
  const { plan } = useSubscription();
  const commsUnlocked = plan === "premium_plus";

  const [tasks, setTasks] = useState<OrderTask[]>([
    { id: 1, title: "Cut fabric pieces", assignee: "Amina K.", assigneeAvatar: "AK", status: "completed", deadline: "Mar 20" },
    { id: 2, title: "Sew bodice structure", assignee: "Tunde A.", assigneeAvatar: "TA", status: "in_progress", deadline: "Mar 23" },
    { id: 3, title: "Attach skirt panels", assignee: null, assigneeAvatar: null, status: "not_started", deadline: "Mar 25" },
    { id: 4, title: "Lace overlay & finishing", assignee: null, assigneeAvatar: null, status: "not_started", deadline: "Mar 27" },
  ]);

  const [showAssign, setShowAssign] = useState(false);
  const [assigningTaskId, setAssigningTaskId] = useState<number | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");

  const assignWorker = (taskId: number, worker: typeof availableWorkers[0]) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignee: worker.name, assigneeAvatar: worker.avatar } : t));
    setShowAssign(false); setAssigningTaskId(null);
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    setTasks(prev => [...prev, { id: Date.now(), title: newTaskTitle.trim(), assignee: null, assigneeAvatar: null, status: "not_started", deadline: newTaskDeadline || "TBD" }]);
    setNewTaskTitle(""); setNewTaskDeadline(""); setShowAddTask(false);
  };

  const completedCount = tasks.filter(t => t.status === "completed").length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  const notifyStage = (stageIdx: number) => {
    if (stageIdx < 0 || stageIdx >= productionStages.length) return;
    advanceStage(order.id, stageIdx);
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
      toast("Stage updated. Upgrade to Premium+ to auto-notify clients.");
      return;
    }
    // Default to the client's preferred channel (map whatsapp -> sms for our sms/email model)
    const preferChannels = preferredChannel
      ? preferredChannel === "email" ? (["email"] as const) : (["sms"] as const)
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

  const markReceived = () => {
    setReceived(true);
    setDeliveryStatus(order.id, "received");
    if (!commsUnlocked) {
      toast("Marked as received. Upgrade to Premium+ to send thank-you automatically.");
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
          <p className="text-xs text-muted-foreground">{description}</p>
          <div className="card-glass p-3 rounded-xl">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Style Description</p>
            <p className="text-xs text-foreground">{order.styleDesc}</p>
          </div>
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
            {productionStages.map((stage, i) => (
              <button key={stage} onClick={() => notifyStage(i)} className="flex flex-col items-center flex-1 focus:outline-none">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all",
                  i <= order.currentStage ? "bg-primary border-primary text-primary-foreground" : "bg-secondary border-border text-muted-foreground")}>
                  {i < order.currentStage ? "✓" : i + 1}
                </div>
                <span className={cn("text-[8px] mt-1 text-center leading-tight", i <= order.currentStage ? "text-primary" : "text-muted-foreground")}>{stage}</span>
                {i < productionStages.length - 1 && (
                  <div className={cn("absolute h-0.5 w-full", i < order.currentStage ? "bg-primary" : "bg-border")} style={{ display: "none" }} />
                )}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground mt-3 text-center">Tap a stage to advance & auto-notify the client as <span className="text-primary font-semibold">{brand.businessName}</span>.</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button onClick={() => notifyStage(productionStages.length - 1)}
              className="py-2.5 rounded-xl bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> Mark Completed
            </button>
            <button onClick={markReceived} disabled={received}
              className={`py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 ${received ? "bg-status-completed/20 text-status-completed" : "bg-secondary text-foreground border border-primary/30"}`}>
              <PackageCheck className="w-3.5 h-3.5" /> {received ? "Received ✓" : "Mark Received"}
            </button>
          </div>
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
          <p className="text-[10px] text-muted-foreground mt-2">{completedCount} of {tasks.length} tasks completed</p>
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
            {tasks.map((task, i) => {
              const sc = statusCfg[task.status];
              return (
                <motion.div key={task.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }} className="card-surface p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{task.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Due: {task.deadline}</p>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${task.status === "completed" ? "bg-status-completed/10" : task.status === "in_progress" ? "bg-primary/10" : "bg-secondary"}`}>
                      <sc.icon className={`w-3 h-3 ${sc.color}`} />
                      <span className={`text-[9px] font-medium ${sc.color}`}>{sc.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                          <span className="text-[9px] font-bold text-foreground">{task.assigneeAvatar}</span>
                        </div>
                        <span className="text-[10px] text-foreground font-medium">{task.assignee}</span>
                      </div>
                    ) : (
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => { setAssigningTaskId(task.id); setShowAssign(true); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                        <UserPlus className="w-4 h-4" /><span className="text-xs font-bold">Assign Worker</span>
                      </motion.button>
                    )}
                    {task.assignee && (
                      <button onClick={() => { setAssigningTaskId(task.id); setShowAssign(true); }}
                        className="text-[10px] text-muted-foreground">Reassign</button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent className="max-w-sm mx-auto bg-card border-border">
          <DialogHeader><DialogTitle className="text-foreground">Assign Worker</DialogTitle></DialogHeader>
          <div className="space-y-2 mt-2">
            {availableWorkers.map(w => (
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
            <motion.button whileTap={{ scale: 0.97 }} onClick={addTask}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold">Add Task</motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetail;
