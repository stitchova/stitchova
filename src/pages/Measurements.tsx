import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, ChevronRight, Plus, X, History, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAtelier } from "@/contexts/AtelierContext";
import { useBrandInvoice } from "@/contexts/BrandInvoiceContext";
import ClientPicker from "@/components/ClientPicker";
import { Image as ImageIcon } from "lucide-react";
import { genders, ageGroups, categories, garmentTypes, defaultMeasurementFields } from "@/constants/garments";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const Measurements = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addMeasurement, measurements, clientById, latestMeasurement, measurementTemplates, addTemplateField, removeTemplateField } = useAtelier();
  const { brand } = useBrandInvoice();
  const unit = brand.measurementUnit || "in";
  const [step, setStep] = useState<"select" | "fields" | "history">("select");
  const [gender, setGender] = useState("female");
  const [ageGroup, setAgeGroup] = useState("adult");
  const [category, setCategory] = useState("women");
  const [garment, setGarment] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [newFieldName, setNewFieldName] = useState("");
  const [showAddField, setShowAddField] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const defaultFields = garment ? (defaultMeasurementFields[garment] || []) : [];
  const templateFields = garment ? (measurementTemplates[garment] || []) : [];
  const allFields = [...defaultFields, ...templateFields];
  const selectedClient = clientId ? clientById(clientId) : undefined;

  // Auto-populate prior measurements for repeat client + garment
  useEffect(() => {
    if (!clientId || !garment) return;
    const prior = latestMeasurement(clientId, garment);
    if (prior) {
      setValues(prior.fields);
      toast({ title: "Loaded previous measurements", description: `From ${prior.createdAt}` });
    } else {
      setValues({});
    }
  }, [clientId, garment, latestMeasurement, toast]);

  // Auto-set gender when client selected
  useEffect(() => {
    if (!selectedClient) return;
    if (selectedClient.gender === "Male") { setGender("male"); setCategory("men"); }
    else if (selectedClient.gender === "Female") { setGender("female"); setCategory("women"); }
  }, [selectedClient]);

  const handleAddField = () => {
    const name = newFieldName.trim();
    if (!name || !garment) return;
    if (allFields.includes(name)) {
      toast({ title: "Field exists", description: `"${name}" is already in the list.`, variant: "destructive" });
      return;
    }
    addTemplateField(garment, name);
    setNewFieldName("");
    setShowAddField(false);
    toast({ title: "Field added", description: `"${name}" now appears for every ${garment}.` });
  };

  const handleRemoveField = (field: string) => {
    if (!garment) return;
    if (defaultFields.includes(field)) {
      toast({ title: "Cannot remove", description: "Default fields cannot be removed.", variant: "destructive" });
      return;
    }
    removeTemplateField(garment, field);
    const newValues = { ...values };
    delete newValues[field];
    setValues(newValues);
  };

  const handleSave = () => {
    if (!clientId || !garment) return;
    addMeasurement({
      clientId, garment, gender, ageGroup, category, fields: values, notes,
      unit,
      photo: photo || undefined,
    });
    toast({ title: "Measurements saved!", description: `${garment} for ${selectedClient?.name} recorded.` });
    navigate(-1);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { toast({ title: "Photo too large", description: "Max 4MB.", variant: "destructive" }); return; }
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
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
            {measurements.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">No measurements recorded yet.</p>
            )}
            {measurements.map((entry, i) => {
              const cname = clientById(entry.clientId)?.name || "—";
              const entryUnit = entry.unit || "in";
              return (
                <motion.div key={entry.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="card-glass p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{entry.garment} <span className="text-[10px] text-muted-foreground">· {cname} · {entryUnit}</span></p>
                    <span className="text-[10px] text-muted-foreground">{entry.createdAt}</span>
                  </div>
                  {entry.photo && (
                    <img src={entry.photo} alt="Reference" className="w-full h-32 object-cover rounded-lg" />
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(entry.fields).map(([k, v]) => (
                      <div key={k} className="bg-secondary/50 rounded-lg p-2 text-center">
                        <p className="text-[9px] text-muted-foreground uppercase">{k}</p>
                        <p className="text-sm font-bold text-foreground">{String(v)} <span className="text-[8px] text-muted-foreground">{entryUnit}</span></p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : step === "select" ? (
          <motion.div key="select" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" className="px-5 pt-4 space-y-5">
            <ClientPicker value={clientId} onChange={(id) => setClientId(id)} />

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
                    onClick={() => {
                      if (!clientId) { toast({ title: "Pick a client first", variant: "destructive" }); return; }
                      setGarment(g.label); setStep("fields");
                    }}
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
                <p className="text-sm text-muted-foreground">All measurements in {unit === "in" ? "inches" : "centimeters"}</p>
                <p className="text-[10px] text-primary">{selectedClient?.name} · {gender === "male" ? "👨 Male" : "👩 Female"} · {ageGroups.find(a => a.id === ageGroup)?.label}</p>
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAddField(true)}
                className="text-xs text-primary font-medium flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Field
              </motion.button>
            </div>
            <p className="text-[10px] text-muted-foreground italic -mt-2">
              Fields you add here are saved to your <span className="text-primary">{garment}</span> template and reused for every client.
            </p>

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
                const isCustom = templateFields.includes(field);
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
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Reference Photo (optional)</label>
              {photo ? (
                <div className="relative">
                  <img src={photo} alt="Reference" className="w-full h-40 object-cover rounded-xl" />
                  <button onClick={() => setPhoto(null)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center">
                    <X className="w-3.5 h-3.5 text-foreground" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border bg-card cursor-pointer text-xs text-muted-foreground">
                  <ImageIcon className="w-4 h-4" /> Attach photo (client, swatch, style)
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </label>
              )}
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Notes (optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add fitting notes..." rows={3}
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
