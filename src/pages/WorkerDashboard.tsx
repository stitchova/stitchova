import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Ruler, Package, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

const tasks = [
  { id: 1, client: "Mrs. Adebayo", garment: "Ankara Gown", status: "in_progress", deadline: "Apr 5" },
  { id: 2, client: "Mr. Okafor", garment: "Agbada Set", status: "not_started", deadline: "Apr 8" },
  { id: 3, client: "Chioma E.", garment: "Blouse", status: "completed", deadline: "Apr 2" },
];

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  not_started: { label: "Not Started", color: "text-muted-foreground", icon: Clock },
  in_progress: { label: "In Progress", color: "text-primary", icon: AlertTriangle },
  completed: { label: "Completed", color: "text-green-400", icon: CheckCircle2 },
};

const WorkerDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { label: "Active Tasks", value: "4", icon: ClipboardList, path: "/worker-tasks" },
    { label: "Measurements", value: "12", icon: Ruler, path: "/worker-measurements" },
    { label: "Materials", value: "8", icon: Package, path: "/worker-materials" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-6">
        <motion.div {...fadeUp}>
          <p className="text-muted-foreground text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold text-foreground">Tunde A.</h1>
          <p className="text-xs text-muted-foreground mt-1">Tailor • Ade Designs Studio</p>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <motion.button key={s.label} {...fadeUp} transition={{ delay: i * 0.05 }}
              onClick={() => navigate(s.path)}
              className="bg-card border border-border rounded-2xl p-4 text-center">
              <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">Today's Tasks</h2>
          <button onClick={() => navigate("/worker-tasks")} className="text-xs text-primary font-medium">View all</button>
        </div>
        <div className="space-y-3">
          {tasks.map((task, i) => {
            const sc = statusConfig[task.status];
            return (
              <motion.button key={task.id} {...fadeUp} transition={{ delay: i * 0.05 }}
                onClick={() => navigate("/worker-tasks")}
                className="w-full bg-card border border-border rounded-2xl p-4 text-left">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">{task.garment}</p>
                    <p className="text-xs text-muted-foreground">{task.client}</p>
                  </div>
                  <div className={`flex items-center gap-1 ${sc.color}`}>
                    <sc.icon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-medium">{sc.label}</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Due: {task.deadline}</p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
