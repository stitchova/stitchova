import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Search, X, Save, Trash2, ImagePlus, Camera, Loader2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAtelier, fabricLowStock, type Fabric } from "@/contexts/AtelierContext";

const fabricTypes = ["Lace", "Ankara", "Silk", "Denim", "Cotton", "Kente", "Brocade", "Wool", "Satin", "Other"];
const sources = ["Client", "Designer"];

const Fabrics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fabrics, setFabrics } = useAtelier();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", brand: "", color: "", qty: "", price: "", fabricType: "Ankara", source: "Designer", dateReceived: "" });
  const [formImage, setFormImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = fabrics.filter((f) =>
    `${f.name} ${f.brand} ${f.color} ${f.fabricType}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAdd = async () => {
    if (!form.name.trim() || adding) return;
    setAdding(true);
    await new Promise((r) => setTimeout(r, 400));
    const newFabric: Fabric = {
      id: Date.now().toString(), name: form.name, brand: form.brand || "—", color: form.color || "—",
      qty: form.qty || "—", price: form.price || "—", image: formImage, fabricType: form.fabricType,
      source: form.source, dateReceived: form.dateReceived || new Date().toISOString().split("T")[0],
    };
    setFabrics((prev) => [newFabric, ...prev]);
    setForm({ name: "", brand: "", color: "", qty: "", price: "", fabricType: "Ankara", source: "Designer", dateReceived: "" });
    setFormImage(null);
    setShowForm(false);
    toast({ title: "Fabric added ✨", description: `${newFabric.name} added to your collection.` });
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    await new Promise((r) => setTimeout(r, 350));
    setFabrics((prev) => prev.filter((f) => f.id !== id));
    toast({ title: "Fabric removed" });
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/50">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <h1 className="text-lg font-semibold text-foreground flex-1">Fabric Collection</h1>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowForm(!showForm)}
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
          {showForm ? <X className="w-4 h-4 text-primary-foreground" /> : <Plus className="w-4 h-4 text-primary-foreground" />}
        </motion.button>
      </div>

      <div className="px-5 pt-4 space-y-4">
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="card-glass p-5 space-y-4 mb-4">
                <p className="text-sm font-bold text-foreground">Add New Fabric</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => fileInputRef.current?.click()}
                  className={cn("w-full h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all overflow-hidden",
                    formImage ? "border-primary/40" : "border-border hover:border-primary/30")}>
                  {formImage ? (
                    <div className="relative w-full h-full">
                      <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-background/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-foreground" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                        <ImagePlus className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground">Tap to add fabric photo</span>
                    </>
                  )}
                </motion.button>

                {[
                  { key: "name", placeholder: "Fabric name *" },
                  { key: "brand", placeholder: "Brand" },
                  { key: "color", placeholder: "Color(s)" },
                  { key: "qty", placeholder: "Quantity (e.g. 5 yards)" },
                  { key: "price", placeholder: "Price (e.g. GHS 350)" },
                ].map((input) => (
                  <input key={input.key} value={form[input.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [input.key]: e.target.value })} placeholder={input.placeholder}
                    className="w-full bg-background border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all" />
                ))}

                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Fabric Type</label>
                  <div className="flex flex-wrap gap-2">
                    {fabricTypes.map((t) => (
                      <motion.button key={t} whileTap={{ scale: 0.95 }} onClick={() => setForm({ ...form, fabricType: t })}
                        className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                          form.fabricType === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground")}>
                        {t}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Source</label>
                  <div className="flex gap-2">
                    {sources.map((s) => (
                      <motion.button key={s} whileTap={{ scale: 0.95 }} onClick={() => setForm({ ...form, source: s })}
                        className={cn("flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all",
                          form.source === s ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground")}>
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Date Received</label>
                  <input type="date" value={form.dateReceived} onChange={(e) => setForm({ ...form, dateReceived: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl py-3 px-4 text-sm text-foreground focus:outline-none focus:border-primary transition-all" />
                </div>

                <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd} disabled={!form.name.trim() || adding}
                  className={cn("w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg disabled:cursor-not-allowed",
                    form.name.trim() && !adding ? "bg-primary text-primary-foreground shadow-primary/25" : "bg-muted text-muted-foreground shadow-none")}>
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {adding ? "Adding..." : "Add Fabric"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search fabrics..."
            className="w-full bg-card border border-border rounded-2xl py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all" />
        </div>

        <div className="space-y-3">
          {filtered.map((f, i) => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={cn("card-glass p-3 flex items-center gap-4 group transition-opacity", deletingId === f.id && "opacity-50 pointer-events-none")}>
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
                {f.image ? (
                  <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><span className="text-xl">🧵</span></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground">{f.name}</p>
                  {fabricLowStock(f.qty) && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-bold flex items-center gap-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" /> LOW
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">{f.brand} · {f.color}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{f.fabricType}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{f.source}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-foreground">{f.price}</p>
                <p className={cn("text-[10px]", fabricLowStock(f.qty) ? "text-destructive font-semibold" : "text-muted-foreground")}>{f.qty}</p>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} disabled={deletingId === f.id}
                onClick={(e) => { e.stopPropagation(); handleDelete(f.id); }}
                className="opacity-50 group-hover:opacity-100 transition-opacity disabled:opacity-100">
                {deletingId === f.id ? (
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                )}
              </motion.button>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto flex items-center justify-center mb-3"><span className="text-2xl">🧵</span></div>
              <p className="text-sm text-muted-foreground">No fabrics found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Fabrics;
