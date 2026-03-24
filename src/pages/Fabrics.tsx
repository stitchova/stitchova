import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Search, X, Save, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Fabric {
  id: string;
  name: string;
  brand: string;
  color: string;
  qty: string;
  price: string;
}

const defaultFabrics: Fabric[] = [
  { id: "1", name: "Ankara Print", brand: "Vlisco", color: "Multi", qty: "5 yards", price: "GHS 350" },
  { id: "2", name: "Silk Satin", brand: "Premium", color: "Navy/Gold", qty: "3 yards", price: "GHS 520" },
  { id: "3", name: "French Lace", brand: "Imported", color: "Ivory", qty: "4 yards", price: "GHS 780" },
  { id: "4", name: "Kente Cloth", brand: "Bonwire", color: "Gold/Green", qty: "6 yards", price: "GHS 900" },
  { id: "5", name: "Cotton Poplin", brand: "Local", color: "White", qty: "10 yards", price: "GHS 150" },
];

const Fabrics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fabrics, setFabrics] = useState<Fabric[]>(defaultFabrics);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", brand: "", color: "", qty: "", price: "" });

  const filtered = fabrics.filter((f) =>
    `${f.name} ${f.brand} ${f.color}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.name.trim()) return;
    const newFabric: Fabric = {
      id: Date.now().toString(),
      name: form.name,
      brand: form.brand || "—",
      color: form.color || "—",
      qty: form.qty || "—",
      price: form.price || "—",
    };
    setFabrics((prev) => [newFabric, ...prev]);
    setForm({ name: "", brand: "", color: "", qty: "", price: "" });
    setShowForm(false);
    toast({ title: "Fabric added", description: `${newFabric.name} added to your collection.` });
  };

  const handleDelete = (id: string) => {
    setFabrics((prev) => prev.filter((f) => f.id !== id));
    toast({ title: "Fabric removed" });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/50">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <h1 className="text-lg font-semibold text-foreground flex-1">Fabric Collection</h1>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowForm(!showForm)}
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center"
        >
          {showForm ? <X className="w-4 h-4 text-primary-foreground" /> : <Plus className="w-4 h-4 text-primary-foreground" />}
        </motion.button>
      </div>

      <div className="px-5 pt-4 space-y-4">
        {/* Add form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="card-surface p-4 space-y-3 mb-4">
                <p className="text-sm font-semibold text-foreground">Add New Fabric</p>
                {[
                  { key: "name", placeholder: "Fabric name *", type: "text" },
                  { key: "brand", placeholder: "Brand", type: "text" },
                  { key: "color", placeholder: "Color(s)", type: "text" },
                  { key: "qty", placeholder: "Quantity (e.g. 5 yards)", type: "text" },
                  { key: "price", placeholder: "Price (e.g. GHS 350)", type: "text" },
                ].map((input) => (
                  <input
                    key={input.key}
                    value={form[input.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [input.key]: e.target.value })}
                    placeholder={input.placeholder}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                  />
                ))}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAdd}
                  disabled={!form.name.trim()}
                  className={cn(
                    "w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                    form.name.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Save className="w-4 h-4" /> Add Fabric
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fabrics..."
            className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card-surface p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🧵</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{f.name}</p>
                <p className="text-[11px] text-muted-foreground">{f.brand} · {f.color}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-foreground">{f.price}</p>
                <p className="text-[10px] text-muted-foreground">{f.qty}</p>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(f.id)}>
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
              </motion.button>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No fabrics found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Fabrics;
