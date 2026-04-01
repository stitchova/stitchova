import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle2, AlertTriangle, PlayCircle } from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

type TaskStatus = "not_started" | "in_progress" | "completed";

interface Task {
  id: number;
  client: string;
  garment: string;
  status: TaskStatus;
  deadline: string;
  description: string;
}

const initialTasks: Task[] = [
  { id: 1, client: "Mrs. Adebayo", garment: "Ankara Gown", status: "in_progress", deadline: "Apr 5", description: "Sew bodice and attach skirt. Use Ankara fabric #12." },
  { id: 2, client: "Mr. Okafor", garment: "Agbada Set", status: "not_started", deadline: "Apr 8", description: "Cut agbada, sokoto, and fila. Pattern ready on shelf." },
  { id: 3, client: "Chioma E.", garment: "Blouse", status: "completed", deadline: "Apr 2", description: "Finish hemming and add buttons." },
  { id: 4, client: "Bola T.", garment: "Senator Suit", status: "not_started", deadline: "Apr 10", description: "Cut and sew senator top and trousers. Guinea brocade." },
  { id: 5, client: "Kemi O.", garment: "Bridesmaid Dress", status: "in_progress", deadline: "Apr 6", description: "Attach lace overlay and fit bodice." },
];

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  not_started: { label: "Not Started", color: "text-muted-foreground", bg: "bg-secondary", icon: Clock },
  in_progress: { label: "In Progress", color: "text-primary", bg: "bg-primary/10", icon: PlayCircle },
  completed: { label: "Completed", color: "text-green-400", bg: "bg-green-400/10", icon: CheckCircle2 },
};

const filters: TaskStatus[] = ["not_started", "in_progress", "completed"];

const WorkerTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeFilter, setActiveFilter] = useState<TaskStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = activeFilter === "all" ? tasks : tasks.filter(t => t.status === activeFilter);

  const updateStatus = (id: number, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const nextStatus: Record<TaskStatus, TaskStatus | null> = {
    not_started: "in_progress",
    in_progress: "completed",
    completed: null,
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border px-5 pt-14 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">My Tasks</h1>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeFilter === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"}`}>
            All ({tasks.length})
          </button>
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeFilter === f ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"}`}>
              {statusConfig[f].label} ({tasks.filter(t => t.status === f).length})
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4 space-y-3">
        {filtered.map((task, i) => {
          const sc = statusConfig[task.status];
          const next = nextStatus[task.status];
          const isExpanded = expandedId === task.id;

          return (
            <motion.div key={task.id} {...fadeUp} transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-2xl overflow-hidden">
              <button onClick={() => setExpandedId(isExpanded ? null : task.id)} className="w-full p-4 text-left">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">{task.garment}</p>
                    <p className="text-xs text-muted-foreground">{task.client}</p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${sc.bg}`}>
                    <sc.icon className={`w-3 h-3 ${sc.color}`} />
                    <span className={`text-[10px] font-medium ${sc.color}`}>{sc.label}</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Due: {task.deadline}</p>
              </button>

              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  className="px-4 pb-4 border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground mb-3">{task.description}</p>
                  {next && (
                    <button onClick={() => updateStatus(task.id, next)}
                      className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold">
                      Mark as {statusConfig[next].label}
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkerTasks;
