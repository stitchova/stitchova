import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Clock, MapPin, Plus, Check, X } from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import designerAvatar1 from "@/assets/designer-avatar-1.jpg";
import designerAvatar2 from "@/assets/designer-avatar-2.jpg";
import designerAvatar3 from "@/assets/designer-avatar-3.jpg";

const upcoming = [
  {
    id: "u1",
    designer: "Nana Ama",
    avatar: designerAvatar1,
    service: "Fitting",
    date: addDays(new Date(), 2),
    time: "10:30 AM",
    location: "East Legon Studio",
    status: "confirmed" as const,
  },
  {
    id: "u2",
    designer: "Kwame Styles",
    avatar: designerAvatar2,
    service: "Measurement",
    date: addDays(new Date(), 5),
    time: "02:00 PM",
    location: "Kumasi Atelier",
    status: "pending" as const,
  },
];

const availableDesigners = [
  { id: "nana-ama", name: "Nana Ama", avatar: designerAvatar1, specialty: "Bridal & Evening" },
  { id: "kwame-styles", name: "Kwame Styles", avatar: designerAvatar2, specialty: "Traditional" },
  { id: "efya-designs", name: "Efya Designs", avatar: designerAvatar3, specialty: "Contemporary" },
];

const services = ["Measurement", "Fitting", "Consultation", "Delivery"];
const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];
const quickDates = Array.from({ length: 10 }, (_, i) => addDays(new Date(), i + 1));

const ClientAppointments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<"upcoming" | "book">("upcoming");
  const [designer, setDesigner] = useState<string | null>(null);
  const [service, setService] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const canBook = designer && service && date && time;

  const handleBook = () => {
    if (!canBook) return;
    const d = availableDesigners.find((x) => x.id === designer);
    toast({
      title: "Booking requested",
      description: `${service} with ${d?.name} on ${format(date!, "MMM d")} at ${time}`,
    });
    setDesigner(null); setService(null); setDate(null); setTime(null);
    setTab("upcoming");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/50">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground">Appointments</h1>
          <p className="text-[11px] text-muted-foreground">Book fittings, measurements and consultations</p>
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className="flex gap-1 mb-4 bg-secondary rounded-xl p-1">
          {(["upcoming", "book"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition",
                tab === t ? "bg-card text-foreground" : "text-muted-foreground"
              )}
            >
              {t === "upcoming" ? `Upcoming (${upcoming.length})` : "Book New"}
            </button>
          ))}
        </div>

        {tab === "upcoming" && (
          <div className="space-y-3">
            {upcoming.map((appt, i) => (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-surface p-4"
              >
                <div className="flex items-start gap-3">
                  <img src={appt.avatar} alt={appt.designer} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{appt.designer}</p>
                      <span
                        className={cn(
                          "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase",
                          appt.status === "confirmed"
                            ? "bg-status-completed/20 text-status-completed"
                            : "bg-primary/20 text-primary"
                        )}
                      >
                        {appt.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{appt.service}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" /> {format(appt.date, "EEE, MMM d")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {appt.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {appt.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => toast({ title: "Reschedule request sent" })}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold bg-secondary text-foreground"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => toast({ title: "Appointment cancelled" })}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold bg-destructive/10 text-destructive flex items-center justify-center gap-1"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                </div>
              </motion.div>
            ))}
            <button
              onClick={() => setTab("book")}
              className="w-full py-3 rounded-xl border border-dashed border-border text-xs font-semibold text-muted-foreground flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Book New Appointment
            </button>
          </div>
        )}

        {tab === "book" && (
          <div className="space-y-5">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Choose designer</p>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {availableDesigners.map((d) => (
                  <motion.button
                    key={d.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDesigner(d.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 flex-shrink-0 p-2 rounded-xl border transition",
                      designer === d.id ? "border-primary bg-primary/10" : "border-transparent"
                    )}
                  >
                    <img src={d.avatar} alt={d.name} className="w-14 h-14 rounded-full object-cover" />
                    <span className="text-[11px] font-medium text-foreground">{d.name}</span>
                    <span className="text-[9px] text-muted-foreground">{d.specialty}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Service</p>
              <div className="grid grid-cols-2 gap-2">
                {services.map((s) => (
                  <motion.button
                    key={s}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setService(s)}
                    className={cn(
                      "py-3 rounded-xl text-xs font-semibold border transition",
                      service === s
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground"
                    )}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Select date</p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {quickDates.map((d) => (
                  <motion.button
                    key={d.toISOString()}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDate(d)}
                    className={cn(
                      "flex flex-col items-center min-w-[3.5rem] px-3 py-2 rounded-xl border transition-all flex-shrink-0",
                      date && isSameDay(d, date) ? "border-primary bg-primary/10" : "border-border bg-card"
                    )}
                  >
                    <span className="text-[10px] uppercase text-muted-foreground">{format(d, "EEE")}</span>
                    <span className="text-lg font-semibold text-foreground">{format(d, "d")}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Pick a time</p>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((t) => (
                  <motion.button
                    key={t}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTime(t)}
                    className={cn(
                      "py-2 rounded-xl text-xs font-medium border transition",
                      time === t
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground"
                    )}
                  >
                    {t}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={!canBook}
              onClick={handleBook}
              className={cn(
                "w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                canBook ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              <Check className="w-4 h-4" /> Request Appointment
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientAppointments;