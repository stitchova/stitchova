import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, MapPin, User, Check, CalendarDays } from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const timeSlots = [
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

const quickDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const Appointments = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const designerName = searchParams.get("name") || "Designer";
  const designerId = searchParams.get("designer") || "";
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const canProceed =
    step === 0 ? !!selectedService :
    step === 1 ? !!selectedDate && !!selectedTime :
    step === 2 ? clientName.trim().length > 0 : false;

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => navigate("/"), 2500);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/50">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <h1 className="text-lg font-semibold text-foreground">Book with {designerName}</h1>
      </div>

      {/* Step indicators */}
      <div className="px-6 pt-4 pb-2 flex gap-2">
        {[0, 1, 2].map((s) => (
          <div key={s} className={cn("h-1 flex-1 rounded-full transition-all duration-300", s <= step ? "bg-primary" : "bg-muted")} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Confirmation overlay */}
        {confirmed && (
          <motion.div
            key="confirmed"
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
            <h2 className="text-2xl font-bold text-foreground">Booking Confirmed!</h2>
            <p className="text-muted-foreground text-center text-sm">
              {selectedService} with {designerName}<br />
              {selectedDate && format(selectedDate, "EEEE, MMM d")} at {selectedTime}
            </p>
          </motion.div>
        )}

        {/* Step 0: Service selection */}
        {!confirmed && step === 0 && (
          <motion.div key="step0" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" className="px-5 pt-4 space-y-4">
            <p className="text-sm text-muted-foreground">Select service type</p>
            <div className="grid grid-cols-2 gap-3">
              {serviceTypes.map((s) => (
                <motion.button
                  key={s.label}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedService(s.label)}
                  className={cn(
                    "card-surface p-4 flex flex-col items-start gap-2 border transition-all",
                    selectedService === s.label ? "border-primary bg-primary/10" : "border-transparent"
                  )}
                >
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-sm font-medium text-foreground">{s.label}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {s.duration}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 1: Date & Time */}
        {!confirmed && step === 1 && (
          <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" className="px-5 pt-4 space-y-5">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Pick a date</p>
              {/* Quick date pills */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {quickDates.map((d) => (
                  <motion.button
                    key={d.toISOString()}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(d)}
                    className={cn(
                      "flex flex-col items-center min-w-[3.5rem] px-3 py-2 rounded-xl border transition-all",
                      selectedDate && isSameDay(d, selectedDate) ? "border-primary bg-primary/10" : "border-border bg-card"
                    )}
                  >
                    <span className="text-[10px] uppercase text-muted-foreground">{format(d, "EEE")}</span>
                    <span className="text-lg font-semibold text-foreground">{format(d, "d")}</span>
                  </motion.button>
                ))}
              </div>

              {/* Full calendar popover */}
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

            <div>
              <p className="text-sm text-muted-foreground mb-3">Select time</p>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((t) => (
                  <motion.button
                    key={t}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTime(t)}
                    className={cn(
                      "py-2 rounded-xl text-xs font-medium border transition-all",
                      selectedTime === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
                    )}
                  >
                    {t}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Client & Confirm */}
        {!confirmed && step === 2 && (
          <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" className="px-5 pt-4 space-y-5">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Client name</p>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                  className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Summary card */}
            <div className="card-elevated p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service</span>
                  <span className="text-foreground font-medium">{selectedService}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-foreground font-medium">{selectedDate && format(selectedDate, "MMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="text-foreground font-medium">{selectedTime}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom CTA */}
      {!confirmed && (
        <div className="fixed bottom-20 left-0 right-0 px-5">
          <div className="max-w-md mx-auto">
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={!canProceed}
              onClick={() => (step < 2 ? setStep(step + 1) : handleConfirm())}
              className={cn(
                "w-full py-3.5 rounded-xl font-semibold text-sm transition-all",
                canProceed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {step < 2 ? "Continue" : "Confirm Booking"}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
