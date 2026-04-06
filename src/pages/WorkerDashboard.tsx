import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Ruler, Package, Clock, CheckCircle2, AlertTriangle, Camera, ChevronRight } from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } };

const tasks = [
  { id: 1, client: "Mrs. Adebayo", garment: "Ankara Gown", status: "in_progress", deadline: "Apr 5", daysLeft: 2 },
  { id: 2, client: "Mr. Okafor", garment: "Agbada Set", status: "not_started", deadline: "Apr 8", daysLeft: 5 },
  { id: 3, client: "Chioma E.", garment: "Blouse", status: "completed", deadline: "Apr 2", daysLeft: 0 },
];

const statusConfig: Record<string, { label: string; color: string; border: string; icon: typeof Clock }> = {
  not_started: { label: "Not Started", color: "text-muted-foreground", border: "border-l-muted", icon: Clock },
  in_progress: { label: "In Progress", color: "text-primary", border: "border-l-primary", icon: AlertTriangle },
  completed: { label: "Completed", color: "text-green-400", border: "border-l-green-400", icon: CheckCircle2 },
};

const recentUploads = [
  { id: 1, name: "Ankara Gown", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop" },
  { id: 2, name: "Senator Suit", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" },
  { id: 3, name: "Bridal Dress", image: "https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=200&h=200&fit=crop" },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const completedTasks = 3;
  const totalTasks = 5;
  const completionPct = Math.round((completedTasks / totalTasks) * 100);

  const stats = [
    { label: "Active Tasks", value: "4", icon: ClipboardList, path: "/worker-tasks" },
    { label: "Measurements", value: "12", icon: Ruler, path: "/worker-measurements" },
    { label: "Materials", value: "8", icon: Package, path: "/worker-materials" },
  ];

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
          <h1 className="text-2xl font-bold shimmer-text">Tunde A.</h1>
          <p className="text-xs text-muted-foreground mt-1">Tailor • Ade Designs Studio</p>
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
            <p className="text-xs text-muted-foreground">{completedTasks} of {totalTasks} tasks completed this week</p>
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">Today's Tasks</h2>
          <button onClick={() => navigate("/worker-tasks")} className="text-xs text-primary font-medium flex items-center gap-0.5">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-3">
          {tasks.map((task, i) => {
            const sc = statusConfig[task.status];
            return (
              <motion.button key={task.id} {...fadeUp} transition={{ delay: 0.15 + i * 0.04 }}
                onClick={() => navigate("/worker-tasks")}
                whileTap={{ scale: 0.98 }}
                className={`w-full card-glass p-4 text-left border-l-[3px] ${sc.border}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">{task.garment}</p>
                    <p className="text-xs text-muted-foreground">{task.client}</p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-card/60 ${sc.color}`}>
                    <sc.icon className="w-3 h-3" />
                    <span className="text-[10px] font-medium">{sc.label}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-muted-foreground">Due: {task.deadline}</p>
                  {task.status !== "completed" && task.daysLeft > 0 && (
                    <span className={`text-[10px] font-medium ${task.daysLeft <= 2 ? "text-red-400" : "text-muted-foreground"}`}>
                      {task.daysLeft} day{task.daysLeft > 1 ? "s" : ""} left
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Recent Uploads */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">Recent Uploads</h2>
          <Camera className="w-4 h-4 text-muted-foreground" />
        </div>
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
      </div>
    </div>
  );
};

export default WorkerDashboard;
