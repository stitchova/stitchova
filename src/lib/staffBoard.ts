import type { Order } from "@/contexts/AtelierContext";
import { upcomingAppointments, StoredSlot } from "@/lib/appointments";

export interface OverdueRow {
  id: string;
  client: string;
  type: string;
  dueDate: string;
  balance: number;
}

export interface AppointmentRow {
  id: string;
  dateLabel: string;
  summary: string;
}

export interface StaffBoard {
  pendingOrders: Order[];
  appointments: AppointmentRow[];
  overduePayments: OverdueRow[];
  overdueTotal: number;
}

const paidOf = (o: Order) => o.payments.reduce((s, p) => s + p.amount, 0);

/** Best-effort parse of the short "Mar 25" style due dates used in orders. */
export const parseDue = (due: string): Date | null => {
  if (!due) return null;
  const now = new Date();
  const raw = /\d{4}/.test(due) ? due : `${due} ${now.getFullYear()}`;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};

export const buildStaffBoard = (orders: Order[], slots: StoredSlot[]): StaffBoard => {
  const live = orders.filter((o) => o.status !== "declined");

  const pendingOrders = live
    .filter((o) => o.status === "requested" || o.status === "active")
    .sort((a, b) => (parseDue(a.dueDate)?.getTime() ?? Infinity) - (parseDue(b.dueDate)?.getTime() ?? Infinity));

  const now = Date.now();
  const overduePayments: OverdueRow[] = live
    .map((o) => ({ o, balance: Math.max(0, o.price - paidOf(o)), due: parseDue(o.dueDate) }))
    .filter((r) => r.balance > 0 && r.due !== null && r.due.getTime() < now)
    .sort((a, b) => b.balance - a.balance)
    .map(({ o, balance }) => ({ id: o.id, client: o.client, type: o.type, dueDate: o.dueDate, balance }));

  const appointments: AppointmentRow[] = upcomingAppointments(slots).map((s) => ({
    id: s.id,
    dateLabel: new Date(s.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
    summary: `${s.times.length} slot${s.times.length === 1 ? "" : "s"} · ${s.services.join(", ") || "Available"}`,
  }));

  return {
    pendingOrders,
    appointments,
    overduePayments,
    overdueTotal: overduePayments.reduce((s, r) => s + r.balance, 0),
  };
};
