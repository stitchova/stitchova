import { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Ruler, Package, Clock, CheckCircle2, AlertTriangle, Camera, ChevronRight, MessagesSquare, Flame } from "lucide-react";
import { useAtelier } from "@/contexts/AtelierContext";
import { CURRENT_WORKER } from "@/lib/workers";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } };

const statusConfig: Record<string, { label: string; color: string; border: string; icon: typeof Clock }> = {
  not_started: { label: "Not Started", color: "text-muted-foreground", border: "border-l-muted", icon: Clock },
  in_progress: { label: "In Progress", color: "text-primary", border: "border-l-primary", icon: AlertTriangle },
  completed: { label: "Completed", color: "text-green-400", border: "border-l-green-400", icon: CheckCircle2 },
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const WorkerDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("fashionos-authenticated") !== "1") {
      navigate("/auth", { replace: true });
    }
  }, [navigate]);

  const { tasksByWorker, measurements, orderById } = useAtelier();
  const myTasks = useMemo(() => tasksByWorker(CURRENT_WORKER.id), [tasksByWorker]);

  const completedTasks = myTasks.filter((t) => t.status === "completed").length;
  const activeCount = myTasks.filter((t) => t.status !== "completed").length;
  const totalTasks = Math.max(myTasks.length, 1);
  const completionPct = Math.round((completedTasks / totalTasks) * 100);

  // Recent finished-work photos across the worker's own uploads.
  const recentUploads = useMemo(() => {
    const items: { id: string; name: string; image: string }[] = [];
    for (const t of myTasks) {
      for (const img of t.images) {
        const order = orderById(t.orderId);
        items.push({ id: `${t.id}-${img.slice(0, 8)}`, name: order?.type || t.title, image: img });
      }
    }
    return items.slice(0, 6);
  }, [myTasks, orderById]);

  const materialsOrderCount = useMemo(() => {
    const s = new Set<string>();
    for (const t of myTasks) if (t.status !== "completed") s.add(t.orderId);
    return s.size;
  }, [myTasks]);

  const stats = [
    { label: "Active Tasks", value: String(activeCount), icon: ClipboardList, path: "/worker-tasks" },
    { label: "Measurements", value: String(measurements.length), icon: Ruler, path: "/worker-measurements" },
    { label: "Materials", value: String(materialsOrderCount), icon: Package, path: "/worker-materials" },
  ];

  const daysUntil = (deadline: string) => {
    // Deadlines are formatted like "Apr 5" or ISO — best-effort parse.
    const now = new Date();
    const parsed = new Date(deadline + (deadline.length <= 6 ? ` ${now.getFullYear()}` : ""));
    if (Number.isNaN(parsed.getTime())) return null;
    const diff = Math.ceil((parsed.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // "Today's tasks" = most urgent-first, top 3
  const todaysTasks = useMemo(() => {
    return [...myTasks]
      .sort((a, b) => {
        if (a.status === "completed" && b.status !== "completed") return 1;
        if (a.status !== "completed" && b.status === "completed") return -1;
        if (a.priority !== b.priority) return a.priority === "urgent" ? -1 : 1;
        return 0;
      })
      .slice(0, 3);
  }, [myTasks]);

  // SVG ring params
  const ringR = 38;
  const ringC = 2 * Math.PI * ringR;
  const ringOffset = ringC - (completionPct / 100) * ringC;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-6">
        <motion.div {...fadeUp}>
          <p className="text-muted-foreground text-sm">{getGreeting()},</p>
          <h1 className="text-2xl font-bold shimmer-text">{CURRENT_WORKER.name}</h1>
          <p className="text-xs text-muted-foreground mt-1">{CURRENT_WORKER.role} • Ade Designs Studio</p>
        </motion.div>
      </div>

      {/* Performance Ring + Quick Stats */}
      <div className="px-5 mb-6">
        <motion.div {...fadeUp} transition={{ delay: 0.05 }}
          className="card-glass p-5 flex items-center gap-5 mb-4">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r={ringR} fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
              <motion.circle cx="48" cy="48" r={ringR} fill="none"
                stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={ringC} initial={{ strokeDashoffset: ringC }}
                animate={{ strokeDashoffset: ringOffset }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-foreground">{completionPct}%</span>
              <span className="text-[9px] text-muted-foreground">Done</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground mb-1">Task Completion</p>
            <p className="text-xs text-muted-foreground">{completedTasks} of {myTasks.length} tasks completed</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <motion.button key={s.label} {...fadeUp} transition={{ delay: 0.1 + i * 0.05 }}
              onClick={() => navigate(s.path)}
              whileTap={{ scale: 0.97 }}
              className="card-glass p-4 text-center group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 group-active:bg-primary/20 transition-colors">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="px-5 mb-6">
        <motion.button
          {...fadeUp}
          transition={{ delay: 0.12 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/workshop-chat")}
          className="w-full card-glass p-4 mb-4 flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <MessagesSquare className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">Workshop Chat</p>
            <p className="text-[11px] text-muted-foreground">Group, DMs & announcements</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </motion.button>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">Today's Tasks</h2>
          <button onClick={() => navigate("/worker-tasks")} className="text-xs text-primary font-medium flex items-center gap-0.5">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-3">
          {todaysTasks.map((task, i) => {
            const sc = statusConfig[task.status];
            const order = orderById(task.orderId);
            const days = daysUntil(task.deadline);
            const isUrgent = task.priority === "urgent";
            return (
              <motion.button key={task.id} {...fadeUp} transition={{ delay: 0.15 + i * 0.04 }}
                onClick={() => navigate("/worker-tasks")}
                whileTap={{ scale: 0.98 }}
                className={`w-full card-glass p-4 text-left border-l-[3px] ${isUrgent ? "border-l-red-400" : sc.border}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-foreground">{order?.type || task.title}</p>
                      {isUrgent && <Flame className="w-3 h-3 text-red-400" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{order?.client || "—"}</p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-card/60 ${sc.color}`}>
                    <sc.icon className="w-3 h-3" />
                    <span className="text-[10px] font-medium">{sc.label}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-muted-foreground">Due: {task.deadline}</p>
                  {task.status !== "completed" && days !== null && days > 0 && (
                    <span className={`text-[10px] font-medium ${days <= 2 ? "text-red-400" : "text-muted-foreground"}`}>
                      {days} day{days > 1 ? "s" : ""} left
                    </span>
                  )}
                  {task.status !== "completed" && days !== null && days <= 0 && (
                    <span className="text-[10px] font-medium text-red-400">Overdue</span>
                  )}
                </div>
              </motion.button>
            );
          })}
          {todaysTasks.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-4">No tasks assigned yet.</p>
          )}
        </div>
      </div>

      {/* Recent Uploads */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">Recent Uploads</h2>
          <Camera className="w-4 h-4 text-muted-foreground" />
        </div>
        {recentUploads.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">Upload finished-work photos from a task to see them here.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {recentUploads.map((u, i) => (
              <motion.div key={u.id} {...fadeUp} transition={{ delay: 0.2 + i * 0.05 }}
                className="flex-shrink-0 w-28">
                <div className="w-28 h-28 rounded-2xl overflow-hidden border border-border/20 mb-1.5">
                  <img src={u.image} alt={u.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] text-muted-foreground text-center truncate">{u.name}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;
