import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle2, PlayCircle, Camera, X, ImagePlus, ClipboardList, Loader2 } from "lucide-react";
import { toast } from "sonner";
import EmptyState from "@/components/EmptyState";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } };

type TaskStatus = "not_started" | "in_progress" | "completed";

interface Task {
  id: number;
  client: string;
  garment: string;
  status: TaskStatus;
  deadline: string;
  description: string;
  stage: number; // 0-3
  images: string[];
}

const initialTasks: Task[] = [
  { id: 1, client: "Mrs. Adebayo", garment: "Ankara Gown", status: "in_progress", deadline: "Apr 5", description: "Sew bodice and attach skirt. Use Ankara fabric #12.", stage: 1, images: [] },
  { id: 2, client: "Mr. Okafor", garment: "Agbada Set", status: "not_started", deadline: "Apr 8", description: "Cut agbada, sokoto, and fila. Pattern ready on shelf.", stage: 0, images: [] },
  { id: 3, client: "Chioma E.", garment: "Blouse", status: "completed", deadline: "Apr 2", description: "Finish hemming and add buttons.", stage: 3, images: [] },
  { id: 4, client: "Bola T.", garment: "Senator Suit", status: "not_started", deadline: "Apr 10", description: "Cut and sew senator top and trousers. Guinea brocade.", stage: 0, images: [] },
  { id: 5, client: "Kemi O.", garment: "Bridesmaid Dress", status: "in_progress", deadline: "Apr 6", description: "Attach lace overlay and fit bodice.", stage: 2, images: [] },
];

const stages = ["Cutting", "Sewing", "Finishing", "Done"];

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string; border: string; icon: typeof Clock }> = {
  not_started: { label: "Not Started", color: "text-muted-foreground", bg: "bg-secondary", border: "border-l-muted", icon: Clock },
  in_progress: { label: "In Progress", color: "text-primary", bg: "bg-primary/10", border: "border-l-primary", icon: PlayCircle },
  completed: { label: "Completed", color: "text-green-400", bg: "bg-green-400/10", border: "border-l-green-400", icon: CheckCircle2 },
};

const filterKeys: (TaskStatus | "all")[] = ["all", "not_started", "in_progress", "completed"];
const filterLabels: Record<string, string> = { all: "All", not_started: "Not Started", in_progress: "In Progress", completed: "Completed" };

const WorkerTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeFilter, setActiveFilter] = useState<TaskStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingTaskId, setUploadingTaskId] = useState<number | null>(null);
  const [pendingStatusId, setPendingStatusId] = useState<number | null>(null);
  const [pendingRemoveKey, setPendingRemoveKey] = useState<string | null>(null);
  const [filterPending, setFilterPending] = useState(false);

  const filtered = activeFilter === "all" ? tasks : tasks.filter(t => t.status === activeFilter);

  const updateStatus = async (id: number, newStatus: TaskStatus) => {
    if (pendingStatusId === id) return;
    setPendingStatusId(id);
    await new Promise((r) => setTimeout(r, 450));
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus, stage: newStatus === "completed" ? 3 : newStatus === "in_progress" ? Math.max(t.stage, 1) : t.stage } : t));
    const labels: Record<TaskStatus, string> = { not_started: "Not Started", in_progress: "In Progress", completed: "Completed 🎉" };
    toast.success(`Task marked as ${labels[newStatus]}`);
    setPendingStatusId(null);
  };

  const nextStatus: Record<TaskStatus, TaskStatus | null> = {
    not_started: "in_progress",
    in_progress: "completed",
    completed: null,
  };

  const handleImageUpload = (taskId: number) => {
    setUploadingTaskId(taskId);
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !uploadingTaskId) return;

    Array.from(files).slice(0, 4).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setTasks(prev => prev.map(t =>
          t.id === uploadingTaskId
            ? { ...t, images: [...t.images.slice(0, 3), dataUrl] }
            : t
        ));
        toast.success("Image uploaded successfully! 🎉");
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = async (taskId: number, idx: number) => {
    const key = `${taskId}-${idx}`;
    if (pendingRemoveKey === key) return;
    setPendingRemoveKey(key);
    await new Promise((r) => setTimeout(r, 300));
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, images: t.images.filter((_, i) => i !== idx) } : t
    ));
    toast("Photo removed");
    setPendingRemoveKey(null);
  };

  const handleFilterTap = (f: TaskStatus | "all") => {
    if (filterPending || activeFilter === f) return;
    setFilterPending(true);
    setActiveFilter(f);
    setTimeout(() => setFilterPending(false), 250);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" multiple
        className="hidden" onChange={onFileChange} />

      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border px-5 pt-14 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">My Tasks</h1>
        </div>

        {/* Animated segmented control */}
        <div className="relative flex bg-card/60 backdrop-blur-xl rounded-2xl p-1 border border-border/20">
          {filterKeys.map(f => {
            const count = f === "all" ? tasks.length : tasks.filter(t => t.status === f).length;
            return (
              <button key={f} onClick={() => handleFilterTap(f)} disabled={filterPending}
                className="relative flex-1 py-2 rounded-xl text-[10px] font-medium z-10 transition-colors disabled:cursor-not-allowed"
                style={{ color: activeFilter === f ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))" }}>
                {filterLabels[f]} ({count})
                {activeFilter === f && (
                  <motion.div layoutId="worker-task-filter" className="absolute inset-0 bg-primary rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 pt-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((task, i) => {
            const sc = statusConfig[task.status];
            const next = nextStatus[task.status];
            const isExpanded = expandedId === task.id;

            return (
              <motion.div key={task.id} layout {...fadeUp} transition={{ delay: i * 0.04 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`card-glass overflow-hidden border-l-[3px] ${sc.border}`}>
                <button onClick={() => setExpandedId(isExpanded ? null : task.id)} className="w-full p-4 text-left">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">{task.garment}</p>
                      <p className="text-xs text-muted-foreground">{task.client}</p>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${sc.bg}`}>
                      {task.status === "in_progress" && (
                        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                          <sc.icon className={`w-3 h-3 ${sc.color}`} />
                        </motion.div>
                      )}
                      {task.status !== "in_progress" && <sc.icon className={`w-3 h-3 ${sc.color}`} />}
                      <span className={`text-[10px] font-medium ${sc.color}`}>{sc.label}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">Due: {task.deadline}</p>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="px-4 pb-4 border-t border-border/20 pt-3 overflow-hidden">
                      <p className="text-xs text-muted-foreground mb-4">{task.description}</p>

                      {/* Production Stage Tracker */}
                      <div className="mb-4">
                        <p className="text-[10px] font-semibold text-muted-foreground mb-2">Production Stage</p>
                        <div className="flex items-center gap-1">
                          {stages.map((s, si) => (
                            <div key={s} className="flex items-center flex-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 transition-colors ${
                                si <= task.stage ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                              }`}>{si + 1}</div>
                              {si < stages.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-1 ${si < task.stage ? "bg-primary" : "bg-border"}`} />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-1">
                          {stages.map((s, si) => (
                            <span key={s} className={`text-[8px] flex-1 text-center ${si <= task.stage ? "text-primary" : "text-muted-foreground"}`}>{s}</span>
                          ))}
                        </div>
                      </div>

                      {/* Image Upload Section */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-semibold text-muted-foreground">Finished Work Photos</p>
                          <span className="text-[9px] text-muted-foreground">{task.images.length}/4</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {task.images.map((img, idx) => {
                            const removing = pendingRemoveKey === `${task.id}-${idx}`;
                            return (
                              <div key={idx} className={`relative aspect-square rounded-xl overflow-hidden border border-border/20 transition-opacity ${removing ? "opacity-40" : ""}`}>
                                <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                                <button onClick={() => removeImage(task.id, idx)} disabled={removing}
                                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center disabled:opacity-60">
                                  {removing ? <Loader2 className="w-3 h-3 text-foreground animate-spin" /> : <X className="w-3 h-3 text-foreground" />}
                                </button>
                              </div>
                            );
                          })}
                          {task.images.length < 4 && (
                            <motion.button whileTap={{ scale: 0.95 }}
                              onClick={() => handleImageUpload(task.id)}
                              className="aspect-square rounded-xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center gap-1 bg-card/30">
                              <ImagePlus className="w-5 h-5 text-muted-foreground" />
                              <span className="text-[8px] text-muted-foreground">Upload</span>
                            </motion.button>
                          )}
                        </div>
                      </div>

                      {next && (
                        <motion.button whileTap={{ scale: 0.97 }}
                          onClick={() => updateStatus(task.id, next)}
                          disabled={pendingStatusId === task.id}
                          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                          {pendingStatusId === task.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          {pendingStatusId === task.id ? "Updating..." : `Mark as ${statusConfig[next].label}`}
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <EmptyState
            icon={ClipboardList}
            title="No tasks here"
            description={activeFilter === "all" ? "You have no tasks assigned yet." : `No ${filterLabels[activeFilter].toLowerCase()} tasks right now.`}
          />
        )}
      </div>
    </div>
  );
};

export default WorkerTasks;
