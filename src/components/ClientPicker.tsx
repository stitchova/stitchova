import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, User, X, Check } from "lucide-react";
import { useAtelier, Client, initialsOf } from "@/contexts/AtelierContext";
import { cn } from "@/lib/utils";

interface Props {
  value: string | null;
  onChange: (clientId: string, client: Client) => void;
  label?: string;
  allowCreate?: boolean;
}

const ClientPicker = ({ value, onChange, label = "Client", allowCreate = true }: Props) => {
  const { clients, addClient } = useAtelier();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", gender: "Female", notes: "" });

  const selected = clients.find(c => c.id === value);
  const filtered = useMemo(
    () => clients.filter(c => `${c.name} ${c.phone}`.toLowerCase().includes(q.toLowerCase())),
    [clients, q]
  );

  const commitCreate = () => {
    if (!form.name.trim()) return;
    const client = addClient(form);
    onChange(client.id, client);
    setCreating(false); setOpen(false); setQ("");
    setForm({ name: "", phone: "", gender: "Female", notes: "" });
  };

  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1.5 block">{label} *</label>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full bg-secondary/50 border border-border rounded-xl py-3 px-4 text-sm text-left flex items-center gap-3 hover:border-primary transition-colors"
      >
        {selected ? (
          <>
            <div className="w-7 h-7 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center">
              {selected.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{selected.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{selected.phone || "No phone"}</p>
            </div>
          </>
        ) : (
          <>
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Select a client…</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-background/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl border border-border p-4 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-foreground">Choose Client</p>
                <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>

              {!creating && (
                <>
                  <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2 mb-3">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or phone…"
                      className="bg-transparent outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground" />
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1.5">
                    {filtered.map((c) => (
                      <button key={c.id} onClick={() => { onChange(c.id, c); setOpen(false); }}
                        className={cn("w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-left",
                          value === c.id ? "bg-primary/15" : "hover:bg-secondary/70")}
                      >
                        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                          <span className="text-xs font-bold text-foreground">{c.initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{c.phone || "No phone"} · {c.gender || "—"}</p>
                        </div>
                        {value === c.id && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    ))}
                    {filtered.length === 0 && (
                      <p className="text-center text-xs text-muted-foreground py-6">No matching clients</p>
                    )}
                  </div>
                  {allowCreate && (
                    <button onClick={() => { setCreating(true); setForm(f => ({ ...f, name: q })); }}
                      className="mt-3 w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Add New Client
                    </button>
                  )}
                </>
              )}

              {creating && (
                <div className="space-y-3">
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name *"
                    className="w-full bg-secondary/50 border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary" />
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number"
                    className="w-full bg-secondary/50 border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary" />
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1.5">Gender</p>
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
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                    placeholder="Notes (fabric allergies, style preferences…)"
                    className="w-full bg-secondary/50 border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => setCreating(false)}
                      className="flex-1 py-3 rounded-xl bg-secondary text-foreground text-sm font-semibold">Back</button>
                    <button onClick={commitCreate} disabled={!form.name.trim()}
                      className={cn("flex-1 py-3 rounded-xl text-sm font-bold",
                        form.name.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                      Save Client
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientPicker;