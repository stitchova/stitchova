import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Check, CalendarDays, Clock } from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const defaultTimeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "01:00 PM",
  "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM",
  "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM",
];

const serviceTypes = [
  { label: "Measurement", icon: "📏", duration: "30 min" },
  { label: "Fitting", icon: "👔", duration: "45 min" },
  { label: "Consultation", icon: "💬", duration: "1 hr" },
  { label: "Pickup", icon: "📦", duration: "15 min" },
];

const quickDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

interface AvailabilitySlot {
  id: string;
  date: Date;
  times: string[];
  services: string[];
}

const Appointments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [saved, setSaved] = useState(false);

  const toggleTime = (t: string) => {
    setSelectedTimes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const toggleService = (s: string) => {
    setSelectedServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const canAdd = !!selectedDate && selectedTimes.length > 0 && selectedServices.length > 0;

  const handleAddSlot = () => {
    if (!selectedDate) return;
    const newSlot: AvailabilitySlot = {
      id: Date.now().toString(),
      date: selectedDate,
      times: [...selectedTimes],
      services: [...selectedServices],
    };
    setSlots((prev) => [...prev, newSlot]);
    setSelectedDate(undefined);
    setSelectedTimes([]);
    setSelectedServices([]);
    toast({ title: "Slot added", description: `Availability set for ${format(newSlot.date, "MMM d")}` });
  };

  const removeSlot = (id: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    setSaved(true);
    toast({ title: "Availability saved!", description: `${slots.length} slot(s) published for client booking.` });
    setTimeout(() => navigate("/"), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/50">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground">Schedule Availability</h1>
          <p className="text-[11px] text-muted-foreground">Set your available times for client bookings</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {saved ? (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center px-6 pt-20 gap-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-status-completed/20 flex items-center justify-center"
            >
              <Check className="w-10 h-10 text-status-completed" />
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground">Availability Published!</h2>
            <p className="text-muted-foreground text-center text-sm">
              Clients can now book appointments on your available dates.
            </p>
          </motion.div>
        ) : (
          <motion.div key="form" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" className="px-5 pt-4 space-y-5">
            {/* Services */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Services you'll offer</p>
              <div className="grid grid-cols-2 gap-3">
                {serviceTypes.map((s) => (
                  <motion.button
                    key={s.label}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => toggleService(s.label)}
                    className={cn(
                      "card-surface p-3 flex items-center gap-3 border transition-all text-left",
                      selectedServices.includes(s.label) ? "border-primary bg-primary/10" : "border-transparent"
                    )}
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

            {/* Date */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Select date</p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {quickDates.map((d) => (
                  <motion.button
                    key={d.toISOString()}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(d)}
                    className={cn(
                      "flex flex-col items-center min-w-[3.5rem] px-3 py-2 rounded-xl border transition-all flex-shrink-0",
                      selectedDate && isSameDay(d, selectedDate) ? "border-primary bg-primary/10" : "border-border bg-card"
                    )}
                  >
                    <span className="text-[10px] uppercase text-muted-foreground">{format(d, "EEE")}</span>
                    <span className="text-lg font-semibold text-foreground">{format(d, "d")}</span>
                  </motion.button>
                ))}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="mt-2 text-xs text-primary flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" /> View full calendar
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time slots */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Available time slots</p>
              <div className="grid grid-cols-4 gap-2">
                {defaultTimeSlots.map((t) => (
                  <motion.button
                    key={t}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleTime(t)}
                    className={cn(
                      "py-2 rounded-xl text-xs font-medium border transition-all",
                      selectedTimes.includes(t) ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
                    )}
                  >
                    {t}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Add slot button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={!canAdd}
              onClick={handleAddSlot}
              className={cn(
                "w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                canAdd ? "bg-secondary text-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              <Plus className="w-4 h-4" /> Add Availability Slot
            </motion.button>

            {/* Added slots */}
            {slots.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Your Availability ({slots.length})</p>
                {slots.map((slot, i) => (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card-surface p-4 flex items-start gap-3"
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
                    </div>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => removeSlot(slot.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save button */}
      {!saved && slots.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-5">
          <div className="max-w-md mx-auto">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              className="w-full py-3.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Publish Availability ({slots.length} slots)
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
