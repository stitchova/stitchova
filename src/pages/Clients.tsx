import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Filter, ChevronRight, Phone, Users, Plus, X } from "lucide-react";
import { useAtelier } from "@/contexts/AtelierContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import ClientsWorkspace from "@/components/designer-desktop/ClientsWorkspace";

const tabs = ["All", "Active", "New"];

const Clients = () => {
  const navigate = useNavigate();
  const { clients, ordersByClient, addClient } = useAtelier();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", gender: "Female", notes: "" });

  useEffect(() => {
    if (params.get("new") === "1") {
      setShowAdd(true);
      params.delete("new");
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const filtered = clients.filter((c) =>
    `${c.name} ${c.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    const c = addClient(form);
    setShowAdd(false);
    setForm({ name: "", phone: "", gender: "Female", notes: "" });
    toast({ title: "Client added", description: `${c.name} is in your list.` });
  };

  const inputClass = "w-full bg-secondary/50 border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors";

  return (
    <>
      {/* Tablet/desktop designer workspace */}
      <ClientsWorkspace onAddClient={() => setShowAdd(true)} />

      {/* Mobile view (unchanged) */}
      <div className="min-h-screen bg-background pb-24 lg:hidden">
      <div className="designer-hero px-5 pt-6 pb-5 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold shimmer-text">Clients</h1>
            <p className="text-xs text-muted-foreground mt-1">{clients.length} total clients</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl frost-card flex items-center justify-center">
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowAdd(true)}
              className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center glow-primary">
              <Plus className="w-4 h-4 text-primary-foreground" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 py-3 mt-2 flex gap-2">
        <div className="flex items-center gap-3 glass-input px-4 py-3 flex-1">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground flex-1 outline-none"
          />
        </div>
        <motion.button whileTap={{ scale: 0.9 }} className="w-12 h-12 rounded-xl frost-card flex items-center justify-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 mb-4">
        {tabs.map((t) => (
          <motion.button
            key={t}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(t)}
            className={`relative px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === t ? "text-primary-foreground" : "frost-card text-muted-foreground"
            }`}
          >
            {activeTab === t && (
              <motion.div layoutId="clientsTabIndicator"
                className="absolute inset-0 rounded-xl bg-primary glow-primary"
                transition={{ type: "spring", stiffness: 400, damping: 30 }} />
            )}
            <span className="relative z-10">{t}</span>
          </motion.button>
        ))}
      </div>

      {/* Client List */}
      <div className="px-5 space-y-3">
        {filtered.map((c, i) => {
          const orders = ordersByClient(c.id);
          const last = orders[0];
          return (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -1 }}
            onClick={() => navigate(`/client/${c.id}`)}
            className="frost-card p-4 flex items-center gap-4 cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full p-[2px] flex-shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{c.initials}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{c.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">{c.phone || "—"}</span>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
              <span className="text-[10px] text-muted-foreground">{orders.length} orders</span>
              <span className="text-[9px] text-muted-foreground">{last ? `Last: ${last.dueDate}` : "No orders"}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No clients found</p>
          </div>
        )}
      </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-background/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl border border-border p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-foreground">Add New Client</p>
                <button onClick={() => setShowAdd(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name *" className={inputClass} />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" className={inputClass} />
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Gender</p>
                <div className="flex gap-2">
                  {["Female", "Male", "Other"].map((g) => (
                    <button key={g} onClick={() => setForm({ ...form, gender: g })}
                      className={cn("flex-1 py-2 rounded-xl text-xs font-medium border transition-colors",
                        form.gender === g ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground")}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
                placeholder="Notes (fabric allergies, style preferences, referral source…)"
                className={inputClass + " resize-none"} />
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold">
                Save Client
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Clients;
