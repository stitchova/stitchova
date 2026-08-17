import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Phone, Star, X, Save, Trash2, ChevronRight, Loader2,
  User, Shield, Briefcase, Scissors, Clock, DollarSign, BarChart3,
  Camera, MapPin, Mail, Calendar, AlertCircle, Heart, CheckCircle2,
  Eye, Edit2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import WorkerProgressTracker from "@/components/WorkerProgressTracker";
import { useAtelier } from "@/contexts/AtelierContext";
import WorkersWorkspace from "@/components/designer-desktop/WorkersWorkspace";

// Map the demo worker roster (Workers.tsx) to shared workshop IDs so real
// stage-history / task activity can flow into their performance numbers.
const WORKER_ID_BY_NAME: Record<string, string> = {
  "Kwame Asante": "w-kwame",
  "Esi Darkwa": "w-esi",
};

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface Worker {
  id: string;
  // Basic Personal Info
  fullName: string;
  profilePhoto: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  homeAddress: string;
  // ID & Verification
  idType: string;
  idNumber: string;
  emergencyContact: EmergencyContact;
  // Work Info
  role: string;
  skillLevel: string;
  yearsOfExperience: string;
  // Specialization
  specializations: string[];
  // Availability
  availabilityStatus: string;
  workingDays: string[];
  workingHours: string;
  // Payment
  paymentType: string;
  salaryAmount: string;
  // Employment
  dateHired: string;
  employmentType: string;
  status: string;
  // Performance (tracked)
  tasksCompleted: number;
  ordersWorkedOn: number;
  completionRate: number;
  onTimeRate: number;
  qualityRating: number;
  mistakeCount: number;
}

const roleOptions = ["Cutter", "Tailor", "Designer Assistant", "Beader", "Finisher", "Pattern Maker", "Apprentice", "Other"];
const skillLevels = ["Beginner", "Intermediate", "Expert"];
const specializations = ["Men's Wear", "Women's Wear", "Bridal", "Traditional", "Kids Wear"];
const availabilityOptions = ["Available", "Busy", "Off"];
const paymentTypes = ["Salary", "Per Job", "Commission"];
const employmentTypes = ["Full-time", "Part-time", "Contract"];
const statusOptions = ["Active", "Inactive", "Suspended"];
const idTypes = ["National ID", "Passport", "Driver's License", "Voter's ID"];
const genderOptions = ["Male", "Female", "Other"];
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const defaultWorkers: Worker[] = [
  {
    id: "1", fullName: "Kwame Asante", profilePhoto: "", gender: "Male", dateOfBirth: "1990-05-15",
    phone: "024 555 1234", email: "kwame@mail.com", homeAddress: "Accra, East Legon",
    idType: "National ID", idNumber: "GHA-XXXX-1234",
    emergencyContact: { name: "Ama Asante", phone: "024 555 0000", relationship: "Wife" },
    role: "Tailor", skillLevel: "Expert", yearsOfExperience: "12",
    specializations: ["Men's Wear", "Traditional"],
    availabilityStatus: "Available", workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"], workingHours: "8AM - 5PM",
    paymentType: "Salary", salaryAmount: "GHS 3,500",
    dateHired: "2020-01-10", employmentType: "Full-time", status: "Active",
    tasksCompleted: 156, ordersWorkedOn: 89, completionRate: 96, onTimeRate: 94, qualityRating: 4.8, mistakeCount: 3,
  },
  {
    id: "2", fullName: "Esi Darkwa", profilePhoto: "", gender: "Female", dateOfBirth: "1995-08-22",
    phone: "020 333 5678", email: "", homeAddress: "Kumasi, Adum",
    idType: "Voter's ID", idNumber: "GHA-YYYY-5678",
    emergencyContact: { name: "Kofi Darkwa", phone: "020 333 0000", relationship: "Brother" },
    role: "Beader", skillLevel: "Intermediate", yearsOfExperience: "5",
    specializations: ["Bridal", "Women's Wear"],
    availabilityStatus: "Available", workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], workingHours: "9AM - 6PM",
    paymentType: "Per Job", salaryAmount: "GHS 150/job",
    dateHired: "2022-03-15", employmentType: "Part-time", status: "Active",
    tasksCompleted: 98, ordersWorkedOn: 62, completionRate: 92, onTimeRate: 88, qualityRating: 4.6, mistakeCount: 5,
  },
];

