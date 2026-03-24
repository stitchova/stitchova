import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Phone, Star, X, Save, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Worker {
  id: string;
  name: string;
  role: string;
  phone: string;
  rating: number;
  jobs: number;
}

const defaultWorkers: Worker[] = [
  { id: "1", name: "Kwame Asante", role: "Head Tailor", phone: "024 555 1234", rating: 4.8, jobs: 156 },
  { id: "2", name: "Esi Darkwa", role: "Seamstress", phone: "020 333 5678", rating: 4.6, jobs: 98 },
  { id: "3", name: "Yaw Mensah", role: "Cutter", phone: "055 777 9012", rating: 4.9, jobs: 210 },
  { id: "4", name: "Abena Osei", role: "Embroiderer", phone: "027 888 3456", rating: 4.7, jobs: 75 },
];

const roleOptions = ["Head Tailor", "Seamstress", "Cutter", "Embroiderer", "Apprentice", "Pattern Maker", "Other"];

const Workers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workers, setWorkers] = useState<Worker[]>(defaultWorkers);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", phone: "" });

  const handleAdd = () => {
    if (!form.name.trim() || !form.role) return;
    const newWorker: Worker = {
      id: Date.now().toString(),
      name: form.name,
      role: form.role,
      phone: form.phone || "—",
      rating: 0,
      jobs: 0,
    };
    setWorkers((prev) => [newWorker, ...prev]);
    setForm({ name: "", role: "", phone: "" });
    setShowForm(false);
    toast({ title: "Worker added", description: `${newWorker.name} has been registered.` });
  };

  const handleDelete = (id: string) => {
    setWorkers((prev) => prev.filter((w) => w.id !== id));
    toast({ title: "Worker removed" });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/50">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <h1 className="text-lg font-semibold text-foreground flex-1">Workers</h1>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowForm(!showForm)}
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center"
        >
          {showForm ? <X className="w-4 h-4 text-primary-foreground" /> : <Plus className="w-4 h-4 text-primary-foreground" />}
        </motion.button>
      </div>

      <div className="px-5 pt-4 space-y-3">
        {/* Add form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="card-surface p-4 space-y-3 mb-3">
                <p className="text-sm font-semibold text-foreground">Register New Worker</p>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full name *"
                  className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                />
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Role *</p>
                  <div className="flex flex-wrap gap-2">
                    {roleOptions.map((r) => (
                      <motion.button
                        key={r}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setForm({ ...form, role: r })}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                          form.role === r ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
                        )}
                      >
                        {r}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone number"
                  className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAdd}
                  disabled={!form.name.trim() || !form.role}
                  className={cn(
                    "w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                    form.name.trim() && form.role ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Save className="w-4 h-4" /> Add Worker
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Worker list */}
        {workers.map((w, i) => (
          <motion.div
            key={w.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-surface p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-foreground">{w.name.split(" ").map(n => n[0]).join("")}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{w.name}</p>
              <p className="text-[11px] text-muted-foreground">{w.role}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Phone className="w-3 h-3" /> {w.phone}
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0 flex items-center gap-3">
              <div>
                {w.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                    <span className="text-sm font-semibold text-foreground">{w.rating}</span>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground">{w.jobs} jobs</p>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(w.id)}>
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Workers;
