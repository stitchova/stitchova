import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UserPlus, Ruler, ClipboardList, CalendarDays, ChevronRight, Package } from "lucide-react";
import { useAtelier, money } from "@/contexts/AtelierContext";
import { DesktopOnly, WorkspaceHeader, StatCards, StatusPill, SectionCard, Avatar } from "./DesktopKit";

const quickActions = [
  { icon: UserPlus, label: "Add client", path: "/clients?new=1" },
  { icon: Ruler, label: "New measurement", path: "/measurements" },
  { icon: ClipboardList, label: "New order", path: "/orders" },
  { icon: CalendarDays, label: "Appointments", path: "/appointments" },
];

const withinWeek = (due: string) => {
  const d = new Date(due);
  if (isNaN(d.getTime())) return false;
  const diff = (d.getTime() - Date.now()) / 86_400_000;
  return diff >= -1 && diff <= 7;
};

/** Designer dashboard for tablet/desktop. Mobile dashboard is untouched. */
const DashboardWorkspace = () => {
  const navigate = useNavigate();
  const { orders, clients } = useAtelier();

  const active = useMemo(() => orders.filter((o) => o.status === "active"), [orders]);
  const dueThisWeek = active.filter((o) => withinWeek(o.dueDate));
  const outstanding = orders
    .filter((o) => o.status !== "declined")
    .reduce((sum, o) => sum + Math.max(0, o.price - o.payments.reduce((s, p) => s + p.amount, 0)), 0);

  const stats = [
    { label: "Active orders", value: String(active.length), hint: "In the workshop now" },
    { label: "Due this week", value: String(dueThisWeek.length), hint: "Deadlines in the next 7 days" },
    { label: "Outstanding balance", value: money(outstanding, "GHS"), hint: "Across unpaid orders" },
  ];

  return (
    <DesktopOnly>
      <WorkspaceHeader
        title="Dashboard"
        subtitle="A snapshot of everything moving through your atelier today."
        action={{ label: "New order", icon: ClipboardList, onClick: () => navigate("/orders") }}
      />
      <StatCards stats={stats} />

      <div className="grid grid-cols-4 gap-3 mt-5">
        {quickActions.map((a) => (
          <motion.button key={a.label} whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }}
            onClick={() => navigate(a.path)}
            className="frost-card p-4 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.18), hsl(var(--accent) / 0.12))" }}>
              <a.icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-semibold text-foreground">{a.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-5 mt-6">
        <SectionCard title="Orders in production">
          <div className="space-y-2">
            {active.slice(0, 6).map((o) => (
              <button key={o.id} onClick={() => navigate(`/order/${o.id}`)}
                className="w-full text-left rounded-2xl bg-card/60 border border-border/40 hover:bg-card transition-colors p-3 flex items-center gap-3">
                <img src={o.img} alt={o.type} className="w-10 h-10 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">{o.type}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{o.client} · Due {o.dueDate}</p>
                </div>
                <StatusPill
                  label={o.awaitingMaterials ? "Awaiting Materials" : o.stages[o.currentStage] || "Active"}
                  tone={o.awaitingMaterials ? "neutral" : "primary"}
                />
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
            {active.length === 0 && (
              <p className="text-xs text-muted-foreground py-6 text-center">No active orders right now.</p>
            )}
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Waiting on materials">
            <div className="space-y-2">
              {active.filter((o) => o.awaitingMaterials).slice(0, 4).map((o) => (
                <button key={o.id} onClick={() => navigate(`/orders`)}
                  className="w-full text-left rounded-2xl bg-card/60 border border-border/40 p-3 flex items-center gap-3">
                  <Package className="w-4 h-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{o.type}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{o.client}</p>
                  </div>
                </button>
              ))}
              {active.filter((o) => o.awaitingMaterials).length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">Nothing blocked before cutting.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Recent clients">
            <div className="space-y-2">
              {clients.slice(0, 5).map((c) => (
                <button key={c.id} onClick={() => navigate(`/client/${c.id}`)}
                  className="w-full text-left rounded-2xl bg-card/60 border border-border/40 p-3 flex items-center gap-3">
                  <Avatar initials={c.initials} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{c.phone || "No phone"}</p>
                  </div>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </DesktopOnly>
  );
};

export default DashboardWorkspace;
