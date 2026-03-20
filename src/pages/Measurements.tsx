import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { id: "men", label: "Men", emoji: "👔" },
  { id: "women", label: "Women", emoji: "👗" },
  { id: "children", label: "Children", emoji: "🧒" },
];

const garmentTypes: Record<string, { label: string; emoji: string }[]> = {
  men: [
    { label: "Agbada", emoji: "🥻" },
    { label: "Senator", emoji: "👔" },
    { label: "Kaftan", emoji: "🧥" },
    { label: "Suit", emoji: "🤵" },
    { label: "Shirt", emoji: "👕" },
    { label: "Trouser", emoji: "👖" },
  ],
  women: [
    { label: "Blouse", emoji: "👚" },
    { label: "Skirt", emoji: "👗" },
    { label: "Gown", emoji: "💃" },
    { label: "Iro & Buba", emoji: "🥻" },
    { label: "Jumpsuit", emoji: "🩱" },
    { label: "Wrapper", emoji: "👘" },
  ],
  children: [
    { label: "Shirt", emoji: "👕" },
    { label: "Dress", emoji: "👗" },
    { label: "Trouser", emoji: "👖" },
    { label: "Agbada", emoji: "🥻" },
  ],
};

const measurementFields: Record<string, string[]> = {
  Agbada: ["Chest", "Shoulder", "Sleeve", "Length", "Round Arm", "Neck"],
  Senator: ["Chest", "Shoulder", "Sleeve", "Length", "Round Arm", "Neck"],
  Kaftan: ["Chest", "Shoulder", "Sleeve", "Length", "Round Arm"],
  Suit: ["Chest", "Shoulder", "Sleeve", "Length", "Waist", "Hip", "Trouser Length", "Thigh"],
  Shirt: ["Chest", "Shoulder", "Sleeve", "Length", "Neck", "Round Arm"],
  Trouser: ["Waist", "Hip", "Thigh", "Knee", "Length", "Bottom"],
  Blouse: ["Bust", "Shoulder", "Sleeve", "Length", "Round Arm", "Under Bust"],
  Skirt: ["Waist", "Hip", "Length", "Knee"],
  Gown: ["Bust", "Waist", "Hip", "Shoulder", "Sleeve", "Length", "Under Bust"],
  "Iro & Buba": ["Bust", "Shoulder", "Sleeve", "Blouse Length", "Wrapper Length", "Hip"],
  Jumpsuit: ["Bust", "Waist", "Hip", "Shoulder", "Sleeve", "Full Length", "Inseam"],
  Wrapper: ["Waist", "Hip", "Length"],
  Dress: ["Chest", "Shoulder", "Length", "Waist"],
};

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const Measurements = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [category, setCategory] = useState("men");
  const [garment, setGarment] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});

  const fields = garment ? (measurementFields[garment] || []) : [];

  const handleSave = () => {
    toast({ title: "Measurements saved!", description: `${garment} measurements for ${clientName || "client"} recorded.` });
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/50">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => garment ? setGarment(null) : navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <h1 className="text-lg font-semibold text-foreground">
          {garment ? `${garment} Measurements` : "New Measurement"}
        </h1>
      </div>

      <AnimatePresence mode="wait">
        {!garment ? (
          <motion.div key="select" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" className="px-5 pt-4 space-y-5">
            {/* Client name */}
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Client Name</label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter client name"
                className="w-full bg-card border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Category selector */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Category</label>
              <div className="flex gap-2">
                {categories.map((c) => (
                  <motion.button
                    key={c.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCategory(c.id)}
                    className={cn(
                      "flex-1 py-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-1",
                      category === c.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
                    )}
                  >
                    <span className="text-xl">{c.emoji}</span>
                    {c.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Garment types */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Garment Type</label>
              <div className="grid grid-cols-2 gap-3">
                {garmentTypes[category].map((g) => (
                  <motion.button
                    key={g.label}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { setGarment(g.label); setValues({}); }}
                    className="card-surface p-4 flex items-center gap-3 border border-transparent hover:border-border transition-all text-left"
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">{g.label}</span>
                      <span className="block text-[11px] text-muted-foreground">{measurementFields[g.label]?.length || 0} fields</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="fields" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" className="px-5 pt-4 space-y-4">
            <p className="text-sm text-muted-foreground">All measurements in inches</p>

            <div className="grid grid-cols-2 gap-3">
              {fields.map((field) => (
                <div key={field} className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">{field}</label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={values[field] || ""}
                      onChange={(e) => setValues({ ...values, [field]: e.target.value })}
                      placeholder="0.0"
                      className="w-full bg-card border border-border rounded-xl py-3 px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">in</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Notes (optional)</label>
              <textarea
                placeholder="Add fitting notes..."
                rows={3}
                className="w-full bg-card border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save button */}
      {garment && (
        <div className="fixed bottom-20 left-0 right-0 px-5">
          <div className="max-w-md mx-auto">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              className="w-full py-3.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Measurements
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Measurements;
