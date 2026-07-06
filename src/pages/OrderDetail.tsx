import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, User, Scissors, ChevronRight, Plus, CheckCircle2, Clock, AlertTriangle, UserPlus, Package, FileText, Receipt, Send, Sparkles, PackageCheck } from "lucide-react";
import { useBrandInvoice, money, computeTotals } from "@/contexts/BrandInvoiceContext";
import { useNotifications, STAGE_TRIGGER_KEYS, NotifTriggerKey } from "@/contexts/NotificationsContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import orderWedding from "@/assets/order-wedding.jpg";
import orderSuit from "@/assets/order-suit.jpg";
import orderAgbada from "@/assets/order-agbada.jpg";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

const productionStages = ["Cutting", "Sewing", "Beading", "Finishing", "Quality Check"];

const ordersData: Record<string, {
  img: string; type: string; client: string; status: string; date: string; price: string;
  statusColor: string; description: string; fabrics: string[]; category: string; garment: string;
  styleDesc: string; currentStage: number; paymentPlan: string; amountPaid: string; balance: string;
}> = {
  "ama-serwaa": {
    img: orderWedding, type: "Wedding Gown", client: "Ama Serwaa", status: "Sewing",
    date: "Mar 25", price: "GHS 2,500", statusColor: "bg-status-sewing",
    description: "Custom wedding gown with lace overlay, sweetheart neckline, and cathedral train.",
    fabrics: ["French Lace – Ivory", "Silk Satin – White"], category: "Women", garment: "Bridal",
    styleDesc: "Sweetheart neckline, mermaid silhouette with cathedral train and crystal embellishments",
    currentStage: 1, paymentPlan: "Installment", amountPaid: "GHS 1,500", balance: "GHS 1,000",
  },
  "kofi-mensah": {
    img: orderSuit, type: "3-Piece Suit", client: "Kofi Mensah", status: "Cutting",
    date: "Mar 28", price: "GHS 1,800", statusColor: "bg-status-cutting",
    description: "Slim-fit 3-piece suit in navy blue with gold buttons and custom lining.",
    fabrics: ["English Wool – Navy", "Silk Lining – Gold"], category: "Men", garment: "Suit",
    styleDesc: "Slim fit, peak lapel, double-breasted waistcoat, flat-front trousers",
    currentStage: 0, paymentPlan: "Full Payment", amountPaid: "GHS 1,800", balance: "GHS 0",
  },
  "yaw-boateng": {
    img: orderAgbada, type: "Agbada Set", client: "Yaw Boateng", status: "Completed",
    date: "Mar 15", price: "GHS 3,200", statusColor: "bg-status-completed",
    description: "Full agbada set with heavy embroidery, sokoto, and fila cap.",
    fabrics: ["Guinea Brocade – Royal Blue", "Embroidery Thread – Gold"], category: "Men", garment: "Agbada",
    styleDesc: "Full-length agbada with heavy hand-embroidered patterns, matching sokoto and fila cap",
    currentStage: 4, paymentPlan: "Deposit", amountPaid: "GHS 2,500", balance: "GHS 700",
  },
};

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
  const orderInitial = ordersData[clientId || ""] || ordersData["ama-serwaa"];
  const [currentStage, setCurrentStage] = useState(orderInitial.currentStage);
  const [received, setReceived] = useState(false);
  const order = { ...orderInitial, currentStage };
  const { getByOrder, brand } = useBrandInvoice();
  const orderInvoices = getByOrder(clientId || "");
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
    setCurrentStage(stageIdx);
    const isComplete = stageIdx === productionStages.length - 1;
    const key: NotifTriggerKey = isComplete ? "completed" : STAGE_TRIGGER_KEYS[stageIdx];
    if (!commsUnlocked) {
      toast("Stage updated. Upgrade to Premium+ to auto-notify clients.");
      return;
    }
    const recs = send({
      key,
      clientName: order.client,
      clientContact: order.client.split(" ")[0].toLowerCase() + "@client.local",
      brandName: brand.businessName,
      tokens: {
        garment: order.garment.toLowerCase(),
        stage: productionStages[stageIdx],
        balance: order.balance,
      },
      orderRef: clientId,
    });
    if (recs.length) toast.success(`Notified ${order.client} via ${recs.map(r => r.channel).join(" + ")} as ${brand.businessName}`);
  };

  const markReceived = () => {
    setReceived(true);
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
      orderRef: clientId,
    });
    if (recs.length) toast.success(`Thank-you sent as ${brand.businessName}`);
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
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${order.statusColor} text-primary-foreground`}>{order.status}</span>
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
          <p className="text-xs text-muted-foreground">{order.description}</p>
          <div className="card-glass p-3 rounded-xl">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Style Description</p>
            <p className="text-xs text-foreground">{order.styleDesc}</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs text-foreground">Due: {order.date}</span></div>
            <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs text-foreground">{order.client}</span></div>
          </div>
          <div className="flex items-center gap-2">
            <Scissors className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {order.fabrics.map(f => <span key={f} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-foreground">{f}</span>)}
            </div>
          </div>
        </motion.div>

        {/* Payment Info */}
        <motion.div {...fadeUp} transition={{ delay: 0.03 }} className="card-surface p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground">Payment</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{order.paymentPlan}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center"><p className="text-xs text-muted-foreground">Total</p><p className="text-sm font-bold text-foreground">{order.price}</p></div>
            <div className="text-center"><p className="text-xs text-muted-foreground">Paid</p><p className="text-sm font-bold text-status-completed">{order.amountPaid}</p></div>
            <div className="text-center"><p className="text-xs text-muted-foreground">Balance</p><p className="text-sm font-bold text-primary">{order.balance}</p></div>
          </div>
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
