import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, ChevronRight, Plus, X, History, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const genders = [
  { id: "male", label: "Male", emoji: "👨" },
  { id: "female", label: "Female", emoji: "👩" },
];

const ageGroups = [
  { id: "child", label: "Child", desc: "0–12 yrs" },
  { id: "teen", label: "Teen", desc: "13–17 yrs" },
  { id: "adult", label: "Adult", desc: "18–59 yrs" },
  { id: "elder", label: "Elder", desc: "60+ yrs" },
];

const categories = [
  { id: "men", label: "Men", emoji: "👔" },
  { id: "women", label: "Women", emoji: "👗" },
  { id: "children", label: "Children", emoji: "🧒" },
];

const garmentTypes: Record<string, { label: string; emoji: string }[]> = {
  men: [
    { label: "Agbada", emoji: "🥻" }, { label: "Senator", emoji: "👔" }, { label: "Kaftan", emoji: "🧥" },
    { label: "Suit", emoji: "🤵" }, { label: "Shirt", emoji: "👕" }, { label: "Trouser", emoji: "👖" },
    { label: "Blazer", emoji: "🧥" },
  ],
  women: [
    { label: "Blouse", emoji: "👚" }, { label: "Skirt", emoji: "👗" }, { label: "Gown", emoji: "💃" },
    { label: "Iro & Buba", emoji: "🥻" }, { label: "Jumpsuit", emoji: "🩱" }, { label: "Wrapper", emoji: "👘" },
    { label: "Bridal", emoji: "👰" },
  ],
  children: [
    { label: "Shirt", emoji: "👕" }, { label: "Dress", emoji: "👗" }, { label: "Trouser", emoji: "👖" },
    { label: "Agbada", emoji: "🥻" }, { label: "Uniform", emoji: "🎓" },
  ],
};

const defaultMeasurementFields: Record<string, string[]> = {
  Agbada: ["Chest", "Shoulder", "Sleeve", "Length", "Round Arm", "Neck"],
  Senator: ["Chest", "Shoulder", "Sleeve", "Length", "Round Arm", "Neck"],
  Kaftan: ["Chest", "Shoulder", "Sleeve", "Length", "Round Arm"],
  Suit: ["Chest", "Shoulder", "Sleeve", "Length", "Waist", "Hip", "Trouser Length", "Thigh"],
  Shirt: ["Chest", "Shoulder", "Sleeve", "Length", "Neck", "Round Arm"],
  Trouser: ["Waist", "Hip", "Thigh", "Knee", "Length", "Bottom"],
  Blazer: ["Chest", "Shoulder", "Sleeve", "Back Length", "Waist"],
  Blouse: ["Bust", "Shoulder", "Sleeve", "Length", "Round Arm", "Under Bust"],
  Skirt: ["Waist", "Hip", "Length", "Knee"],
  Gown: ["Bust", "Waist", "Hip", "Shoulder", "Sleeve", "Length", "Under Bust"],
  "Iro & Buba": ["Bust", "Shoulder", "Sleeve", "Blouse Length", "Wrapper Length", "Hip"],
  Jumpsuit: ["Bust", "Waist", "Hip", "Shoulder", "Sleeve", "Full Length", "Inseam"],
  Wrapper: ["Waist", "Hip", "Length"],
  Bridal: ["Bust", "Waist", "Hip", "Shoulder", "Sleeve", "Full Length", "Under Bust", "Train Length"],
  Dress: ["Chest", "Shoulder", "Length", "Waist"],
  Uniform: ["Chest", "Shoulder", "Sleeve", "Length", "Waist", "Trouser Length"],
};

