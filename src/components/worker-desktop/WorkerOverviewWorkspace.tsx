import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, MessageCircle } from "lucide-react";
import { useAtelier, TaskStatus } from "@/contexts/AtelierContext";
import { CURRENT_WORKER } from "@/lib/workers";
import {
  DesktopOnly, WorkspaceHeader, StatCards, SectionCard, StatusPill, PillTone,
} from "@/components/designer-desktop/DesktopKit";

const statusMeta: Record<TaskStatus, { label: string; tone: PillTone }> = {
  not_started: { label: "Not Started", tone: "neutral" },
  in_progress: { label: "In Progress", tone: "info" },
  completed: { label: "Completed", tone: "success" },
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

/** Worker overview for tablet/desktop — deliberately light: what to do next. */
const WorkerOverviewWorkspace = () => {
  const navigate = useNavigate();
  const { tasks, tasksByWorker, orderById } = useAtelier();
  const myTasks = useMemo(() => tasksByWorker(CURRENT_WORKER.id), [tasks, tasksByWorker]);

  const active = myTasks.filter((t) => t.status !== "completed");
  const urgent = active.filter((t) => t.priority === "urgent");

  const upNext = useMemo(
    () => [...active].sort((a, b) => (a.priority === b.priority ? 0 : a.priority === "urgent" ? -1 : 1)).slice(0, 6),
    [active]
  );

  const photos = myTasks.flatMap((t) => t.images).slice(0, 8);

  return (
    <DesktopOnly>
      <WorkspaceHeader
        title={`${greeting()}, ${CURRENT_WORKER.name}`}
        subtitle={`${CURRENT_WORKER.role} · your work for today`}
        action={{ label: "Open my tasks", icon: ClipboardList, onClick: () => navigate("/worker-tasks") }}
      />

      <StatCards
        stats={[
          { label: "Tasks in progress", value: String(active.length), hint: "Assigned to you now" },
          { label: "Marked urgent", value: String(urgent.length), hint: "Start with these" },
        ]}
      />

      <div className="mt-6 grid grid-cols-[1fr_minmax(320px,420px)] gap-5 items-start">
        <div className="rounded-3xl card-elevated p-5 space-y-2">
          <p className="text-xs font-semibold text-foreground px-1 pb-1">Up next</p>
          {upNext.map((t) => {
            const order = orderById(t.orderId);
            return (
              <button key={t.id} onClick={() => navigate("/worker-tasks")}
                className="w-full text-left rounded-2xl p-3 flex items-center gap-3 bg-card border border-border hover:bg-secondary/40 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">{t.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {order?.client || "—"} · Due {t.deadline}
                  </p>
                </div>
                {t.priority === "urgent" && <StatusPill label="Urgent" tone="danger" />}
                <StatusPill label={statusMeta[t.status].label} tone={statusMeta[t.status].tone} />
              </button>
            );
          })}
          {upNext.length === 0 && (
            <p className="text-xs text-muted-foreground py-6 text-center">Nothing assigned right now.</p>
          )}
        </div>

        <div className="rounded-3xl card-elevated p-5 space-y-5">
          <SectionCard title="Recent finished-work photos">
            {photos.length ? (
              <div className="grid grid-cols-4 gap-2">
                {photos.map((p) => (
                  <img key={p.slice(0, 24)} src={p} alt="Finished work" className="w-full h-16 rounded-xl object-cover border border-border/30" />
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">Upload photos as you complete stages.</p>
            )}
          </SectionCard>
          <button onClick={() => navigate("/workshop-chat")}
            className="w-full rounded-2xl bg-secondary border border-border p-4 flex items-center gap-3 hover:bg-secondary transition-colors">
            <MessageCircle className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Message the workshop</span>
          </button>
        </div>
      </div>
    </DesktopOnly>
  );
};

export default WorkerOverviewWorkspace;
