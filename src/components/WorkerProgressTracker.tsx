import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, AlertTriangle, ChevronRight, Users, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const workers = [
  { name: "Tunde A.", role: "Tailor", completed: 12, total: 15, onTime: 92, avatar: "TA" },
  { name: "Amina K.", role: "Cutter", completed: 8, total: 10, onTime: 88, avatar: "AK" },
  { name: "Kwesi B.", role: "Finisher", completed: 5, total: 9, onTime: 78, avatar: "KB" },
];

const activityFeed = [
  { worker: "Tunde A.", action: "completed", task: "Ankara Gown – Bodice", time: "12 min ago", icon: CheckCircle2, color: "text-status-completed" },
  { worker: "Amina K.", action: "started", task: "3-Piece Suit – Cutting", time: "45 min ago", icon: Clock, color: "text-primary" },
  { worker: "Kwesi B.", action: "delayed", task: "Agbada Set – Embroidery", time: "2 hrs ago", icon: AlertTriangle, color: "text-status-cutting" },
  { worker: "Tunde A.", action: "completed", task: "Senator Suit – Trouser hem", time: "3 hrs ago", icon: CheckCircle2, color: "text-status-completed" },
  { worker: "Amina K.", action: "completed", task: "Evening Dress – Pattern cut", time: "5 hrs ago", icon: CheckCircle2, color: "text-status-completed" },
];

const WorkerProgressTracker = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Worker Completion Rates */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Worker Progress</h2>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/workers")}
            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1 hover:bg-primary/20 transition-colors"
          >
            Manage <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
        <div className="space-y-3">
          {workers.map((w) => {
            const pct = Math.round((w.completed / w.total) * 100);
            return (
              <motion.div
                key={w.name}
                whileTap={{ scale: 0.98 }}
                className="card-surface p-4 cursor-pointer"
                onClick={() => navigate("/workers")}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-foreground">{w.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground">{w.name}</p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-status-completed" />
                        <span className="text-[10px] text-status-completed font-medium">{w.onTime}% on-time</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{w.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={pct} className="h-2 flex-1" />
                  <span className="text-[10px] font-bold text-foreground w-16 text-right">{w.completed}/{w.total} tasks</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Activity Feed */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Activity Feed</h2>
          <span className="text-[10px] text-muted-foreground">Live</span>
        </div>
        <div className="card-surface divide-y divide-border">
          {activityFeed.map((a, i) => (
            <div key={i} className="flex items-start gap-3 p-3">
              <div className="mt-0.5">
                <a.icon className={`w-4 h-4 ${a.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground">
                  <span className="font-semibold">{a.worker}</span>{" "}
                  <span className="text-muted-foreground">{a.action}</span>{" "}
                  <span className="font-medium">{a.task}</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
};

export default WorkerProgressTracker;
