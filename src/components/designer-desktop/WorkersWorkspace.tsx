import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HardHat, MessageCircle } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { AVAILABLE_WORKERS } from "@/lib/workers";
import { useAtelier } from "@/contexts/AtelierContext";
import { useWorkshopChat } from "@/contexts/WorkshopChatContext";
import {
  DesktopOnly, WorkspaceHeader, ListDetail, ListPanel, ListRow, DetailPanel, DetailHeader,
  InfoGrid, SummaryBar, SectionCard, StatusPill, Avatar,
} from "./DesktopKit";

const tabs = ["All", "Busy", "Free"] as const;

/** Designer worker-management workspace (list + detail) for tablet/desktop. */
const WorkersWorkspace = () => {
  const navigate = useNavigate();
  const { tasksByWorker, orderById } = useAtelier();
  const { dmChatId, currentUserId } = useWorkshopChat();

  const [tab, setTab] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => AVAILABLE_WORKERS.filter((w) => {
    const open = tasksByWorker(w.id).filter((t) => t.status !== "completed").length;
    const byTab = tab === "All" ? true : tab === "Busy" ? open > 0 : open === 0;
    return byTab && `${w.name} ${w.role}`.toLowerCase().includes(query.toLowerCase());
  }), [tasksByWorker, tab, query]);

  useEffect(() => {
    if (!filtered.find((w) => w.id === selectedId)) setSelectedId(filtered[0]?.id ?? null);
  }, [filtered, selectedId]);

  const selected = filtered.find((w) => w.id === selectedId) || null;
  const tasks = selected ? tasksByWorker(selected.id) : [];
  const open = tasks.filter((t) => t.status !== "completed");
  const done = tasks.filter((t) => t.status === "completed");
  const urgent = open.filter((t) => t.priority === "urgent");
  const flagged = tasks.filter((t) => t.flaggedAt);

  return (
    <DesktopOnly>
      <WorkspaceHeader
        title="Workers"
        subtitle="Assign work and follow every apprentice's workload."
        tabs={tabs} activeTab={tab} onTab={setTab} pillId="workersDesktopPill"
        query={query} onQuery={setQuery} searchPlaceholder="Search workers…"
      />

      <ListDetail
        list={
          <ListPanel title={`${tab} workers`} count={filtered.length}>
            {filtered.map((w) => {
              const openCount = tasksByWorker(w.id).filter((t) => t.status !== "completed").length;
              return (
                <ListRow key={w.id} active={w.id === selectedId} onClick={() => setSelectedId(w.id)}
                  leading={<Avatar initials={w.avatar} />}
                  title={w.name}
                  meta={`${w.role} · ${openCount} open task${openCount === 1 ? "" : "s"}`}
                  pill={openCount > 0 ? { label: "Busy", tone: "primary" } : { label: "Free", tone: "neutral" }} />
              );
            })}
            {filtered.length === 0 && (
              <EmptyState icon={HardHat} title="No workers" description="No workers match this filter." />
            )}
          </ListPanel>
        }
        detail={selected ? (
          <DetailPanel id={selected.id}>
            <DetailHeader
              eyebrow="Worker details"
              title={selected.name}
              pill={open.length > 0 ? { label: "Busy", tone: "primary" } : { label: "Free", tone: "neutral" }}
              subtitle={selected.role}
              right={{ label: "Open tasks", value: String(open.length), hint: `${done.length} completed` }}
              actions={
                <motion.button whileTap={{ scale: 0.96 }}
                  onClick={() => navigate(`/workshop-chat/${dmChatId(currentUserId, selected.id)}`)}
                  className="rounded-full frost-card px-4 py-2 text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  Message <MessageCircle className="w-3 h-3" />
                </motion.button>
              }
            />

            <InfoGrid blocks={[
              { label: "Role", value: selected.role },
              { label: "Urgent tasks", value: String(urgent.length) },
              { label: "Flagged issues", value: String(flagged.length) },
              { label: "Completion", value: tasks.length ? `${Math.round((done.length / tasks.length) * 100)}%` : "—" },
            ]} />

            <SectionCard title="Assigned tasks">
              <div className="space-y-2">
                {tasks.slice(0, 8).map((t) => {
                  const order = orderById(t.orderId);
                  return (
                    <button key={t.id} onClick={() => order && navigate(`/order/${order.id}`)}
                      className="w-full text-left rounded-2xl bg-card/60 border border-border/40 p-3 flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">{t.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {order ? `${order.client} · ${order.type}` : "Unlinked"} · due {t.deadline}
                        </p>
                      </div>
                      {t.priority === "urgent" && <StatusPill label="Urgent" tone="danger" />}
                      <StatusPill
                        label={t.status === "completed" ? "Completed" : t.status === "in_progress" ? "In progress" : "Not started"}
                        tone={t.status === "completed" ? "success" : t.status === "in_progress" ? "primary" : "neutral"} />
                    </button>
                  );
                })}
                {tasks.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">No tasks assigned yet.</p>}
              </div>
            </SectionCard>

            <SummaryBar items={[
              { label: "Total tasks", value: String(tasks.length) },
              { label: "Completed", value: String(done.length) },
              { label: "Open", value: String(open.length), accent: true },
            ]}>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate("/workers")}
                className="rounded-full bg-primary text-primary-foreground text-xs font-semibold px-6 py-2.5">
                Manage staff
              </motion.button>
            </SummaryBar>
          </DetailPanel>
        ) : (
          <div className="rounded-3xl bg-card/70 border border-border/40">
            <EmptyState icon={HardHat} title="Select a worker" description="Pick a worker to see their workload." />
          </div>
        )}
      />
    </DesktopOnly>
  );
};

export default WorkersWorkspace;
