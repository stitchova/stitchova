import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle2, PlayCircle, X, ImagePlus, ClipboardList, Loader2, AlertTriangle, Flame, Flag } from "lucide-react";
import { toast } from "sonner";
import EmptyState from "@/components/EmptyState";
import { useAtelier, WorkerTask, TaskStatus } from "@/contexts/AtelierContext";
import { useWorkshopChat } from "@/contexts/WorkshopChatContext";
import { CURRENT_WORKER } from "@/lib/workers";
import StageTracker from "@/components/StageTracker";
import OrderMaterials from "@/components/OrderMaterials";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } };

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string; border: string; icon: typeof Clock }> = {
  not_started: { label: "Not Started", color: "text-muted-foreground", bg: "bg-secondary", border: "border-l-muted", icon: Clock },
  in_progress: { label: "In Progress", color: "text-primary", bg: "bg-primary/10", border: "border-l-primary", icon: PlayCircle },
  completed: { label: "Completed", color: "text-green-400", bg: "bg-green-400/10", border: "border-l-green-400", icon: CheckCircle2 },
};

const filterKeys: (TaskStatus | "all")[] = ["all", "not_started", "in_progress", "completed"];
const filterLabels: Record<string, string> = { all: "All", not_started: "Not Started", in_progress: "In Progress", completed: "Completed" };

