import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

const categories = [
  { id: "men", label: "Men", emoji: "👔" },
  { id: "women", label: "Women", emoji: "👗" },
  { id: "children", label: "Children", emoji: "🧒" },
];

const garmentTypes: Record<string, { label: string; emoji: string }[]> = {
  men: [{ label: "Agbada", emoji: "🥻" }, { label: "Senator", emoji: "👔" }, { label: "Suit", emoji: "🤵" }, { label: "Kaftan", emoji: "👕" }],
  women: [{ label: "Gown", emoji: "👗" }, { label: "Blouse", emoji: "👚" }, { label: "Skirt", emoji: "🩱" }, { label: "Iro & Buba", emoji: "🥻" }],
  children: [{ label: "Shirt", emoji: "👕" }, { label: "Dress", emoji: "👗" }, { label: "Shorts", emoji: "🩳" }],
};

const defaultFields: Record<string, string[]> = {
  Agbada: ["Chest", "Shoulder", "Sleeve", "Length", "Neck"],
  Senator: ["Chest", "Shoulder", "Sleeve", "Length", "Trouser Waist", "Trouser Length"],
  Suit: ["Chest", "Shoulder", "Sleeve", "Back", "Trouser Waist", "Trouser Length", "Inseam"],
  Kaftan: ["Chest", "Shoulder", "Sleeve", "Length"],
  Gown: ["Bust", "Waist", "Hip", "Shoulder", "Length", "Sleeve"],
  Blouse: ["Bust", "Waist", "Shoulder", "Sleeve", "Length"],
  Skirt: ["Waist", "Hip", "Length"],
  "Iro & Buba": ["Bust", "Waist", "Hip", "Shoulder", "Sleeve"],
  Shirt: ["Chest", "Shoulder", "Sleeve", "Length"],
  Dress: ["Chest", "Waist", "Length"],
  Shorts: ["Waist", "Hip", "Length"],
};

const WorkerMeasurements = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [garment, setGarment] = useState("");
  const [clientName, setClientName] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [newField, setNewField] = useState("");
  const [showAddField, setShowAddField] = useState(false);

  const allFields = [...(defaultFields[garment] || []), ...customFields];

  const handleAddField = () => {
    const name = newField.trim();
    if (!name || allFields.includes(name)) return;
    setCustomFields(prev => [...prev, name]);
    setNewField("");
    setShowAddField(false);
  };

  const handleRemoveField = (f: string) => {
    if ((defaultFields[garment] || []).includes(f)) return;
    setCustomFields(prev => prev.filter(x => x !== f));
    setValues(prev => { const c = { ...prev }; delete c[f]; return c; });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border px-5 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Record Measurement</h1>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-5">
        {/* Client Name */}
        <motion.div {...fadeUp}>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Client Name</label>
          <input type="text" placeholder="Enter client name" value={clientName}
            onChange={e => setClientName(e.target.value)}
            className="w-full bg-card border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </motion.div>

        {/* Category */}
        <motion.div {...fadeUp} transition={{ delay: 0.05 }}>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map(c => (
              <button key={c.id} onClick={() => { setCategory(c.id); setGarment(""); }}
                className={`py-3 rounded-xl text-sm font-medium transition-colors ${category === c.id ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Garment Type */}
        {category && (
          <motion.div {...fadeUp}>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Garment Type</label>
            <div className="flex flex-wrap gap-2">
              {garmentTypes[category]?.map(g => (
                <button key={g.label} onClick={() => { setGarment(g.label); setCustomFields([]); setValues({}); }}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${garment === g.label ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`}>
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Measurement Fields */}
        {garment && (
          <motion.div {...fadeUp} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground">Measurements (inches)</label>
              <button onClick={() => setShowAddField(!showAddField)} className="text-xs text-primary font-medium flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Field
              </button>
            </div>

            {showAddField && (
              <div className="flex gap-2">
                <input type="text" placeholder="Field name" value={newField} onChange={e => setNewField(e.target.value)}
                  className="flex-1 bg-card border border-border rounded-xl py-2.5 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <button onClick={handleAddField} className="px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold">Add</button>
              </div>
            )}

            {allFields.map(f => (
              <div key={f} className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input type="number" placeholder="0" value={values[f] || ""}
                    onChange={e => setValues({ ...values, [f]: e.target.value })}
                    className="w-full bg-card border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{f}</span>
                </div>
                {!(defaultFields[garment] || []).includes(f) && (
                  <button onClick={() => handleRemoveField(f)} className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>
            ))}

            <button onClick={() => navigate(-1)}
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm mt-4">
              Save Measurement
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WorkerMeasurements;
