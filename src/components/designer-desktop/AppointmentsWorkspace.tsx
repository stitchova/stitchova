import { motion } from "framer-motion";
import { Bell, CalendarDays, Check, Clock, Plus, Trash2 } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { DesktopOnly, WorkspaceHeader } from "./DesktopKit";

export interface AvailabilitySlotView {
  id: string;
  date: Date;
  times: string[];
  services: string[];
  notes: string;
  reminder: boolean;
}

interface Props {
  saved: boolean;
  serviceTypes: { label: string; icon: string; duration: string }[];
  quickDates: Date[];
  timeSlots: string[];
  selectedDate?: Date;
  selectedTimes: string[];
  selectedServices: string[];
  slotNotes: string;
  slotReminder: boolean;
  slots: AvailabilitySlotView[];
  canAdd: boolean;
  onSelectDate: (d: Date) => void;
  onToggleTime: (t: string) => void;
  onToggleService: (s: string) => void;
  onNotes: (v: string) => void;
  onToggleReminder: () => void;
  onAddSlot: () => void;
  onRemoveSlot: (id: string) => void;
  onSave: () => void;
}

/** Tablet/desktop workspace for the designer availability scheduler. */
const AppointmentsWorkspace = ({
  saved, serviceTypes, quickDates, timeSlots, selectedDate, selectedTimes, selectedServices,
  slotNotes, slotReminder, slots, canAdd, onSelectDate, onToggleTime, onToggleService,
  onNotes, onToggleReminder, onAddSlot, onRemoveSlot, onSave,
}: Props) => (
  <DesktopOnly>
    <div className="mx-auto max-w-[1200px]">
      <WorkspaceHeader title="Schedule Availability" subtitle="Set your available times for client bookings" />

      {saved ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="solid-panel mt-6 py-20 flex flex-col items-center gap-5"
        >
          <div className="w-20 h-20 rounded-full bg-status-completed/20 flex items-center justify-center">
            <Check className="w-10 h-10 text-status-completed" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Availability Published!</h2>
          <p className="text-muted-foreground text-sm">Clients can now book appointments on your available dates.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-[1fr_minmax(320px,400px)] gap-6 mt-6 items-start">
          {/* Composer */}
          <div className="solid-panel p-6 space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Appointment Type</p>
              <div className="grid grid-cols-4 gap-3">
                {serviceTypes.map((s) => (
                  <motion.button
                    key={s.label} whileTap={{ scale: 0.97 }} onClick={() => onToggleService(s.label)}
                    className={cn("rounded-2xl bg-card p-4 flex items-center gap-3 border transition-all text-left",
                      selectedServices.includes(s.label) ? "border-primary bg-primary/10" : "border-border")}
                  >
                    <span className="text-xl">{s.icon}</span>
                    <div>
                      <span className="text-xs font-medium text-foreground">{s.label}</span>
                      <span className="block text-[10px] text-muted-foreground">{s.duration}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-3">Select date</p>
              <div className="grid grid-cols-7 gap-2">
                {quickDates.map((d) => (
                  <motion.button
                    key={d.toISOString()} whileTap={{ scale: 0.96 }} onClick={() => onSelectDate(d)}
                    className={cn("flex flex-col items-center py-2.5 rounded-xl border transition-all",
                      selectedDate && isSameDay(d, selectedDate) ? "border-primary bg-primary/10" : "border-border bg-card")}
                  >
                    <span className="text-[10px] uppercase text-muted-foreground">{format(d, "EEE")}</span>
                    <span className="text-lg font-semibold text-foreground">{format(d, "d")}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-3">Available time slots</p>
              <div className="grid grid-cols-8 gap-2">
                {timeSlots.map((t) => (
                  <motion.button
                    key={t} whileTap={{ scale: 0.96 }} onClick={() => onToggleTime(t)}
                    className={cn("py-2 rounded-xl text-[11px] font-medium border transition-all",
                      selectedTimes.includes(t) ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground")}
                  >
                    {t}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Notes (optional)</p>
                <textarea
                  value={slotNotes} onChange={(e) => onNotes(e.target.value)} rows={2}
                  placeholder="Add notes for this appointment slot..."
                  className="w-full bg-card border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }} onClick={onToggleReminder}
                className={cn("rounded-xl bg-card px-4 py-3 flex items-center gap-3 border transition-all h-[52px]",
                  slotReminder ? "border-primary/40" : "border-border")}
              >
                <Bell className={cn("w-4 h-4", slotReminder ? "text-primary" : "text-muted-foreground")} />
                <span className="text-xs text-foreground">Reminder</span>
                <div className={cn("w-10 h-5 rounded-full transition-colors relative", slotReminder ? "bg-primary" : "bg-secondary")}>
                  <motion.div animate={{ x: slotReminder ? 20 : 2 }} className="absolute top-0.5 w-4 h-4 rounded-full bg-foreground" />
                </div>
              </motion.button>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }} disabled={!canAdd} onClick={onAddSlot}
              className={cn("w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                canAdd ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
            >
              <Plus className="w-4 h-4" /> Add Availability Slot
            </motion.button>
          </div>

          {/* Slot rail */}
          <div className="solid-panel p-6 space-y-4">
            <p className="text-sm font-semibold text-foreground">Your Availability ({slots.length})</p>
            {slots.length === 0 ? (
              <p className="text-xs text-muted-foreground py-10 text-center">No slots added yet.</p>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto scrollbar-hide pr-1">
                {slots.map((slot, i) => (
                  <motion.div
                    key={slot.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-2xl bg-card border border-border p-4 flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CalendarDays className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{format(slot.date, "EEEE, MMM d")}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {slot.times.map((t) => (
                          <span key={t} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> {t}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{slot.services.join(", ")}</p>
                      {slot.notes && <p className="text-[10px] text-primary mt-0.5 italic">{slot.notes}</p>}
                      {slot.reminder && (
                        <span className="text-[9px] text-status-completed flex items-center gap-0.5 mt-0.5">
                          <Bell className="w-2.5 h-2.5" /> Reminder set
                        </span>
                      )}
                    </div>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => onRemoveSlot(slot.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
            {slots.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.98 }} onClick={onSave}
                className="w-full py-3.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground flex items-center justify-center gap-2 glow-primary"
              >
                <Check className="w-4 h-4" /> Publish Availability ({slots.length} slots)
              </motion.button>
            )}
          </div>
        </div>
      )}
    </div>
  </DesktopOnly>
);

export default AppointmentsWorkspace;
