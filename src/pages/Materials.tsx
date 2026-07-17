import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Search, X, Save, Trash2, Package, Loader2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAtelier, materialLowStock, type Material } from "@/contexts/AtelierContext";

const materialCategories = ["Threads", "Beads", "Buttons", "Zips", "Needles", "Linings", "Elastic", "Stiff", "Other"];

const Materials = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { materials, setMaterials } = useAtelier();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Threads", qty: "", unitCost: "", totalCost: "", linkedOrder: "" });

  const filtered = materials.filter((m) => {
    const matchSearch = `${m.name} ${m.category} ${m.linkedOrder}`.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "All" || m.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const handleAdd = async () => {
    if (!form.name.trim() || adding) return;
    setAdding(true);
    await new Promise((r) => setTimeout(r, 400));
    const newMaterial: Material = {
      id: Date.now().toString(),
      name: form.name,
      category: form.category,
      qty: form.qty || "—",
      unitCost: form.unitCost || "—",
      totalCost: form.totalCost || "—",
      linkedOrder: form.linkedOrder || "—",
    };
    setMaterials((prev) => [newMaterial, ...prev]);
    setForm({ name: "", category: "Threads", qty: "", unitCost: "", totalCost: "", linkedOrder: "" });
    setShowForm(false);
    toast({ title: "Material added ✨", description: `${newMaterial.name} added to inventory.` });
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    await new Promise((r) => setTimeout(r, 350));
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    toast({ title: "Material removed" });
    setDeletingId(null);
  };

  const categoryEmojis: Record<string, string> = {
    Threads: "🧵", Beads: "📿", Buttons: "🔘", Zips: "🔗", Needles: "🪡",
    Linings: "🎭", Elastic: "〰️", Stiff: "📐", Other: "📦",
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/50">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <h1 className="text-lg font-semibold text-foreground flex-1">Materials & Accessories</h1>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowForm(!showForm)}
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/25"
        >
          {showForm ? <X className="w-4 h-4 text-primary-foreground" /> : <Plus className="w-4 h-4 text-primary-foreground" />}
        </motion.button>
      </div>

      <div className="px-5 pt-4 space-y-4">
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="card-glass p-5 space-y-4 mb-4">
                <p className="text-sm font-bold text-foreground">Add New Material</p>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Material name *"
                  className="w-full bg-background border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-all" />
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {materialCategories.map((c) => (
                      <motion.button key={c} whileTap={{ scale: 0.95 }} onClick={() => setForm({ ...form, category: c })}
                        className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                          form.category === c ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground")}>
                        {categoryEmojis[c]} {c}
                      </motion.button>
                    ))}
                  </div>
                </div>
                {[
                  { key: "qty", placeholder: "Quantity (e.g. 12 spools)" },
                  { key: "unitCost", placeholder: "Unit cost (e.g. GHS 15)" },
                  { key: "totalCost", placeholder: "Total cost (e.g. GHS 180)" },
                  { key: "linkedOrder", placeholder: "Linked order (optional)" },
                ].map((input) => (
                  <input key={input.key} value={form[input.key as keyof typeof form]} onChange={(e) => setForm({ ...form, [input.key]: e.target.value })}
                    placeholder={input.placeholder}
                    className="w-full bg-background border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-all" />
                ))}
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd} disabled={!form.name.trim() || adding}
                  className={cn("w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg disabled:cursor-not-allowed",
                    form.name.trim() && !adding ? "bg-primary text-primary-foreground shadow-primary/25" : "bg-muted text-muted-foreground shadow-none")}>
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {adding ? "Adding..." : "Add Material"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search materials..."
            className="w-full bg-card border border-border rounded-2xl py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all" />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {["All", ...materialCategories].map((c) => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors",
                activeCategory === c ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground")}>
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={cn("card-glass p-3.5 flex items-center gap-3 group transition-opacity", deletingId === m.id && "opacity-50 pointer-events-none")}>
              <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-lg">{categoryEmojis[m.category] || "📦"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground">{m.name}</p>
                  {materialLowStock(m.qty) && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-bold flex items-center gap-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" /> LOW
                    </span>
                  )}
                </div>
                <p className={cn("text-[11px]", materialLowStock(m.qty) ? "text-destructive" : "text-muted-foreground")}>{m.category} · {m.qty}</p>
                {m.linkedOrder !== "—" && <p className="text-[10px] text-primary mt-0.5">🔗 {m.linkedOrder}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-foreground">{m.totalCost}</p>
                <p className="text-[10px] text-muted-foreground">{m.unitCost}/unit</p>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} disabled={deletingId === m.id}
                onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}
                className="opacity-50 group-hover:opacity-100 transition-opacity disabled:opacity-100">
                {deletingId === m.id ? (
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                )}
              </motion.button>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto flex items-center justify-center mb-3">
                <Package className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No materials found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Materials;