const formSteps = [
  { icon: User, label: "Personal Info", emoji: "🪪" },
  { icon: Shield, label: "Verification", emoji: "🧾" },
  { icon: Briefcase, label: "Work Info", emoji: "💼" },
  { icon: Scissors, label: "Specialization", emoji: "🧵" },
  { icon: Clock, label: "Availability", emoji: "🕒" },
  { icon: DollarSign, label: "Payment", emoji: "💰" },
  { icon: BarChart3, label: "Employment", emoji: "📍" },
];

const inputClass = "w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors";

const Workers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workers, setWorkers] = useState<Worker[]>(defaultWorkers);
  const { orders, tasks } = useAtelier();

  // Derive live counters from real stage history + task completions so newly
  // advanced stages actually move a worker's numbers beyond the seed baseline.
  const liveStatsFor = (w: Worker) => {
    const wid = WORKER_ID_BY_NAME[w.fullName];
    if (!wid) return { tasksCompleted: w.tasksCompleted, ordersWorkedOn: w.ordersWorkedOn, completionRate: w.completionRate, onTimeRate: w.onTimeRate };
    const workerTasks = tasks.filter((t) => t.workerId === wid);
    const doneTasks = workerTasks.filter((t) => t.status === "completed");
    const historyEntries = orders.flatMap((o) =>
      (o.stageHistory || []).filter((h) => h.workerId === wid).map((h) => ({ o, h }))
    );
    const extraCompleted = doneTasks.length;
    const extraOrders = new Set([
      ...workerTasks.map((t) => t.orderId),
      ...historyEntries.map((x) => x.o.id),
    ]).size;
    // On-time = stage history timestamp before today (proxy: always on-time for
    // demo unless the parent order is past dueDate at completion).
    const onTimeExtras = historyEntries.filter((x) => {
      if (x.h.stageIdx !== x.o.stages.length - 1) return true;
      return true; // simplified: prototype has no absolute due timestamp
    }).length;
    const onTimeFails = historyEntries.length - onTimeExtras;
    const totalOnTime = Math.round((w.onTimeRate * 100 + onTimeExtras * 100) / Math.max(1, 100 + historyEntries.length));
    const totalCompletion = Math.round((w.completionRate * 100 + extraCompleted * 100) / Math.max(1, 100 + workerTasks.length));
    return {
      tasksCompleted: w.tasksCompleted + extraCompleted,
      ordersWorkedOn: Math.max(w.ordersWorkedOn, w.ordersWorkedOn + extraOrders - (WORKER_ID_BY_NAME[w.fullName] ? 0 : 0)),
      completionRate: workerTasks.length ? totalCompletion : w.completionRate,
      onTimeRate: historyEntries.length ? totalOnTime : w.onTimeRate,
      _onTimeFails: onTimeFails,
    };
  };

  // Wrap the raw worker with live-derived stats for display.
  const enrichWorker = (w: Worker): Worker => {
    const s = liveStatsFor(w);
    return { ...w, tasksCompleted: s.tasksCompleted, ordersWorkedOn: s.ordersWorkedOn, completionRate: s.completionRate, onTimeRate: s.onTimeRate };
  };

  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [viewingWorker, setViewingWorker] = useState<Worker | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState("overview");

  const emptyForm: Omit<Worker, "id" | "tasksCompleted" | "ordersWorkedOn" | "completionRate" | "onTimeRate" | "qualityRating" | "mistakeCount"> = {
    fullName: "", profilePhoto: "", gender: "", dateOfBirth: "", phone: "", email: "", homeAddress: "",
    idType: "", idNumber: "",
    emergencyContact: { name: "", phone: "", relationship: "" },
    role: "", skillLevel: "", yearsOfExperience: "",
    specializations: [],
    availabilityStatus: "Available", workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"], workingHours: "",
    paymentType: "", salaryAmount: "",
    dateHired: new Date().toISOString().split("T")[0], employmentType: "", status: "Active",
  };

  const [form, setForm] = useState(emptyForm);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  const toggleSpecialization = (s: string) => {
    setForm((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(s)
        ? prev.specializations.filter((x) => x !== s)
        : [...prev.specializations, s],
    }));
  };

  const toggleWorkingDay = (d: string) => {
    setForm((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(d)
        ? prev.workingDays.filter((x) => x !== d)
        : [...prev.workingDays, d],
    }));
  };

  const handleAdd = async () => {
    if (registering) return;
    if (!form.fullName.trim() || !form.phone.trim() || !form.role) {
      toast({ title: "Missing required fields", description: "Name, phone and role are required.", variant: "destructive" });
      return;
    }
    setRegistering(true);
    await new Promise((r) => setTimeout(r, 500));
    const newWorker: Worker = {
      ...form,
      id: Date.now().toString(),
      tasksCompleted: 0, ordersWorkedOn: 0, completionRate: 0, onTimeRate: 0, qualityRating: 0, mistakeCount: 0,
    };
    setWorkers((prev) => [newWorker, ...prev]);
    setForm(emptyForm);
    setShowForm(false);
    setCurrentStep(0);
    toast({ title: "Worker registered ✅", description: `${newWorker.fullName} has been added to your team.` });
    setRegistering(false);
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    await new Promise((r) => setTimeout(r, 350));
    setWorkers((prev) => prev.filter((w) => w.id !== id));
    toast({ title: "Worker removed" });
    setDeletingId(null);
    if (viewingWorker?.id === id) setViewingWorker(null);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return form.fullName.trim() && form.phone.trim();
      case 1: return true;
      case 2: return !!form.role;
      default: return true;
    }
  };

  // Chip selector helper
  const ChipSelect = ({ options, value, onChange, multi = false, selectedValues }: {
    options: string[]; value?: string; onChange: (v: string) => void; multi?: boolean; selectedValues?: string[];
  }) => (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = multi ? selectedValues?.includes(opt) : value === opt;
        return (
          <motion.button key={opt} type="button" whileTap={{ scale: 0.95 }} onClick={() => onChange(opt)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              isSelected ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
            )}
          >
            {opt}
          </motion.button>
        );
      })}
    </div>
  );

  // ── WORKER PROFILE VIEW ──
  if (viewingWorker) {
    const w = enrichWorker(viewingWorker);
    const profileTabs = [
      { key: "overview", label: "Overview" },
      { key: "performance", label: "Performance" },
      { key: "details", label: "Details" },
    ];

    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/50">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setViewingWorker(null)}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <h1 className="text-lg font-semibold text-foreground flex-1">Worker Profile</h1>
          <motion.button whileTap={{ scale: 0.9 }} disabled={deletingId === w.id}
            onClick={() => handleDelete(w.id)} className="text-muted-foreground disabled:opacity-60">
            {deletingId === w.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </motion.button>
        </div>

        {/* Hero card */}
        <div className="px-5 pt-5">
          <div className="card-surface p-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-foreground">
                {w.fullName.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-foreground">{w.fullName}</p>
              <p className="text-xs text-primary font-medium">{w.role} · {w.skillLevel}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                  w.status === "Active" ? "bg-green-500/10 text-green-400" :
                  w.status === "Suspended" ? "bg-destructive/10 text-destructive" :
                  "bg-muted text-muted-foreground"
                )}>{w.status}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                  w.availabilityStatus === "Available" ? "bg-green-500/10 text-green-400" :
                  w.availabilityStatus === "Busy" ? "bg-primary/10 text-primary" :
                  "bg-muted text-muted-foreground"
                )}>{w.availabilityStatus}</span>
              </div>
            </div>
            {w.qualityRating > 0 && (
              <div className="text-center flex-shrink-0">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-lg font-bold text-foreground">{w.qualityRating}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Rating</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 mt-4">
          <div className="flex gap-1 bg-card rounded-xl p-1">
            {profileTabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveProfileTab(tab.key)}
                className={cn(
                  "flex-1 py-2 text-xs font-semibold rounded-lg transition-all",
                  activeProfileTab === tab.key ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >{tab.label}</button>
            ))}
          </div>
        </div>

        <div className="px-5 pt-4 space-y-3 pb-6">
          {activeProfileTab === "overview" && (
            <>
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Tasks Done", value: w.tasksCompleted },
                  { label: "Orders", value: w.ordersWorkedOn },
                  { label: "On-time", value: `${w.onTimeRate}%` },
                ].map((s) => (
                  <div key={s.label} className="card-surface p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Contact */}
              <div className="card-surface p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">{w.phone}</span>
                  </div>
                  {w.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">{w.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">{w.homeAddress || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Specializations */}
              <div className="card-surface p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Specializations</p>
                <div className="flex flex-wrap gap-2">
                  {w.specializations.length > 0 ? w.specializations.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">{s}</span>
                  )) : <span className="text-xs text-muted-foreground">None specified</span>}
                </div>
              </div>

              {/* Schedule */}
              <div className="card-surface p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Schedule</p>
                <div className="flex gap-1 mb-2">
                  {daysOfWeek.map((d) => (
                    <span key={d} className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold",
                      w.workingDays.includes(d) ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted/50 text-muted-foreground/40"
                    )}>{d}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{w.workingHours || "Not specified"}</p>
              </div>
            </>
          )}

          {activeProfileTab === "performance" && (
            <>
              {/* Performance cards */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Completion Rate", value: `${w.completionRate}%`, color: w.completionRate >= 90 ? "text-green-400" : "text-primary" },
                  { label: "On-time Delivery", value: `${w.onTimeRate}%`, color: w.onTimeRate >= 90 ? "text-green-400" : "text-primary" },
                  { label: "Quality Rating", value: `${w.qualityRating}/5`, color: w.qualityRating >= 4.5 ? "text-green-400" : "text-primary" },
                  { label: "Corrections", value: w.mistakeCount.toString(), color: w.mistakeCount <= 3 ? "text-green-400" : "text-destructive" },
                ].map((p) => (
                  <div key={p.label} className="card-surface p-4 text-center">
                    <p className={cn("text-xl font-bold", p.color)}>{p.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{p.label}</p>
                  </div>
                ))}
              </div>

              {/* AI Insights placeholder */}
              <div className="card-surface p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">🧠</span>
                  <p className="text-xs font-semibold text-primary">AI Insights</p>
                </div>
                <div className="space-y-2">
                  {w.qualityRating >= 4.7 && (
                    <p className="text-xs text-muted-foreground">⭐ Top performer — consistently high quality</p>
                  )}
                  {w.onTimeRate >= 90 && (
                    <p className="text-xs text-muted-foreground">⚡ Reliable — excellent on-time delivery rate</p>
                  )}
                  {w.specializations.includes("Bridal") && (
                    <p className="text-xs text-muted-foreground">💍 Best suited for bridal projects</p>
                  )}
                  {w.mistakeCount > 5 && (
                    <p className="text-xs text-muted-foreground">⚠️ Needs improvement in accuracy</p>
                  )}
                  {w.tasksCompleted > 100 && (
                    <p className="text-xs text-muted-foreground">🏆 Highly experienced — {w.tasksCompleted} tasks completed</p>
                  )}
                </div>
              </div>

              {/* Summary stats */}
              <div className="card-surface p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Summary</p>
                {[
                  { label: "Total Tasks Completed", value: w.tasksCompleted },
                  { label: "Orders Worked On", value: w.ordersWorkedOn },
                  { label: "Experience", value: `${w.yearsOfExperience} years` },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-1">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-sm font-semibold text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeProfileTab === "details" && (
            <>
              {/* Personal */}
              <div className="card-surface p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Personal Information</p>
                {[
                  { label: "Gender", value: w.gender },
                  { label: "Date of Birth", value: w.dateOfBirth },
                  { label: "Address", value: w.homeAddress },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-1">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-sm text-foreground">{row.value || "—"}</span>
                  </div>
                ))}
              </div>

              {/* ID */}
              <div className="card-surface p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Identification</p>
                {[
                  { label: "ID Type", value: w.idType },
                  { label: "ID Number", value: w.idNumber },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-1">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-sm text-foreground">{row.value || "—"}</span>
                  </div>
                ))}
              </div>

              {/* Emergency contact */}
              <div className="card-surface p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-destructive" /> Emergency Contact
                </p>
                {[
                  { label: "Name", value: w.emergencyContact.name },
                  { label: "Phone", value: w.emergencyContact.phone },
                  { label: "Relationship", value: w.emergencyContact.relationship },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-1">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-sm text-foreground">{row.value || "—"}</span>
                  </div>
                ))}
              </div>

              {/* Payment */}
              <div className="card-surface p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment & Salary</p>
                {[
                  { label: "Payment Type", value: w.paymentType },
                  { label: "Amount / Rate", value: w.salaryAmount },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-1">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-sm text-foreground">{row.value || "—"}</span>
                  </div>
                ))}
              </div>

              {/* Employment */}
              <div className="card-surface p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employment</p>
                {[
                  { label: "Date Hired", value: w.dateHired },
                  { label: "Employment Type", value: w.employmentType },
                  { label: "Status", value: w.status },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-1">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-sm text-foreground">{row.value || "—"}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── MAIN LIST + FORM VIEW ──
  return (
    <>
      {/* Tablet/desktop worker management */}
      <WorkersWorkspace />

      {/* Mobile view (unchanged) */}
      <div className="min-h-screen bg-background pb-24 lg:hidden">
      <div className="sticky top-0 z-10 bg-background/70 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/50">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <h1 className="text-lg font-bold shimmer-text flex-1">Workers</h1>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { setShowForm(!showForm); setCurrentStep(0); }}
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center glow-primary"
        >
          {showForm ? <X className="w-4 h-4 text-primary-foreground" /> : <Plus className="w-4 h-4 text-primary-foreground" />}
        </motion.button>
      </div>

      <div className="px-5 pt-4 space-y-3">
        {/* ── MULTI-STEP REGISTRATION FORM ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="card-surface p-4 space-y-4 mb-3">
                {/* Step indicator */}
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {formSteps.map((step, i) => (
                    <button key={i} onClick={() => setCurrentStep(i)}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all flex-shrink-0",
                        i === currentStep ? "bg-primary text-primary-foreground" :
                        i < currentStep ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}
                    >
                      <span>{step.emoji}</span> {step.label}
                    </button>
                  ))}
                </div>

                {/* Step 0: Personal Info */}
                {currentStep === 0 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">🪪 Personal Information</p>
                    <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Full name *" className={inputClass} />
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Gender</p>
                      <ChipSelect options={genderOptions} value={form.gender} onChange={(v) => setForm({ ...form, gender: v })} />
                    </div>
                    <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                      className={inputClass} />
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Phone number *" className={inputClass} />
                    <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Email address (optional)" className={inputClass} />
                    <input value={form.homeAddress} onChange={(e) => setForm({ ...form, homeAddress: e.target.value })}
                      placeholder="Home address" className={inputClass} />
                  </motion.div>
                )}

                {/* Step 1: Verification */}
                {currentStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">🧾 Identification & Verification</p>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">ID Type</p>
                      <ChipSelect options={idTypes} value={form.idType} onChange={(v) => setForm({ ...form, idType: v })} />
                    </div>
                    <input value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                      placeholder="ID Number" className={inputClass} />

                    <div className="border-t border-border/50 pt-3">
                      <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-destructive" /> Emergency Contact
                      </p>
                      <div className="space-y-2">
                        <input value={form.emergencyContact.name}
                          onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, name: e.target.value } })}
                          placeholder="Contact name" className={inputClass} />
                        <input value={form.emergencyContact.phone}
                          onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, phone: e.target.value } })}
                          placeholder="Contact phone" className={inputClass} />
                        <input value={form.emergencyContact.relationship}
                          onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, relationship: e.target.value } })}
                          placeholder="Relationship (e.g. Wife, Brother)" className={inputClass} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Work Info */}
                {currentStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">💼 Work Information</p>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Role / Position *</p>
                      <ChipSelect options={roleOptions} value={form.role} onChange={(v) => setForm({ ...form, role: v })} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Skill Level</p>
                      <ChipSelect options={skillLevels} value={form.skillLevel} onChange={(v) => setForm({ ...form, skillLevel: v })} />
                    </div>
                    <input value={form.yearsOfExperience} onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value })}
                      placeholder="Years of experience" type="number" className={inputClass} />
                  </motion.div>
                )}

                {/* Step 3: Specialization */}
                {currentStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">🧵 Specialization</p>
                    <p className="text-xs text-muted-foreground">Select all that apply</p>
                    <ChipSelect options={specializations} multi selectedValues={form.specializations} onChange={toggleSpecialization} />
                  </motion.div>
                )}

                {/* Step 4: Availability */}
                {currentStep === 4 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">🕒 Availability & Schedule</p>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Status</p>
                      <ChipSelect options={availabilityOptions} value={form.availabilityStatus} onChange={(v) => setForm({ ...form, availabilityStatus: v })} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Working Days</p>
                      <div className="flex gap-1">
                        {daysOfWeek.map((d) => (
                          <motion.button key={d} type="button" whileTap={{ scale: 0.9 }} onClick={() => toggleWorkingDay(d)}
                            className={cn(
                              "w-10 h-10 rounded-lg text-xs font-bold transition-all",
                              form.workingDays.includes(d) ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted text-muted-foreground"
                            )}
                          >{d}</motion.button>
                        ))}
                      </div>
                    </div>
                    <input value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                      placeholder="Working hours (e.g. 8AM - 5PM)" className={inputClass} />
                  </motion.div>
                )}

                {/* Step 5: Payment */}
                {currentStep === 5 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">💰 Payment & Salary</p>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Payment Type</p>
                      <ChipSelect options={paymentTypes} value={form.paymentType} onChange={(v) => setForm({ ...form, paymentType: v })} />
                    </div>
                    <input value={form.salaryAmount} onChange={(e) => setForm({ ...form, salaryAmount: e.target.value })}
                      placeholder="Amount / Rate (e.g. GHS 3,500)" className={inputClass} />
                  </motion.div>
                )}

                {/* Step 6: Employment */}
                {currentStep === 6 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">📍 Employment Details</p>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Date Hired</p>
                      <input type="date" value={form.dateHired} onChange={(e) => setForm({ ...form, dateHired: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Employment Type</p>
                      <ChipSelect options={employmentTypes} value={form.employmentType} onChange={(v) => setForm({ ...form, employmentType: v })} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Status</p>
                      <ChipSelect options={statusOptions} value={form.status} onChange={(v) => setForm({ ...form, status: v })} />
                    </div>
                  </motion.div>
                )}

                {/* Navigation buttons */}
                <div className="flex gap-2 pt-2">
                  {currentStep > 0 && (
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => setCurrentStep((s) => s - 1)}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-sm border border-border text-muted-foreground"
                    >Back</motion.button>
                  )}
                  {currentStep < formSteps.length - 1 ? (
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => canProceed() && setCurrentStep((s) => s + 1)}
                      disabled={!canProceed()}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                        canProceed() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >Next <ChevronRight className="w-4 h-4" /></motion.button>
                  ) : (
                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd} disabled={registering}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {registering ? "Registering..." : "Register Worker"}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Worker Progress & Activity */}
        {!showForm && <WorkerProgressTracker />}

        {/* ── WORKER LIST ── */}
        <div className="flex items-center justify-between mt-2">
          <h2 className="text-sm font-semibold text-foreground">Your Team</h2>
          <span className="text-[10px] text-muted-foreground">{workers.length} workers</span>
        </div>
        {workers.map((raw, i) => {
          const w = enrichWorker(raw);
          return (
          <motion.div
            key={w.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setViewingWorker(raw)}
            className="card-surface p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-foreground">{w.fullName.split(" ").map((n) => n[0]).join("")}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{w.fullName}</p>
              <p className="text-[11px] text-primary font-medium">{w.role} · {w.skillLevel}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Phone className="w-3 h-3" /> {w.phone}
                </span>
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[9px] font-semibold",
                  w.availabilityStatus === "Available" ? "bg-green-500/10 text-green-400" :
                  w.availabilityStatus === "Busy" ? "bg-primary/10 text-primary" :
                  "bg-muted text-muted-foreground"
                )}>{w.availabilityStatus}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0 flex items-center gap-2">
              <div>
                {w.qualityRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                    <span className="text-sm font-semibold text-foreground">{w.qualityRating}</span>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground">{w.tasksCompleted} tasks</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            </div>
          </motion.div>
          );
        })}
      </div>
      </div>
    </>
  );
};

export default Workers;
