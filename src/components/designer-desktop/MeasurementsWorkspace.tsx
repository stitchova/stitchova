import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Save, Plus, X, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import ClientPicker from "@/components/ClientPicker";
import { useAtelier } from "@/contexts/AtelierContext";
import { useBrandInvoice } from "@/contexts/BrandInvoiceContext";
import { categories, garmentTypes, defaultMeasurementFields } from "@/constants/garments";
import { DesktopOnly, WorkspaceHeader, SectionCard, StatusPill } from "./DesktopKit";

const UPPER = ["Chest", "Bust", "Under Bust", "Shoulder", "Neck", "Sleeve", "Round Arm", "Back Width"];
const LOWER = ["Waist", "Hip", "Thigh", "Knee", "Bottom", "Inseam"];

const groupFields = (fields: string[]) => {
  const upper = fields.filter((f) => UPPER.includes(f));
  const lower = fields.filter((f) => LOWER.includes(f));
  const lengths = fields.filter((f) => !upper.includes(f) && !lower.includes(f) && /length/i.test(f));
  const other = fields.filter((f) => !upper.includes(f) && !lower.includes(f) && !lengths.includes(f));
  return [
    { title: "Upper body", fields: upper },
    { title: "Lower body", fields: lower },
    { title: "Lengths", fields: lengths },
    { title: "Other", fields: other },
  ].filter((g) => g.fields.length > 0);
};

/**
 * Measurement entry for tablet/desktop — a multi-column, keyboard-first form
 * (deliberately NOT the list + detail pattern used by the other workspaces).
 */
