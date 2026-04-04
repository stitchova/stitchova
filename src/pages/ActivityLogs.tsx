import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, User, Scissors, Package, CreditCard, Calendar, Shield, Filter } from "lucide-react";
import { useState } from "react";

type LogType = "order" | "payment" | "worker" | "client" | "appointment" | "system";

interface ActivityLog {
  id: string;
  type: LogType;
  action: string;
  detail: string;
  user: string;
  timestamp: string;
  relatedOrder?: string;
}

const mockLogs: ActivityLog[] = [
  { id: "1", type: "order", action: "Order Created", detail: "New order #1045 – Bridal Gown for Amina B.", user: "You", timestamp: "2 min ago", relatedOrder: "#1045" },
  { id: "2", type: "worker", action: "Task Assigned", detail: "Cutting task assigned to Fatima K. for order #1045", user: "You", timestamp: "5 min ago", relatedOrder: "#1045" },
  { id: "3", type: "payment", action: "Payment Received", detail: "₦75,000 deposit received for order #1044", user: "System", timestamp: "1 hr ago", relatedOrder: "#1044" },
  { id: "4", type: "worker", action: "Task Completed", detail: "Sewing completed by Chidi O. for order #1042", user: "Chidi O.", timestamp: "2 hrs ago", relatedOrder: "#1042" },
  { id: "5", type: "client", action: "Client Added", detail: "New client profile: Ngozi E. was created", user: "You", timestamp: "3 hrs ago" },
  { id: "6", type: "appointment", action: "Appointment Scheduled", detail: "Fitting scheduled with Amina B. for Apr 10", user: "You", timestamp: "4 hrs ago" },
  { id: "7", type: "order", action: "Stage Updated", detail: "Order #1041 moved to Quality Check", user: "You", timestamp: "5 hrs ago", relatedOrder: "#1041" },
  { id: "8", type: "payment", action: "Payment Overdue", detail: "₦50,000 balance overdue for order #1039", user: "System", timestamp: "6 hrs ago", relatedOrder: "#1039" },
  { id: "9", type: "worker", action: "Worker Added", detail: "New worker Bola A. added to team", user: "You", timestamp: "Yesterday" },
  { id: "10", type: "system", action: "Plan Upgraded", detail: "Subscription upgraded to Pro plan", user: "System", timestamp: "2 days ago" },
  { id: "11", type: "order", action: "Order Delivered", detail: "Order #1038 marked as delivered to Kemi L.", user: "You", timestamp: "2 days ago", relatedOrder: "#1038" },
  { id: "12", type: "client", action: "Measurement Updated", detail: "Body measurements updated for Tunde M.", user: "You", timestamp: "3 days ago" },
];

const typeConfig: Record<LogType, { icon: typeof Clock; color: string; bg: string }> = {
  order: { icon: Package, color: "text-primary", bg: "bg-primary/10" },
  payment: { icon: CreditCard, color: "text-green-400", bg: "bg-green-400/10" },
  worker: { icon: Scissors, color: "text-blue-400", bg: "bg-blue-400/10" },
  client: { icon: User, color: "text-purple-400", bg: "bg-purple-400/10" },
  appointment: { icon: Calendar, color: "text-orange-400", bg: "bg-orange-400/10" },
  system: { icon: Shield, color: "text-muted-foreground", bg: "bg-muted/50" },
};

const filterOptions: { label: string; value: LogType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Orders", value: "order" },
  { label: "Payments", value: "payment" },
  { label: "Workers", value: "worker" },
  { label: "Clients", value: "client" },
  { label: "Appointments", value: "appointment" },
];

const ActivityLogs = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<LogType | "all">("all");

  const filtered = filter === "all" ? mockLogs : mockLogs.filter((l) => l.type === filter);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="p-2 rounded-xl bg-card">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Activity Logs</h1>
            <p className="text-xs text-muted-foreground">Track all actions on your account</p>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          {filterOptions.map((opt) => (
            <motion.button
              key={opt.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filter === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border border-border/50"
              }`}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Logs list */}
      <div className="px-4 py-4 space-y-2">
        {filtered.map((log, i) => {
          const config = typeConfig[log.type];
          const Icon = config.icon;
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex gap-3 p-3 rounded-2xl bg-card border border-border/30"
            >
              <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{log.action}</span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">{log.timestamp}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{log.detail}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-muted-foreground/70">by {log.user}</span>
                  {log.relatedOrder && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                      {log.relatedOrder}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityLogs;