const measurementHistory = [
  { date: "Mar 15, 2024", garment: "Gown", fields: { Bust: '36"', Waist: '28"', Hip: '38"' } },
  { date: "Jan 10, 2024", garment: "Blouse", fields: { Bust: '35.5"', Shoulder: '15"', Sleeve: '24"' } },
  { date: "Nov 5, 2023", garment: "Gown", fields: { Bust: '35"', Waist: '27.5"', Hip: '37.5"' } },
];

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const Measurements = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"select" | "fields" | "history">("select");
  const [gender, setGender] = useState("female");
  const [ageGroup, setAgeGroup] = useState("adult");
  const [category, setCategory] = useState("women");
  const [garment, setGarment] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [showAddField, setShowAddField] = useState(false);

  const defaultFields = garment ? (defaultMeasurementFields[garment] || []) : [];
  const allFields = [...defaultFields, ...customFields];

  const handleAddField = () => {
    const name = newFieldName.trim();
    if (!name) return;
    if (allFields.includes(name)) {
      toast({ title: "Field exists", description: `"${name}" is already in the list.`, variant: "destructive" });
      return;
    }
    setCustomFields((prev) => [...prev, name]);
    setNewFieldName("");
    setShowAddField(false);
    toast({ title: "Field added", description: `"${name}" added to measurements.` });
  };

  const handleRemoveField = (field: string) => {
    if (defaultFields.includes(field)) {
      toast({ title: "Cannot remove", description: "Default fields cannot be removed.", variant: "destructive" });
      return;
    }
    setCustomFields((prev) => prev.filter((f) => f !== field));
    const newValues = { ...values };
    delete newValues[field];
    setValues(newValues);
  };

  const handleSave = () => {
    toast({ title: "Measurements saved!", description: `${garment} measurements for ${clientName || "client"} recorded.` });
    navigate(-1);
  };

  const handleBack = () => {
    if (step === "fields") { setGarment(null); setStep("select"); }
    else if (step === "history") setStep("select");
    else navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/50">
        <motion.button whileTap={{ scale: 0.9 }} onClick={handleBack}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <h1 className="text-lg font-semibold text-foreground flex-1">
          {step === "history" ? "Measurement History" : garment ? `${garment} Measurements` : "New Measurement"}
        </h1>
        {step === "select" && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setStep("history")}
            className="flex items-center gap-1 text-xs text-primary font-medium">
            <History className="w-3.5 h-3.5" /> History
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === "history" ? (
          <motion.div key="history" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" className="px-5 pt-4 space-y-4">
            <p className="text-sm text-muted-foreground">Track measurement changes over time</p>
            {measurementHistory.map((entry, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="card-glass p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{entry.garment}</p>
                  <span className="text-[10px] text-muted-foreground">{entry.date}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(entry.fields).map(([k, v]) => (
                    <div key={k} className="bg-secondary/50 rounded-lg p-2 text-center">
                      <p className="text-[9px] text-muted-foreground uppercase">{k}</p>
                      <p className="text-sm font-bold text-foreground">{v}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : step === "select" ? (
          <motion.div key="select" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" className="px-5 pt-4 space-y-5">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Client Name</label>
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Enter client name"
                className="w-full bg-card border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Gender</label>
              <div className="flex gap-2">
                {genders.map((g) => (
                  <motion.button key={g.id} whileTap={{ scale: 0.95 }} onClick={() => { setGender(g.id); setCategory(g.id === "male" ? "men" : "women"); }}
                    className={cn("flex-1 py-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-1",
                      gender === g.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground")}>
                    <span className="text-xl">{g.emoji}</span>{g.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Age Group</label>
              <div className="grid grid-cols-4 gap-2">
                {ageGroups.map((a) => (
                  <motion.button key={a.id} whileTap={{ scale: 0.95 }} onClick={() => setAgeGroup(a.id)}
                    className={cn("py-2.5 rounded-xl border text-center transition-all",
                      ageGroup === a.id ? "border-primary bg-primary/10" : "border-border bg-card")}>
                    <span className={cn("text-xs font-medium block", ageGroup === a.id ? "text-primary" : "text-foreground")}>{a.label}</span>
                    <span className="text-[9px] text-muted-foreground">{a.desc}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Category</label>
              <div className="flex gap-2">
                {categories.map((c) => (
                  <motion.button key={c.id} whileTap={{ scale: 0.95 }} onClick={() => setCategory(c.id)}
                    className={cn("flex-1 py-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-1",
                      category === c.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground")}>
                    <span className="text-xl">{c.emoji}</span>{c.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Garment Type</label>
              <div className="grid grid-cols-2 gap-3">
                {(garmentTypes[category] || []).map((g) => (
                  <motion.button key={g.label} whileTap={{ scale: 0.96 }}
                    onClick={() => { setGarment(g.label); setValues({}); setCustomFields([]); setStep("fields"); }}
                    className="card-surface p-4 flex items-center gap-3 border border-transparent hover:border-border transition-all text-left">
                    <span className="text-2xl">{g.emoji}</span>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">{g.label}</span>
                      <span className="block text-[11px] text-muted-foreground">{defaultMeasurementFields[g.label]?.length || 0} fields</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="fields" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" className="px-5 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">All measurements in inches</p>
                <p className="text-[10px] text-primary">{gender === "male" ? "👨 Male" : "👩 Female"} · {ageGroups.find(a => a.id === ageGroup)?.label}</p>
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAddField(true)}
                className="text-xs text-primary font-medium flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Field
              </motion.button>
            </div>

            <AnimatePresence>
              {showAddField && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="flex gap-2">
                    <input value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} placeholder="e.g. Back Width"
                      onKeyDown={(e) => e.key === "Enter" && handleAddField()} autoFocus
                      className="flex-1 bg-card border border-border rounded-xl py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors" />
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddField}
                      className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Add</motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setShowAddField(false); setNewFieldName(""); }}
                      className="px-3 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm"><X className="w-4 h-4" /></motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-3">
              {allFields.map((field) => {
                const isCustom = customFields.includes(field);
                return (
                  <div key={field} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-muted-foreground">{field}</label>
                      {isCustom && (
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleRemoveField(field)} className="p-0.5">
                          <X className="w-3 h-3 text-destructive" />
                        </motion.button>
                      )}
                    </div>
                    <div className="relative">
                      <input type="number" inputMode="decimal" value={values[field] || ""}
                        onChange={(e) => setValues({ ...values, [field]: e.target.value })} placeholder="0.0"
                        className="w-full bg-card border border-border rounded-xl py-3 px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">in</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Notes (optional)</label>
              <textarea placeholder="Add fitting notes..." rows={3}
                className="w-full bg-card border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors resize-none" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {step === "fields" && garment && (
        <div className="fixed bottom-20 left-0 right-0 px-5">
          <div className="max-w-md mx-auto">
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
              className="w-full py-3.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Save Measurements
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Measurements;
