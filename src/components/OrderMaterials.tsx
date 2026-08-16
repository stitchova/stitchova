import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Package, Truck, User, Camera, CheckCircle2, X, Clock, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useAtelier, materialsProgress, materialFlow, MATERIAL_STATUS_LABEL,
  MaterialSource, OrderMaterial, materialsDueSoon,
} from "@/contexts/AtelierContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useBrandInvoice } from "@/contexts/BrandInvoiceContext";

interface Props {
  orderId: string;
  actorName: string;
  actorRole: "designer" | "worker";
}

const sourceMeta: Record<MaterialSource, { label: string; short: string; icon: typeof Truck }> = {
  procure: { label: "To be procured", short: "We source", icon: Truck },
  client: { label: "Client-supplied", short: "Client brings", icon: User },
};

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";

const fmtStamp = (t: number) =>
  new Date(t).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

/**
 * Designer/worker-facing per-order materials checklist.
 * Covers both procurement and client hand-off, with a proof-of-receipt step.
 */
export const OrderMaterials = ({ orderId, actorName, actorRole }: Props) => {
  const {
    orderById, addOrderMaterial, updateOrderMaterial, removeOrderMaterial,
    setMaterialStatus, confirmMaterialReceived, startProduction, clientById,
  } = useAtelier();
  const { send } = useNotifications();
  const { brand } = useBrandInvoice();
  const order = orderById(orderId);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [source, setSource] = useState<MaterialSource>("procure");
  const [neededBy, setNeededBy] = useState("");
  const [requiredOverride, setRequiredOverride] = useState<boolean | null>(null);
  const [confirming, setConfirming] = useState<OrderMaterial | null>(null);
  const [proof, setProof] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  if (!order) return null;

  const list = order.materialsList || [];
  const p = materialsProgress(list);
  const defaultRequired = list.length === 0;
  const requiredValue = requiredOverride ?? defaultRequired;

  const resetAdd = () => {
    setName(""); setSource("procure"); setNeededBy(""); setRequiredOverride(null); setShowAdd(false);
  };

  const submitAdd = () => {
    if (!name.trim()) { toast.error("Give the material a name"); return; }
    addOrderMaterial(orderId, { name, source, neededBy: neededBy || undefined, requiredToStart: requiredValue });
    toast.success("Material added");
    resetAdd();
  };

  const advance = (m: OrderMaterial) => {
    const flow = materialFlow(m.source);
    const next = flow[flow.indexOf(m.status) + 1];
    if (!next) return;
    if (next === "received") { setConfirming(m); setProof(undefined); return; }
    setMaterialStatus(orderId, m.id, next);
    toast.success(`${m.name} → ${MATERIAL_STATUS_LABEL[next]}`);
  };

  const pickProof = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setProof(String(reader.result));
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  const doConfirm = () => {
    if (!confirming) return;
    confirmMaterialReceived(orderId, confirming.id, { name: actorName, role: actorRole, photo: proof });
    toast.success(`${confirming.name} confirmed received`);
    setConfirming(null); setProof(undefined);
  };

  const remindClient = () => {
    const due = materialsDueSoon(list, 7).filter(m => m.source === "client");
    const pending = (due.length ? due : list.filter(m => m.source === "client" && m.status !== "received"));
    if (!pending.length) { toast("Nothing outstanding from the client"); return; }
    const client = clientById(order.clientId);
    const recs = send({
      key: "materials_reminder",
      clientName: order.client,
      clientContact: client?.phone || "—",
      brandName: brand.businessName,
      channels: ["whatsapp"],
      tokens: {
        garment: order.garment.toLowerCase(),
        materials: pending.map(m => m.name).join(", "),
        date: fmtDate(pending.find(m => m.neededBy)?.neededBy) || "soon",
      },
      orderRef: order.id,
    });
    toast.success(recs.length ? "WhatsApp reminder sent to client" : "Reminders are turned off in templates");
  };

  const clientOutstanding = list.filter(m => m.source === "client" && m.status !== "received");

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Materials</span>
        </div>
        <button onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-1 text-[10px] font-semibold text-primary">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      {/* Progress */}
      <div className="rounded-xl bg-secondary/40 border border-border/60 p-3 mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-foreground">
            {p.total === 0 ? "No materials listed" : `${p.received} of ${p.total} materials received`}
          </span>
          <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full",
            p.ready ? "bg-status-completed/20 text-status-completed" : "bg-primary/15 text-primary")}>
            {p.ready ? "Ready to start" : "Awaiting materials"}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${p.total ? (p.received / p.total) * 100 : 0}%` }} />
        </div>
        {!p.ready && (
          <p className="text-[10px] text-muted-foreground mt-1.5">
            Waiting on: <span className="text-foreground">{p.waitingOn.join(", ")}</span>
          </p>
        )}
        {(p.waitingOnClient > 0 || p.waitingOnUs > 0) && (
          <div className="flex gap-2 mt-2">
            {p.waitingOnUs > 0 && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {p.waitingOnUs} to procure
              </span>
            )}
            {p.waitingOnClient > 0 && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {p.waitingOnClient} from client
              </span>
            )}
          </div>
        )}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="rounded-xl border border-border bg-card p-3 space-y-2 mb-3">
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Main fabric — kente print"
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
              <div className="flex gap-2">
                {(["procure", "client"] as MaterialSource[]).map((s) => {
                  const Icon = sourceMeta[s].icon;
                  return (
                    <button key={s} onClick={() => setSource(s)}
                      className={cn("flex-1 py-2 rounded-lg text-[10px] font-semibold border flex items-center justify-center gap-1",
                        source === s ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground")}>
                      <Icon className="w-3 h-3" /> {sourceMeta[s].label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <input type="date" value={neededBy} onChange={(e) => setNeededBy(e.target.value)}
                  className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none" />
                <button onClick={() => setRequiredOverride(!requiredValue)}
                  className={cn("px-3 py-2 rounded-lg text-[10px] font-semibold border whitespace-nowrap",
                    requiredValue ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground")}>
                  {requiredValue ? "✓ Required to start" : "Needed later"}
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={submitAdd} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold">Add material</button>
                <button onClick={resetAdd} className="px-3 py-2 rounded-lg bg-secondary text-muted-foreground text-[11px]">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="space-y-2">
        {list.map((m) => {
          const Icon = sourceMeta[m.source].icon;
          const flow = materialFlow(m.source);
          const idx = flow.indexOf(m.status);
          const done = m.status === "received";
          return (
            <div key={m.id} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-start gap-2">
                <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0",
                  done ? "bg-status-completed/20" : "bg-secondary")}>
                  {done ? <CheckCircle2 className="w-3.5 h-3.5 text-status-completed" /> : <Icon className="w-3 h-3 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-foreground">{m.name}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{sourceMeta[m.source].short}</span>
                    {m.requiredToStart && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-semibold">Required to start</span>
                    )}
                    {m.neededBy && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> {fmtDate(m.neededBy)}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => updateOrderMaterial(orderId, m.id, { requiredToStart: !m.requiredToStart })}
                  className="text-[9px] text-muted-foreground underline whitespace-nowrap">
                  {m.requiredToStart ? "Make optional" : "Require"}
                </button>
                <button onClick={() => removeOrderMaterial(orderId, m.id)} className="text-muted-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status flow */}
              <div className="flex items-center gap-1 mt-2">
                {flow.map((s, i) => (
                  <div key={s} className="flex items-center flex-1 gap-1">
                    <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full whitespace-nowrap",
                      i <= idx ? "bg-primary/15 text-primary font-semibold" : "bg-secondary text-muted-foreground")}>
                      {MATERIAL_STATUS_LABEL[s]}
                    </span>
                    {i < flow.length - 1 && <div className={cn("flex-1 h-px", i < idx ? "bg-primary" : "bg-border")} />}
                  </div>
                ))}
              </div>

              {!done && (
                <button onClick={() => advance(m)}
                  className="w-full mt-2 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
                  {flow[idx + 1] === "received" ? "Confirm received" : `Mark ${MATERIAL_STATUS_LABEL[flow[idx + 1]]}`}
                </button>
              )}

              {m.status === "dropped_off" && (
                <p className="text-[9px] text-muted-foreground mt-1.5">
                  Client marked as dropped off {m.droppedOffAt ? `· ${fmtStamp(m.droppedOffAt)}` : ""} — awaiting your confirmation.
                </p>
              )}

              {m.confirmation && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-status-completed/10 border border-status-completed/25 p-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-status-completed flex-shrink-0" />
                  <p className="text-[9px] text-foreground flex-1">
                    Confirmed by {m.confirmation.byName} ({m.confirmation.byRole}) · {fmtStamp(m.confirmation.at)}
                  </p>
                  {m.confirmation.photo && (
                    <img src={m.confirmation.photo} alt="Proof of receipt" className="w-8 h-8 rounded object-cover" />
                  )}
                </div>
              )}
            </div>
          );
        })}
        {list.length === 0 && (
          <p className="text-[11px] text-muted-foreground text-center py-3">
            No materials listed yet. Add the main fabric first — it's set as required to start.
          </p>
        )}
      </div>

      {clientOutstanding.length > 0 && (
        <button onClick={remindClient}
          className="w-full mt-3 py-2 rounded-xl border border-border bg-card text-[11px] font-semibold text-foreground flex items-center justify-center gap-1.5">
          <Send className="w-3.5 h-3.5 text-primary" /> Send WhatsApp drop-off reminder
        </button>
      )}

      {order.awaitingMaterials && (
        <button
          disabled={!p.ready}
          onClick={() => { startProduction(orderId); toast.success("Production started — order moved to Cutting"); }}
          className={cn("w-full mt-2 py-2.5 rounded-xl text-[11px] font-bold",
            p.ready ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground cursor-not-allowed")}>
          {p.ready ? "Start production (Cutting)" : "Required materials not received yet"}
        </button>
      )}

      {/* Confirm receipt dialog */}
      <AnimatePresence>
        {confirming && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-bold text-foreground">Confirm received</p>
              <p className="text-[11px] text-muted-foreground mt-1">{confirming.name}</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickProof} />
              <button onClick={() => fileRef.current?.click()}
                className="w-full mt-3 py-2.5 rounded-xl border border-dashed border-border text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
                <Camera className="w-3.5 h-3.5" /> {proof ? "Photo attached — replace" : "Attach photo (optional)"}
              </button>
              {proof && <img src={proof} alt="Proof" className="w-full h-32 object-cover rounded-xl mt-2" />}
              <p className="text-[10px] text-muted-foreground mt-3">
                Recorded as confirmed by <span className="text-foreground font-semibold">{actorName}</span> ({actorRole}) with a timestamp.
              </p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { setConfirming(null); setProof(undefined); }}
                  className="flex-1 py-2.5 rounded-xl bg-secondary text-muted-foreground text-[11px] font-semibold">Cancel</button>
                <button onClick={doConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-[11px] font-bold">Confirm received</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrderMaterials;
