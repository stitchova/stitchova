import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ClientPicker from "@/components/ClientPicker";
import { useAtelier } from "@/contexts/AtelierContext";
import { useBrandInvoice } from "@/contexts/BrandInvoiceContext";
import { categories, garmentTypes, defaultMeasurementFields } from "@/constants/garments";
import MeasurementsWorkspace from "@/components/designer-desktop/MeasurementsWorkspace";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } };

const WorkerMeasurements = () => {
  const navigate = useNavigate();
  const { addMeasurement, latestMeasurement, measurementTemplates, addTemplateField, clientById } = useAtelier();
  const { brand } = useBrandInvoice();
  const unit = brand.measurementUnit || "in";
  const [category, setCategory] = useState("");
  const [garment, setGarment] = useState("");
  const [clientId, setClientId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [newField, setNewField] = useState("");
  const [showAddField, setShowAddField] = useState(false);

  const defaultFields = garment ? (defaultMeasurementFields[garment] || []) : [];
  const templateFields = garment ? (measurementTemplates[garment] || []) : [];
  const allFields = [...defaultFields, ...templateFields];
  const selectedClient = clientId ? clientById(clientId) : undefined;

  // Prefill from last measurement for same client + garment (shared with designer flow).
  useEffect(() => {
    if (!clientId || !garment) return;
    const prior = latestMeasurement(clientId, garment);
    if (prior) {
      setValues(prior.fields);
      toast.info(`Loaded prior ${garment} measurements from ${prior.createdAt}`);
    } else {
      setValues({});
    }
  }, [clientId, garment, latestMeasurement]);

  const handleAddField = () => {
    const name = newField.trim();
    if (!name || !garment || allFields.includes(name)) return;
    addTemplateField(garment, name);
    setNewField("");
    setShowAddField(false);
    toast.success(`"${name}" added to ${garment} template`);
  };

  const handleSave = () => {
    if (!clientId || !garment) {
      toast.error("Pick a client and garment first");
      return;
    }
    const filled = Object.values(values).filter((v) => v && String(v).trim()).length;
    if (filled === 0) {
      toast.error("Enter at least one measurement");
      return;
    }
    const gender = selectedClient?.gender === "Male" ? "male" : selectedClient?.gender === "Female" ? "female" : "female";
    addMeasurement({
      clientId, garment, gender, ageGroup: "adult", category: category || "women",
      fields: values, unit,
    });
    toast.success(`Measurement saved for ${selectedClient?.name} ✅`);
    navigate(-1);
  };

  return (
    <>
      {/* Tablet/desktop worker workspace */}
      <MeasurementsWorkspace />

      {/* Mobile view (unchanged) */}
      <div className="min-h-screen bg-background pb-24 lg:hidden">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border px-5 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Record Measurement</h1>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-5">
        {/* Client picker (shared roster) */}
        <motion.div {...fadeUp}>
          <ClientPicker value={clientId} onChange={(id) => setClientId(id)} />
        </motion.div>

        {/* Category */}
        <motion.div {...fadeUp} transition={{ delay: 0.05 }}>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map(c => (
              <motion.button key={c.id} whileTap={{ scale: 0.95 }}
                onClick={() => { setCategory(c.id); setGarment(""); }}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${category === c.id ? "bg-primary text-primary-foreground glow-primary" : "card-glass text-foreground"}`}>
                {c.emoji} {c.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Garment Type */}
        {category && (
          <motion.div {...fadeUp}>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Garment Type</label>
            <div className="flex flex-wrap gap-2">
              {garmentTypes[category]?.map(g => (
                <motion.button key={g.label} whileTap={{ scale: 0.95 }}
                  onClick={() => { setGarment(g.label); }}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${garment === g.label ? "bg-primary text-primary-foreground glow-primary" : "card-glass text-foreground"}`}>
                  {g.emoji} {g.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Measurement Fields */}
        {garment && (
          <motion.div {...fadeUp} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground">Measurements ({unit === "in" ? "inches" : "centimeters"})</label>
              <button onClick={() => setShowAddField(!showAddField)} className="text-xs text-primary font-medium flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Field
              </button>
            </div>

            {showAddField && (
              <div className="flex gap-2">
                <input type="text" placeholder="Field name" value={newField} onChange={e => setNewField(e.target.value)}
                  className="flex-1 glass-input py-2.5 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <button onClick={handleAddField} className="px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold">Add</button>
              </div>
            )}

            {allFields.map((f, i) => {
              const isCustom = templateFields.includes(f);
              return (
              <motion.div key={f} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }} className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input type="number" placeholder="0" value={values[f] || ""}
                    onChange={e => setValues({ ...values, [f]: e.target.value })}
                    className="w-full glass-input py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{f}{isCustom ? " · custom" : ""}</span>
                </div>
              </motion.div>
              );
            })}

            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm mt-4">
              Save Measurement
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
    </>
  );
};

export default WorkerMeasurements;
