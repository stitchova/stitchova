import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, ChevronRight, ClipboardList, AlertTriangle, Coins } from "lucide-react";
import { useAtelier } from "@/contexts/AtelierContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAppointmentSlots } from "@/lib/appointments";
import { buildStaffBoard } from "@/lib/staffBoard";
import StaffDashboardWorkspace from "@/components/designer-desktop/StaffDashboardWorkspace";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } };

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { orders } = useAtelier();
  const { format, code } = useCurrency();
  const [slots] = useAppointmentSlots();

  const board = useMemo(() => buildStaffBoard(orders, slots), [orders, slots]);

  const stats = [
    { label: "Pending", value: String(board.pendingOrders.length), icon: ClipboardList },
    { label: "Appointments", value: String(board.appointments.length), icon: CalendarDays },
    { label: "Overdue", value: String(board.overduePayments.length), icon: AlertTriangle },
  ];

  return (
    <>
      <StaffDashboardWorkspace board={board} format={format} currencyCode={code} />

      {/* Mobile */}
      <div className="min-h-screen bg-background pb-28 lg:hidden">
        <div className="sticky top-0 z-20 bg-background/70 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/40">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-lg font-bold shimmer-text">Staff Dashboard</h1>
            <p className="text-[11px] text-muted-foreground">Workload, bookings & money owed</p>
          </div>
          <button onClick={() => navigate("/settings/currency")}
            className="px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-[11px] font-semibold text-primary">
            {code}
          </button>
        </div>

        <div className="px-5 pt-4 space-y-5">
          {/* Overdue hero */}
          <motion.div {...fadeUp}
            className="relative overflow-hidden rounded-3xl border border-primary/20 p-5"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.16), hsl(var(--card)) 55%)" }}>
            <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full blur-3xl opacity-40"
              style={{ background: "hsl(var(--primary) / 0.35)" }} />
            <div className="relative">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Coins className="w-3.5 h-3.5 text-primary" /> Overdue balances
              </div>
              <p className="mt-2 text-3xl font-bold text-gradient-gold font-mono tabular-nums">{format(board.overdueTotal)}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Across {board.overduePayments.length} order{board.overduePayments.length === 1 ? "" : "s"} past their due date
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-3 gap-3">
            {stats.map((s, i) => (
              <motion.div key={s.label} {...fadeUp} transition={{ delay: 0.05 * i }} className="frost-card p-4 text-center">
                <div className="w-9 h-9 rounded-xl bg-primary/12 flex items-center justify-center mx-auto mb-2">
                  <s.icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Pending orders */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-sm font-bold text-foreground">Pending Orders</h2>
              <button onClick={() => navigate("/orders")} className="text-xs text-primary font-medium flex items-center gap-0.5">
                All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2.5">
              {board.pendingOrders.slice(0, 6).map((o) => (
                <motion.button key={o.id} whileTap={{ scale: 0.98 }} onClick={() => navigate(`/order/${o.id}`)}
                  className="card-surface w-full p-3.5 flex items-center gap-3 text-left">
                  <img src={o.img} alt={o.type} className="w-11 h-11 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{o.type}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{o.client} · Due {o.dueDate}</p>
                  </div>
                  <span className="text-[9px] font-semibold px-2 py-1 rounded-full bg-primary/15 text-primary whitespace-nowrap">
                    {o.awaitingMaterials ? "Materials" : o.stages[o.currentStage] || "Active"}
                  </span>
                </motion.button>
              ))}
              {board.pendingOrders.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-4">Nothing pending right now.</p>
              )}
            </div>
          </section>

          {/* Appointments */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-sm font-bold text-foreground">Upcoming Appointments</h2>
              <button onClick={() => navigate("/appointments")} className="text-xs text-primary font-medium flex items-center gap-0.5">
                Schedule <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2.5">
              {board.appointments.slice(0, 5).map((a) => (
                <div key={a.id} className="card-surface p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/12 flex items-center justify-center">
                    <CalendarDays className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{a.dateLabel}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{a.summary}</p>
                  </div>
                </div>
              ))}
              {board.appointments.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-4">No published slots ahead.</p>
              )}
            </div>
          </section>

          {/* Overdue payments */}
          <section>
            <h2 className="text-sm font-bold text-foreground mb-2.5">Overdue Payments</h2>
            <div className="space-y-2.5">
              {board.overduePayments.map((o) => (
                <motion.button key={o.id} whileTap={{ scale: 0.98 }} onClick={() => navigate(`/order/${o.id}`)}
                  className="w-full p-3.5 rounded-2xl bg-destructive/5 border border-destructive/25 flex items-center gap-3 text-left">
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{o.client}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{o.type} · due {o.dueDate}</p>
                  </div>
                  <span className="text-sm font-bold font-mono text-destructive">{format(o.balance)}</span>
                </motion.button>
              ))}
              {board.overduePayments.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-4">Every balance is settled.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default StaffDashboard;