const MeasurementsWorkspace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    addMeasurement, clientById, latestMeasurement, measurementsByClient,
    measurementTemplates, addTemplateField, removeTemplateField,
  } = useAtelier();
  const { brand } = useBrandInvoice();
  const unit = brand.measurementUnit || "in";

  const [clientId, setClientId] = useState<string | null>(null);
  const [category, setCategory] = useState("women");
  const [garment, setGarment] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [newField, setNewField] = useState("");

  const client = clientId ? clientById(clientId) : undefined;
  const defaults = garment ? defaultMeasurementFields[garment] || [] : [];
  const templates = garment ? measurementTemplates[garment] || [] : [];
  const allFields = useMemo(() => [...defaults, ...templates], [defaults, templates]);
  const groups = useMemo(() => groupFields(allFields), [allFields]);
  const history = clientId ? measurementsByClient(clientId) : [];

  useEffect(() => {
    if (!clientId || !garment) return;
    const prior = latestMeasurement(clientId, garment);
    setValues(prior ? prior.fields : {});
  }, [clientId, garment, latestMeasurement]);

  useEffect(() => {
    if (!client) return;
    if (client.gender === "Male") setCategory("men");
    else if (client.gender === "Female") setCategory("women");
  }, [client]);

  const filled = allFields.filter((f) => values[f]).length;

  const save = () => {
    if (!clientId || !garment) {
      toast({ title: "Pick a client and garment", variant: "destructive" });
      return;
    }
    addMeasurement({
      clientId, garment, gender: category === "men" ? "male" : "female",
      ageGroup: "adult", category, fields: values, notes, unit,
    });
    toast({ title: "Measurements saved", description: `${garment} for ${client?.name} recorded.` });
    setNotes("");
  };

  const addField = () => {
    const name = newField.trim();
    if (!name || !garment) return;
    if (allFields.includes(name)) {
      toast({ title: "Field exists", variant: "destructive" });
      return;
    }
    addTemplateField(garment, name);
    setNewField("");
  };

  return (
    <DesktopOnly>
      <WorkspaceHeader
        title="Measurements"
        subtitle="Capture a full set fast — tab straight through every field."
        action={{ label: "Save measurements", icon: Save, onClick: save }}
      />

      <div className="grid grid-cols-[minmax(300px,340px)_1fr] gap-5 mt-6 items-start">
        {/* Setup column */}
        <div className="rounded-3xl card-elevated p-5 space-y-5">
          <ClientPicker value={clientId} onChange={(id) => setClientId(id)} />

          <div>
            <p className="text-xs text-muted-foreground mb-2">Category</p>
            <div className="flex gap-2">
              {categories.map((c) => (
                <button key={c.id} onClick={() => { setCategory(c.id); setGarment(null); }}
                  className={cn("flex-1 py-2 rounded-xl text-xs font-medium border transition-colors",
                    category === c.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground")}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Garment</p>
            <div className="grid grid-cols-2 gap-2">
              {(garmentTypes[category] || []).map((g) => (
                <button key={g.label} onClick={() => setGarment(g.label)}
                  className={cn("rounded-xl p-3 text-left text-xs font-medium border transition-colors",
                    garment === g.label ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground")}>
                  <span className="mr-1">{g.emoji}</span>{g.label}
                  <span className="block text-[10px] text-muted-foreground mt-0.5">
                    {(defaultMeasurementFields[g.label] || []).length} fields
                  </span>
                </button>
              ))}
            </div>
          </div>

          <SectionCard title="Measurement history">
            <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-hide">
              {history.slice(0, 6).map((m) => (
                <div key={m.id} className="rounded-2xl bg-card/60 border border-border/40 p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{m.garment}</p>
                    <p className="text-[11px] text-muted-foreground">{m.createdAt}</p>
                  </div>
                  <StatusPill label={`${Object.keys(m.fields).length} fields`} tone="neutral" />
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-xs text-muted-foreground py-3 text-center flex items-center justify-center gap-1.5">
                  <History className="w-3.5 h-3.5" /> No past measurements
                </p>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Field grid */}
        <div className="rounded-3xl card-elevated p-6 space-y-5">
          {garment ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{garment} measurements</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {client ? client.name : "No client selected"} · all values in {unit === "in" ? "inches" : "centimeters"}
                  </p>
                </div>
                <StatusPill label={`${filled}/${allFields.length} filled`} tone={filled === allFields.length ? "success" : "primary"} className="text-[10px] px-2.5" />
              </div>

              {groups.map((group) => (
                <SectionCard key={group.title} title={group.title}>
                  <div className="grid grid-cols-3 gap-4">
                    {group.fields.map((field) => (
                      <div key={field} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor={`m-${field}`} className="text-xs text-muted-foreground">{field}</label>
                          {templates.includes(field) && (
                            <button onClick={() => removeTemplateField(garment, field)} className="p-0.5">
                              <X className="w-3 h-3 text-destructive" />
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <input id={`m-${field}`} type="number" inputMode="decimal" value={values[field] || ""}
                            onChange={(e) => setValues({ ...values, [field]: e.target.value })} placeholder="0.0"
                            className="w-full bg-card border border-border rounded-xl py-2.5 px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary transition-colors" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              ))}

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1.5 block">Fitting notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                    placeholder="Posture, ease preferences, alteration notes…"
                    className="w-full bg-card border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary transition-colors resize-none" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Add a field to this template</label>
                  <div className="flex gap-2">
                    <input value={newField} onChange={(e) => setNewField(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addField()} placeholder="e.g. Back Width"
                      className="flex-1 bg-card border border-border rounded-xl py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary transition-colors" />
                    <button onClick={addField} className="px-3 rounded-xl bg-primary text-primary-foreground">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Saved to the {garment} template and reused for every client.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-secondary/40 border border-border/30 p-5 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {client ? `Saving for ${client.name}` : "Select a client before saving"}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => { setValues({}); setNotes(""); }}
                    className="rounded-full frost-card px-5 py-2.5 text-xs font-semibold text-foreground">
                    Clear
                  </button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={save}
                    className="rounded-full bg-primary text-primary-foreground text-xs font-semibold px-6 py-2.5 flex items-center gap-2">
                    <Save className="w-3.5 h-3.5" /> Save measurements
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-24 text-center">
              <p className="text-sm font-semibold text-foreground">Choose a garment</p>
              <p className="text-xs text-muted-foreground mt-1">
                Pick a client and garment type on the left to open the measurement grid.
              </p>
            </div>
          )}
        </div>
      </div>
    </DesktopOnly>
  );
};

export default MeasurementsWorkspace;
