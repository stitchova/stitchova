import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronRight, ClipboardList, AlertTriangle } from "lucide-react";
import { DesktopOnly, WorkspaceHeader, StatCards, StatusPill, SectionCard } from "./DesktopKit";
import type { StaffBoard } from "@/lib/staffBoard";

interface Props {
  board: StaffBoard;
  format: (n: number) => string;
  currencyCode: string;
}

/** Tablet/desktop staff dashboard — mirrors the designer dashboard styling. */
const StaffDashboardWorkspace = ({ board, format, currencyCode }: Props) => {
  const navigate = useNavigate();

  const stats = [
    { label: "Pending orders", value: String(board.pendingOrders.length), hint: "Awaiting work or completion" },
    { label: "Upcoming appointments", value: String(board.appointments.length), hint: "Published slots ahead" },
    { label: "Overdue payments", value: format(board.overdueTotal), hint: `${board.overduePayments.length} order(s) past due · ${currencyCode}` },
  ];

  return (
    <DesktopOnly>
      <WorkspaceHeader
        title="Staff Dashboard"
        subtitle="Today's workload across the floor — production, bookings and money owed."
        action={{ label: "Open orders", icon: ClipboardList, onClick: () => navigate("/orders") }}
      />
      <StatCards stats={stats} />

      <div className="grid grid-cols-[1.4fr_1fr] gap-5 mt-6">
        <SectionCard title="Pending orders">
          <div className="space-y-2">
            {board.pendingOrders.map((o) => (
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
            {board.pendingOrders.length === 0 && (
              <p className="text-xs text-muted-foreground py-6 text-center">Nothing pending — the floor is clear.</p>
            )}
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Upcoming appointments">
            <div className="space-y-2">
              {board.appointments.slice(0, 5).map((a) => (
                <button key={a.id} onClick={() => navigate("/appointments")}
                  className="w-full text-left rounded-2xl bg-card/60 border border-border/40 p-3 flex items-center gap-3">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{a.dateLabel}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{a.summary}</p>
                  </div>
                </button>
              ))}
              {board.appointments.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">No published slots ahead.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Overdue payments">
            <div className="space-y-2">
              {board.overduePayments.map((o) => (
                <motion.button whileHover={{ y: -1 }} key={o.id} onClick={() => navigate(`/order/${o.id}`)}
                  className="w-full text-left rounded-2xl bg-destructive/5 border border-destructive/25 p-3 flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{o.client}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{o.type} · due {o.dueDate}</p>
                  </div>
                  <span className="text-xs font-bold font-mono text-destructive">{format(o.balance)}</span>
                </motion.button>
              ))}
              {board.overduePayments.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">Every balance is settled.</p>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </DesktopOnly>
  );
};

export default StaffDashboardWorkspace;
