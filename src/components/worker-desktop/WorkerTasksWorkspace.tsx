import { useMemo, useRef, useState } from "react";
import { AlertTriangle, Camera, Flame, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import EmptyState from "@/components/EmptyState";
import StageTracker from "@/components/StageTracker";
import OrderMaterials from "@/components/OrderMaterials";
import { useAtelier, WorkerTask, TaskStatus } from "@/contexts/AtelierContext";
import { useWorkshopChat } from "@/contexts/WorkshopChatContext";
import { CURRENT_WORKER } from "@/lib/workers";
import {
  DesktopOnly, WorkspaceHeader, StatCards, ListDetail, ListPanel, ListRow,
  DetailPanel, DetailHeader, InfoGrid, SectionCard, SummaryBar, StatusPill, PillTone,
} from "@/components/designer-desktop/DesktopKit";

const statusMeta: Record<TaskStatus, { label: string; tone: PillTone }> = {
  not_started: { label: "Not Started", tone: "neutral" },
  in_progress: { label: "In Progress", tone: "info" },
  completed: { label: "Completed", tone: "success" },
};

const tabs = ["All", "Not Started", "In Progress", "Completed"] as const;
const tabToStatus: Record<string, TaskStatus | "all"> = {
  All: "all", "Not Started": "not_started", "In Progress": "in_progress", Completed: "completed",
};

/**
 * Worker tablet/desktop workspace: assigned tasks list + per-order detail
 * (stage control, measurements needed, materials checklist, finished photos).
 * Renders from `lg` upwards only — the mobile task screen is untouched.
 */
const WorkerTasksWorkspace = () => {
  const {
    tasks: allTasks, tasksByWorker, updateTask, orderById, clientById,
    setStage, undoLastStage, flagTask, latestMeasurement,
  } = useAtelier();
  const { sendMessage, dmChatId } = useWorkshopChat();

  const tasks = useMemo(() => tasksByWorker(CURRENT_WORKER.id), [allTasks, tasksByWorker]);
  const [tab, setTab] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flagText, setFlagText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const status = tabToStatus[tab];
    return tasks
      .filter((t) => (status === "all" ? true : t.status === status))
      .filter((t) => {
        const order = orderById(t.orderId);
        return `${t.title} ${order?.client || ""} ${order?.type || ""}`.toLowerCase().includes(query.toLowerCase());
      });
  }, [tasks, tab, query, orderById]);

  const selected: WorkerTask | undefined =
    filtered.find((t) => t.id === selectedId) || filtered[0];
  const order = selected ? orderById(selected.orderId) : undefined;
  const client = order ? clientById(order.clientId) : undefined;
  const measurement = order ? latestMeasurement(order.clientId, order.garment || order.type) : undefined;

  const dueToday = tasks.filter((t) => t.status !== "completed" && t.priority === "urgent").length;
  const activeCount = tasks.filter((t) => t.status !== "completed").length;

  const handleStageTap = (targetIdx: number) => {
    if (!selected || !order) return;
    if (targetIdx === order.currentStage) return;
    if (order.awaitingMaterials) {
      toast.error("Awaiting materials — required items must be confirmed received first.");
      return;
    }
    const isFinal = targetIdx === order.stages.length - 1;
    if (isFinal && selected.images.length === 0) {
      toast.error("Attach at least one finished-work photo before completing the final stage.");
      return;
    }
    setStage(order.id, targetIdx, {
      photoUrl: isFinal ? selected.images[selected.images.length - 1] : undefined,
      workerId: selected.workerId,
      workerName: selected.workerName,
    });
    const nextStatus: TaskStatus =
      typeof selected.stageIdx === "number"
        ? targetIdx > selected.stageIdx ? "completed" : targetIdx === selected.stageIdx ? "in_progress" : "not_started"
        : isFinal ? "completed" : "in_progress";
    updateTask(selected.id, { status: nextStatus });
    toast.success(`Advanced to ${order.stages[targetIdx]}`, {
      duration: 5000,
      action: { label: "Undo", onClick: () => { undoLastStage(order.id); toast("Stage change reverted"); } },
    });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selected) return;
    Array.from(files).slice(0, 4).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const current = tasksByWorker(CURRENT_WORKER.id).find((t) => t.id === selected.id)?.images || [];
        updateTask(selected.id, { images: [...current.slice(0, 3), dataUrl] });
        toast.success("Finished-work photo added");
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const submitFlag = () => {
    if (!selected || !flagText.trim()) return;
    flagTask(selected.id, flagText.trim());
    sendMessage(dmChatId(CURRENT_WORKER.id, "designer"), `⚠️ Issue on ${selected.title}: ${flagText.trim()}`);
    setFlagText("");
    toast.success("Issue flagged — the designer has been notified.");
  };

  return (
    <DesktopOnly>
      <WorkspaceHeader
        title="My Tasks"
        subtitle="Everything assigned to you, newest work first."
        tabs={tabs}
        activeTab={tab}
        onTab={setTab}
        pillId="workerTasksPill"
        query={query}
        onQuery={setQuery}
        searchPlaceholder="Search tasks…"
      />

      <StatCards
        stats={[
          { label: "Active tasks", value: String(activeCount), hint: "Assigned to you now" },
          { label: "Marked urgent", value: String(dueToday), hint: "Needs attention first" },
        ]}
      />

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-3xl card-elevated p-10">
          <EmptyState icon={AlertTriangle} title="No tasks here" description="Nothing matches this filter yet." />
        </div>
      ) : (
        <ListDetail
          list={
            <ListPanel title="Assigned work" count={filtered.length}>
              {filtered.map((t) => {
                const o = orderById(t.orderId);
                return (
                  <ListRow
                    key={t.id}
                    active={selected?.id === t.id}
                    onClick={() => setSelectedId(t.id)}
                    title={t.title}
                    meta={`${o?.client || "—"} · Due ${t.deadline}`}
                    pill={statusMeta[t.status]}
                  />
                );
              })}
            </ListPanel>
          }
          detail={
            selected && order ? (
              <DetailPanel id={selected.id}>
                <DetailHeader
                  eyebrow="Assigned order"
                  title={order.type}
                  pill={statusMeta[selected.status]}
                  subtitle={`${order.client} · ${order.styleDesc || order.garment}`}
                  right={{ label: "Due", value: selected.deadline, hint: order.awaitingMaterials ? "Awaiting materials" : `Stage ${order.currentStage + 1} of ${order.stages.length}` }}
                />

                <InfoGrid
                  blocks={[
                    { label: "Garment", value: order.garment || order.type },
                    { label: "Current stage", value: order.stages[order.currentStage] || "—" },
                    { label: "Priority", value: selected.priority === "urgent" ? "Urgent" : "Normal" },
                    { label: "Assigned stage", value: typeof selected.stageIdx === "number" ? order.stages[selected.stageIdx] : "Any" },
                  ]}
                />

                <SectionCard title="Production stage">
                  <StageTracker
                    stages={order.stages}
                    currentIdx={order.currentStage}
                    onSelect={handleStageTap}
                    disabled={order.awaitingMaterials}
                  />
                  {order.awaitingMaterials && (
                    <p className="text-[11px] text-status-cutting mt-3">
                      Confirm the required materials below before starting production.
                    </p>
                  )}
                </SectionCard>

                <SectionCard title="Measurements for this task">
                  {measurement ? (
                    <div className="grid grid-cols-4 gap-3">
                      {Object.entries(measurement.fields).map(([k, v]) => (
                        <div key={k} className="rounded-xl bg-card border border-border p-3">
                          <p className="text-[10px] text-muted-foreground">{k}</p>
                          <p className="text-sm font-semibold text-foreground mt-1">{v} {measurement.unit || "in"}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      No measurements recorded yet for this garment. Record them from the Measurements tab.
                    </p>
                  )}
                </SectionCard>

                <OrderMaterials orderId={order.id} actorName={CURRENT_WORKER.name} actorRole="worker" />

                <SectionCard title="Finished-work photos">
                  <div className="flex items-center gap-3 flex-wrap">
                    {selected.images.map((img) => (
                      <img key={img.slice(0, 24)} src={img} alt="Finished work" className="w-20 h-20 rounded-xl object-cover border border-border/40" />
                    ))}
                    <button onClick={() => fileRef.current?.click()}
                      className="w-20 h-20 rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                      <ImagePlus className="w-4 h-4" />
                      <span className="text-[9px]">Add</span>
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onFileChange} />
                  </div>
                </SectionCard>

                <SectionCard title="Flag an issue">
                  <div className="flex items-center gap-3">
                    <input
                      value={flagText}
                      onChange={(e) => setFlagText(e.target.value)}
                      placeholder="Describe the blocker for the designer…"
                      className="flex-1 bg-card border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
                    />
                    <button onClick={submitFlag}
                      className="rounded-full bg-destructive/15 text-destructive px-5 py-3 text-xs font-semibold flex items-center gap-2">
                      <Flame className="w-4 h-4" /> Flag
                    </button>
                  </div>
                  {selected.flagReason && (
                    <p className="text-[11px] text-destructive mt-3">Flagged: {selected.flagReason}</p>
                  )}
                </SectionCard>

                <SummaryBar
                  items={[
                    { label: "Stage", value: `${order.currentStage + 1} of ${order.stages.length}`, accent: true },
                    { label: "Photos attached", value: String(selected.images.length) },
                    { label: "Status", value: statusMeta[selected.status].label },
                  ]}
                >
                  <div className="flex items-center gap-2">
                    <StatusPill label={order.awaitingMaterials ? "Awaiting Materials" : order.stages[order.currentStage]} tone={order.awaitingMaterials ? "warning" : "primary"} className="text-[10px] px-3" />
                    <button onClick={() => fileRef.current?.click()}
                      className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-xs font-semibold flex items-center gap-2 glow-primary">
                      <Camera className="w-4 h-4" /> Upload photo
                    </button>
                  </div>
                </SummaryBar>
              </DetailPanel>
            ) : null
          }
        />
      )}
    </DesktopOnly>
  );
};

export default WorkerTasksWorkspace;