const WorkerTasks = () => {
  const navigate = useNavigate();
  const { tasks: allTasks, tasksByWorker, updateTask, orderById, setStage, undoLastStage, flagTask } = useAtelier();
  const { sendMessage, setCurrentUserId, dmChatId } = useWorkshopChat();
  const tasks = useMemo(() => tasksByWorker(CURRENT_WORKER.id), [allTasks, tasksByWorker]);

  const [activeFilter, setActiveFilter] = useState<TaskStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null);
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);
  const [pendingRemoveKey, setPendingRemoveKey] = useState<string | null>(null);
  const [filterPending, setFilterPending] = useState(false);
  const [flaggingId, setFlaggingId] = useState<string | null>(null);
  const [flagText, setFlagText] = useState("");

  const filtered = activeFilter === "all" ? tasks : tasks.filter(t => t.status === activeFilter);

  // Advance the parent order to the tapped production stage. Prior stages are
  // implicitly marked complete because currentStage is a single index. Also
  // syncs task status so the filter tabs/badges keep matching stage reality.
  const handleStageTap = async (task: WorkerTask, targetIdx: number) => {
    const order = orderById(task.orderId);
    if (!order) return;
    if (targetIdx === order.currentStage) return;
    if (pendingStatusId === task.id) return;
    if (order.awaitingMaterials) {
      toast.error("Awaiting materials — required items must be confirmed received first.");
      return;
    }

    const isFinal = targetIdx === order.stages.length - 1;
    if (isFinal && task.images.length === 0) {
      toast.error("Attach at least one finished-work photo before completing the final stage.");
      return;
    }

    setPendingStatusId(task.id);
    await new Promise((r) => setTimeout(r, 250));
    const stageName = order.stages[targetIdx];
    const photoUrl = isFinal ? task.images[task.images.length - 1] : undefined;
    setStage(order.id, targetIdx, {
      photoUrl,
      workerId: task.workerId,
      workerName: task.workerName,
    });
    // Derive a sensible task status from the tapped stage.
    const nextTaskStatus: TaskStatus =
      typeof task.stageIdx === "number"
        ? targetIdx > task.stageIdx ? "completed"
          : targetIdx === task.stageIdx ? "in_progress" : "not_started"
        : isFinal ? "completed" : "in_progress";
    updateTask(task.id, { status: nextTaskStatus });

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
    setPendingStatusId(null);
  };

  const handleImageUpload = (taskId: string) => {
    setUploadingTaskId(taskId);
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !uploadingTaskId) return;
    const target = tasks.find((t) => t.id === uploadingTaskId);
    if (!target) { e.target.value = ""; return; }
    Array.from(files).slice(0, 4).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const current = tasksByWorker(CURRENT_WORKER.id).find((t) => t.id === uploadingTaskId)?.images || target.images;
        updateTask(uploadingTaskId, { images: [...current.slice(0, 3), dataUrl] });
        toast.success("Image uploaded successfully! 🎉");
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = async (taskId: string, idx: number) => {
    const key = `${taskId}-${idx}`;
    if (pendingRemoveKey === key) return;
    setPendingRemoveKey(key);
    await new Promise((r) => setTimeout(r, 300));
    const target = tasks.find((t) => t.id === taskId);
    if (target) updateTask(taskId, { images: target.images.filter((_, i) => i !== idx) });
    toast("Photo removed");
    setPendingRemoveKey(null);
  };

  const handleFilterTap = (f: TaskStatus | "all") => {
    if (filterPending || activeFilter === f) return;
    setFilterPending(true);
    setActiveFilter(f);
    setTimeout(() => setFilterPending(false), 250);
  };

  const submitFlag = () => {
    if (!flaggingId) return;
    const task = tasks.find((t) => t.id === flaggingId);
    if (!task) return;
    const reason = flagText.trim() || "Blocker reported";
    flagTask(flaggingId, reason);
    // Also drop a DM to the designer so it lands in Workshop Chat.
    setCurrentUserId(CURRENT_WORKER.id);
    const chat = dmChatId(CURRENT_WORKER.id, "designer");
    sendMessage(chat, `🚩 Issue on "${task.title}" (${task.orderId}): ${reason}`);
    toast.warning("Designer notified in Workshop Chat");
    setFlaggingId(null);
    setFlagText("");
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
            const isExpanded = expandedId === task.id;
            const order = orderById(task.orderId);
            const stages = order?.stages || ["Cutting", "Sewing", "Finishing", "Quality Check"];
            const currentStageIdx = order?.currentStage ?? 0;
            const client = order?.client || "—";
            const garmentLabel = order?.type || task.title;
            const isUrgent = task.priority === "urgent";
            const isAdvancing = pendingStatusId === task.id;

            return (
              <motion.div key={task.id} layout {...fadeUp} transition={{ delay: Math.min(i, 6) * 0.04 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`card-glass overflow-hidden border-l-[3px] ${isUrgent ? "border-l-red-400" : sc.border}`}>
                <button onClick={() => setExpandedId(isExpanded ? null : task.id)} className="w-full p-4 text-left">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-foreground">{garmentLabel}</p>
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
                      <p className="text-xs text-muted-foreground">{client} · {task.title}</p>
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
                      <p className="text-xs text-muted-foreground mb-4">
                        {order?.styleDesc || task.title}
                      </p>
                      {task.flagReason && (
                        <div className="mb-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <p className="text-[10px] text-amber-300">Flagged: {task.flagReason}</p>
                        </div>
                      )}

                      {/* Production Stage Tracker */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-semibold text-muted-foreground">Production Stage</p>
                          <p className="text-[9px] text-muted-foreground">Tap a stage to jump to it</p>
                        </div>
                        <StageTracker
                          stages={stages}
                          currentIdx={currentStageIdx}
                          size="sm"
                          disabled={isAdvancing || !order}
                          onSelect={(idx) => handleStageTap(task, idx)}
                        />
                      </div>

                      {/* Materials — worker can confirm receipt before production */}
                      {order && (order.materialsList || []).length > 0 && (
                        <div className="mb-4">
                          <OrderMaterials orderId={order.id} actorName="Worker" actorRole="worker" />
                        </div>
                      )}

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

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <button onClick={() => setFlaggingId(task.id)}
                          className="py-2 rounded-xl bg-amber-500/10 text-amber-400 text-[11px] font-bold flex items-center justify-center gap-1.5 border border-amber-500/30">
                          <Flag className="w-3.5 h-3.5" /> Flag Issue
                        </button>
                        <button onClick={() => updateTask(task.id, { priority: isUrgent ? "normal" : "urgent" })}
                          className={`py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 border ${isUrgent ? "bg-secondary text-muted-foreground border-border" : "bg-red-500/10 text-red-400 border-red-500/30"}`}>
                          <Flame className="w-3.5 h-3.5" /> {isUrgent ? "Clear Urgent" : "Mark Urgent"}
                        </button>
                      </div>

                      {isAdvancing && (
                        <div className="w-full py-2.5 rounded-xl bg-secondary text-muted-foreground text-xs font-medium flex items-center justify-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Advancing stage...
                        </div>
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

      {/* Flag issue sheet */}
      <AnimatePresence>
        {flaggingId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-background/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={() => setFlaggingId(null)}>
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Flag className="w-4 h-4 text-amber-400" /> Flag Issue to Designer
                </p>
                <button onClick={() => setFlaggingId(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <textarea value={flagText} onChange={(e) => setFlagText(e.target.value)} rows={3}
                placeholder="What's blocking you? (e.g. fabric shortage, unclear measurement)"
                className="w-full bg-secondary/50 border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none" />
              <button onClick={submitFlag}
                className="mt-3 w-full py-3 rounded-xl bg-amber-500 text-white text-sm font-bold">
                Notify Designer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkerTasks;
