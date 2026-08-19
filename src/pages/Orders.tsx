import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Filter, ChevronRight, Plus, X, CheckCircle2, XCircle, Image as ImageIcon, Truck, Package, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ClientPicker from "@/components/ClientPicker";
import OrdersWorkspace from "@/components/orders/OrdersWorkspace";
import { useAtelier, BASE_STAGES, OPTIONAL_STAGES, PAYMENT_METHODS, parsePrice, money, costFromFabricUse, costFromMaterialUse, materialsProgress, MaterialSource, OrderMaterial } from "@/contexts/AtelierContext";

const statusTabs = ["All", "Requested", "Active", "Completed"];

const garmentCategories: Record<string, string[]> = {
  Men: ["Trousers", "Shirt", "Suit", "Blazer", "Agbada", "Senator", "Kaftan"],
  Women: ["Gown", "Skirt", "Blouse", "Jumpsuit", "Bridal", "Iro & Buba", "Wrapper"],
  Children: ["Uniforms", "Dresses", "Shirts", "Trousers"],
};

const Orders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const { orders, addOrder, fabrics, materials, deductFabric, deductMaterial, confirmOrder, declineOrder } = useAtelier();

  const [activeTab, setActiveTab] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [awaitingOnly, setAwaitingOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [newOrder, setNewOrder] = useState({
    type: "", clientId: "", clientName: "",
    category: "Men" as "Men" | "Women" | "Children",
    garment: "", price: "", deposit: "", paymentMethod: PAYMENT_METHODS[0],
    date: "", styleDesc: "",
    deliveryMethod: "pickup" as "pickup" | "delivery",
    deliveryAddress: "", deliveryDate: "",
  });
  const [stagesOn, setStagesOn] = useState<Record<string, boolean>>({ Beading: false, Fitting: true });
  const [fabricPicks, setFabricPicks] = useState<Record<string, number>>({});
  const [materialPicks, setMaterialPicks] = useState<Record<string, number>>({});
  const [orderPhotos, setOrderPhotos] = useState<string[]>([]);
  // Per-order materials checklist captured at creation time
  const [reqMaterials, setReqMaterials] = useState<{ name: string; source: MaterialSource; neededBy: string; requiredToStart: boolean }[]>([]);
  const [matDraft, setMatDraft] = useState<{ name: string; source: MaterialSource; neededBy: string }>({ name: "", source: "procure", neededBy: "" });

  useEffect(() => {
    if (params.get("new") === "1") {
      setShowNewOrder(true);
      params.delete("new");
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const statusLabel = (o: typeof orders[number]) => {
    if (o.status === "requested") return "Requested";
    if (o.status === "completed") return "Completed";
    if (o.status === "declined") return "Declined";
    if (o.awaitingMaterials) return "Awaiting Materials";
    return o.stages[o.currentStage] || "Active";
  };

  const stageColor = (o: typeof orders[number]) => {
    if (o.status === "requested") return "bg-primary/60";
    if (o.status === "completed") return "bg-status-completed";
    if (o.status === "declined") return "bg-destructive/70";
    if (o.awaitingMaterials) return "bg-muted-foreground";
    const s = o.stages[o.currentStage];
    if (s === "Cutting") return "bg-status-cutting";
    if (s === "Sewing") return "bg-status-sewing";
    return "bg-primary";
  };

  const filtered = orders.filter((o) => {
    let matchStatus = true;
    if (activeTab === "Requested") matchStatus = o.status === "requested";
    else if (activeTab === "Active") matchStatus = o.status === "active";
    else if (activeTab === "Completed") matchStatus = o.status === "completed";
    const matchCategory = activeCategory === "All" || o.category === activeCategory;
    const matchAwaiting = !awaitingOnly || o.awaitingMaterials;
    const matchSearch = `${o.type} ${o.client} ${o.garment}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchCategory && matchAwaiting && matchSearch;
  });

  const resetForm = () => {
    setNewOrder({ type: "", clientId: "", clientName: "", category: "Men", garment: "", price: "", deposit: "", paymentMethod: PAYMENT_METHODS[0], date: "", styleDesc: "", deliveryMethod: "pickup", deliveryAddress: "", deliveryDate: "" });
    setStagesOn({ Beading: false, Fitting: true });
    setFabricPicks({});
    setMaterialPicks({});
    setOrderPhotos([]);
    setReqMaterials([]);
    setMatDraft({ name: "", source: "procure", neededBy: "" });
  };

  const addDraftMaterial = () => {
    if (!matDraft.name.trim()) return;
    setReqMaterials((prev) => [...prev, {
      name: matDraft.name.trim(),
      source: matDraft.source,
      neededBy: matDraft.neededBy,
      // First material added defaults to "required to start" (usually the main fabric).
      requiredToStart: prev.length === 0,
    }]);
    setMatDraft({ name: "", source: "procure", neededBy: "" });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.slice(0, 5).forEach((f) => {
      if (f.size > 4 * 1024 * 1024) { toast({ title: "Photo skipped", description: `${f.name} exceeds 4MB.`, variant: "destructive" }); return; }
      const reader = new FileReader();
      reader.onload = () => setOrderPhotos((p) => [...p, String(reader.result)]);
      reader.readAsDataURL(f);
    });
  };

  const buildStages = () => {
    const stages = [...BASE_STAGES];
    if (stagesOn.Beading) stages.splice(2, 0, "Beading"); // after Sewing
    if (stagesOn.Fitting) stages.splice(stages.indexOf("Finishing"), 0, "Fitting"); // before Finishing
    return stages;
  };

  const handleCreateOrder = () => {
    if (!newOrder.type.trim() || !newOrder.clientId) {
      toast({ title: "Missing info", description: "Pick a client and set the order type.", variant: "destructive" });
      return;
    }
    const price = parsePrice(newOrder.price);
    const deposit = parsePrice(newOrder.deposit);
    const stages = buildStages();
    const fabricUse = Object.entries(fabricPicks)
      .filter(([, a]) => a > 0)
      .map(([id, amount]) => {
        const f = fabrics.find((x) => x.id === id)!;
        return { id, name: f.name, amount, unit: "yards" };
      });
    const materialUse = Object.entries(materialPicks)
      .filter(([, a]) => a > 0)
      .map(([id, amount]) => {
        const m = materials.find((x) => x.id === id)!;
        return { id, name: m.name, amount, unit: "units" };
      });

    // Auto-fill cost breakdown from inventory pricing so margins aren't 0 by default.
    const fabricCost = costFromFabricUse(fabricUse, fabrics);
    const materialsCost = costFromMaterialUse(materialUse, materials);

    const materialsList: OrderMaterial[] = reqMaterials.map((m, i) => ({
      id: `omat-${Date.now()}-${i}`,
      name: m.name,
      source: m.source,
      neededBy: m.neededBy || undefined,
      requiredToStart: m.requiredToStart,
      status: "needed",
      createdAt: Date.now(),
    }));

    const created = addOrder({
      clientId: newOrder.clientId,
      client: newOrder.clientName,
      type: newOrder.type,
      category: newOrder.category,
      garment: newOrder.garment || garmentCategories[newOrder.category]?.[0] || "",
      styleDesc: newOrder.styleDesc || "",
      price, currency: "GHS",
      dueDate: newOrder.date
        ? new Date(newOrder.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      stages, currentStage: 0,
      fabricUse, materialUse,
      status: "active",
      payments: deposit > 0 ? [{ id: `pay-${Date.now()}`, amount: deposit, method: newOrder.paymentMethod, date: new Date().toISOString().split("T")[0] }] : [],
      source: "manual",
      photos: orderPhotos,
      deliveryMethod: newOrder.deliveryMethod,
      deliveryAddress: newOrder.deliveryMethod === "delivery" ? newOrder.deliveryAddress : undefined,
      deliveryDate: newOrder.deliveryDate || undefined,
      deliveryStatus: "pending",
      costs: { fabric: Math.round(fabricCost), materials: Math.round(materialsCost) },
      materialsList,
      awaitingMaterials: materialsList.length > 0,
    });

    fabricUse.forEach((f) => deductFabric(f.id, f.amount));
    materialUse.forEach((m) => deductMaterial(m.id, m.amount));

    setShowNewOrder(false);
    resetForm();
    toast({ title: "Order created!", description: `${created.type} for ${created.client} added.` });
  };

  const inputClass = "w-full bg-secondary/50 border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all";

  const requestedCount = orders.filter((o) => o.status === "requested").length;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Tablet/desktop workspace layout */}
      <OrdersWorkspace onNewOrder={() => setShowNewOrder(true)} />

      {/* Mobile layout (unchanged) */}
      <div className="lg:hidden">
      <div className="designer-hero px-5 pt-6 pb-5 rounded-b-3xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold shimmer-text">Orders</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage all your fashion orders</p>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowNewOrder(true)}
          className="w-11 h-11 rounded-full bg-primary flex items-center justify-center glow-primary">
          <Plus className="w-4 h-4 text-primary-foreground" />
        </motion.button>
      </div>

      <div className="px-5 py-3 mt-2 flex gap-2">
        <div className="flex items-center gap-3 glass-input px-4 py-3 flex-1">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground flex-1 outline-none" />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <motion.button whileTap={{ scale: 0.9 }} className={cn("w-12 h-12 rounded-xl frost-card flex items-center justify-center", awaitingOnly && "ring-2 ring-primary")}>
              <Filter className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-2 bg-popover z-50">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 pt-1 pb-2">Filter</p>
            <button onClick={() => setAwaitingOnly((v) => !v)}
              className={cn("w-full flex items-center justify-between gap-2 px-2 py-2 rounded-lg text-xs font-medium",
                awaitingOnly ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary")}>
              <span>Awaiting materials only</span>
              {awaitingOnly && <CheckCircle2 className="w-3.5 h-3.5" />}
            </button>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-2 px-5 mb-2 overflow-x-auto scrollbar-hide">
        {["All", "Men", "Women", "Children"].map((c) => (
          <button key={c} onClick={() => setActiveCategory(c)}
            className={cn("px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors",
              activeCategory === c ? "bg-secondary text-foreground" : "text-muted-foreground")}>
            {c}
          </button>
        ))}
      </div>

      <div className="flex gap-2 px-5 mb-4 overflow-x-auto scrollbar-hide">
        {statusTabs.map((t) => (
          <motion.button key={t} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(t)}
            className={cn("relative px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors",
              activeTab === t ? "text-primary-foreground" : "frost-card text-muted-foreground")}>
            {activeTab === t && (
              <motion.div layoutId="ordersStatusIndicator"
                className="absolute inset-0 rounded-xl bg-primary glow-primary"
                transition={{ type: "spring", stiffness: 400, damping: 30 }} />
            )}
            <span className="relative z-10">
              {t}{t === "Requested" && requestedCount > 0 ? ` (${requestedCount})` : ""}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="px-5 space-y-3">
        {filtered.map((o, i) => (
          <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            whileTap={{ scale: 0.98 }} whileHover={{ y: -1 }}
            onClick={() => navigate(`/order/${o.id}`)} className="frost-card p-3 flex gap-3 cursor-pointer">
            <img src={o.img} alt={o.type} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{o.type}</p>
                  <p className="text-[11px] text-muted-foreground">{o.client}</p>
                </div>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${stageColor(o)} text-primary-foreground`}>{statusLabel(o)}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{o.category}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{o.garment}</span>
                {o.source === "marketplace" && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/15 text-primary">Marketplace</span>
                )}
              </div>
              {o.awaitingMaterials && (() => {
                const mp = materialsProgress(o.materialsList);
                return (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-foreground flex items-center gap-1">
                      <Package className="w-2.5 h-2.5 text-primary" /> {mp.received}/{mp.total} materials
                    </span>
                    {mp.waitingOnClient > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                        <User className="w-2.5 h-2.5" /> waiting on client
                      </span>
                    )}
                    {mp.waitingOnUs > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground flex items-center gap-1">
                        <Truck className="w-2.5 h-2.5" /> to procure
                      </span>
                    )}
                  </div>
                );
              })()}
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[11px] text-muted-foreground">Due: {o.dueDate}</span>
                <span className="text-xs font-bold text-primary">{money(o.price, o.currency)}</span>
              </div>
              {o.status === "requested" && (
                <div className="flex gap-2 mt-2">
                  <button onClick={(e) => { e.stopPropagation(); confirmOrder(o.id); toast({ title: "Order confirmed" }); }}
                    className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Confirm
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); declineOrder(o.id); toast({ title: "Order declined" }); }}
                    className="flex-1 py-1.5 rounded-lg bg-destructive/15 text-destructive text-[10px] font-bold flex items-center justify-center gap-1">
                    <XCircle className="w-3 h-3" /> Decline
                  </button>
                </div>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground self-center flex-shrink-0" />
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No orders match your filters</p>
          </div>
        )}
      </div>
      </div>

      {/* New Order Dialog */}
      <Dialog open={showNewOrder} onOpenChange={(o) => { setShowNewOrder(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-sm mx-auto bg-card border-border max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">New Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <ClientPicker
              value={newOrder.clientId || null}
              onChange={(id, c) => setNewOrder((p) => ({
                ...p, clientId: id, clientName: c.name,
                category: c.gender === "Male" ? "Men" : c.gender === "Female" ? "Women" : p.category,
              }))}
            />
            <input value={newOrder.type} onChange={(e) => setNewOrder(p => ({ ...p, type: e.target.value }))}
              placeholder="Order type (e.g. Wedding Gown) *" className={inputClass} />

            <div>
              <p className="text-xs text-muted-foreground mb-2">Category</p>
              <div className="flex gap-2">
                {["Men", "Women", "Children"].map((c) => (
                  <button key={c} onClick={() => setNewOrder(p => ({ ...p, category: c as any, garment: "" }))}
                    className={cn("px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex-1",
                      newOrder.category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Garment Type</p>
              <div className="flex gap-2 flex-wrap">
                {(garmentCategories[newOrder.category] || []).map((g) => (
                  <button key={g} onClick={() => setNewOrder(p => ({ ...p, garment: g }))}
                    className={cn("px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors",
                      newOrder.garment === g ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Production Stages</p>
              <div className="flex flex-wrap gap-1.5">
                {BASE_STAGES.map((s) => (
                  <span key={s} className="px-2 py-1 rounded-lg text-[10px] font-medium bg-primary/10 text-primary">{s}</span>
                ))}
                {OPTIONAL_STAGES.map((s) => (
                  <button key={s} onClick={() => setStagesOn((p) => ({ ...p, [s]: !p[s] }))}
                    className={cn("px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors",
                      stagesOn[s] ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground")}>
                    {stagesOn[s] ? "✓ " : "+ "}{s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input value={newOrder.price} onChange={(e) => setNewOrder(p => ({ ...p, price: e.target.value }))}
                placeholder="Total (GHS)" className={inputClass} />
              <input value={newOrder.deposit} onChange={(e) => setNewOrder(p => ({ ...p, deposit: e.target.value }))}
                placeholder="Deposit (GHS)" className={inputClass} />
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Payment Method</p>
              <div className="flex flex-wrap gap-1.5">
                {PAYMENT_METHODS.map((m) => (
                  <button key={m} onClick={() => setNewOrder(p => ({ ...p, paymentMethod: m }))}
                    className={cn("px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-colors",
                      newOrder.paymentMethod === m ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground")}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <input type="date" value={newOrder.date} onChange={(e) => setNewOrder(p => ({ ...p, date: e.target.value }))}
              className={inputClass} />

            <div>
              <p className="text-xs text-muted-foreground mb-2">Fabrics from inventory</p>
              <div className="space-y-1.5">
                {fabrics.map((f) => (
                  <div key={f.id} className="flex items-center gap-2">
                    <input type="checkbox" checked={fabricPicks[f.id] !== undefined}
                      onChange={(e) => setFabricPicks((p) => {
                        const next = { ...p };
                        if (e.target.checked) next[f.id] = 1; else delete next[f.id];
                        return next;
                      })} />
                    <span className="flex-1 text-[11px] text-foreground truncate">{f.name} · <span className="text-muted-foreground">{f.qty}</span></span>
                    {fabricPicks[f.id] !== undefined && (
                      <input type="number" step="0.1" min="0" value={fabricPicks[f.id]}
                        onChange={(e) => setFabricPicks((p) => ({ ...p, [f.id]: parseFloat(e.target.value) || 0 }))}
                        className="w-16 bg-secondary/50 border border-border rounded-lg px-2 py-1 text-[11px] text-foreground outline-none" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Materials from inventory</p>
              <div className="space-y-1.5">
                {materials.map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <input type="checkbox" checked={materialPicks[m.id] !== undefined}
                      onChange={(e) => setMaterialPicks((p) => {
                        const next = { ...p };
                        if (e.target.checked) next[m.id] = 1; else delete next[m.id];
                        return next;
                      })} />
                    <span className="flex-1 text-[11px] text-foreground truncate">{m.name} · <span className="text-muted-foreground">{m.qty}</span></span>
                    {materialPicks[m.id] !== undefined && (
                      <input type="number" step="1" min="0" value={materialPicks[m.id]}
                        onChange={(e) => setMaterialPicks((p) => ({ ...p, [m.id]: parseFloat(e.target.value) || 0 }))}
                        className="w-16 bg-secondary/50 border border-border rounded-lg px-2 py-1 text-[11px] text-foreground outline-none" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <textarea value={newOrder.styleDesc} onChange={(e) => setNewOrder(p => ({ ...p, styleDesc: e.target.value }))}
              placeholder="Style description..." rows={2}
              className={inputClass + " resize-none"} />

            {/* Required materials for this order */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Required Materials (tracked before production)</p>
              {reqMaterials.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {reqMaterials.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-foreground truncate">{m.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-muted-foreground">
                            {m.source === "client" ? "Client-supplied" : "To be procured"}
                          </span>
                          {m.neededBy && <span className="text-[9px] text-muted-foreground">· by {m.neededBy}</span>}
                        </div>
                      </div>
                      <button onClick={() => setReqMaterials(prev => prev.map((x, idx) => idx === i ? { ...x, requiredToStart: !x.requiredToStart } : x))}
                        className={cn("text-[9px] px-2 py-1 rounded-lg border whitespace-nowrap",
                          m.requiredToStart ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>
                        {m.requiredToStart ? "Required to start" : "Needed later"}
                      </button>
                      <button onClick={() => setReqMaterials(prev => prev.filter((_, idx) => idx !== i))}>
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2 rounded-xl border border-dashed border-border p-2.5">
                <input value={matDraft.name} onChange={(e) => setMatDraft(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Main fabric — kente print" className={inputClass} />
                <div className="flex gap-2">
                  {(["procure", "client"] as MaterialSource[]).map((s) => (
                    <button key={s} onClick={() => setMatDraft(p => ({ ...p, source: s }))}
                      className={cn("flex-1 py-2 rounded-xl text-[10px] font-medium border flex items-center justify-center gap-1",
                        matDraft.source === s ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground")}>
                      {s === "client" ? <User className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                      {s === "client" ? "Client-supplied" : "To be procured"}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="date" value={matDraft.neededBy} onChange={(e) => setMatDraft(p => ({ ...p, neededBy: e.target.value }))}
                    className={inputClass + " flex-1"} />
                  <button onClick={addDraftMaterial}
                    className="px-4 rounded-xl bg-secondary text-foreground text-[11px] font-semibold">Add</button>
                </div>
                <p className="text-[9px] text-muted-foreground">
                  The first material added is set as “required to start”. Tap the tag on any item to change it.
                </p>
              </div>
            </div>

            {/* Delivery method */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Delivery Method</p>
              <div className="flex gap-2 mb-2">
                {(["pickup", "delivery"] as const).map((m) => (
                  <button key={m} onClick={() => setNewOrder(p => ({ ...p, deliveryMethod: m }))}
                    className={cn("flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition-colors capitalize",
                      newOrder.deliveryMethod === m ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground")}>
                    {m === "pickup" ? <Package className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />} {m}
                  </button>
                ))}
              </div>
              {newOrder.deliveryMethod === "delivery" && (
                <input value={newOrder.deliveryAddress} onChange={(e) => setNewOrder(p => ({ ...p, deliveryAddress: e.target.value }))}
                  placeholder="Delivery address" className={inputClass + " mb-2"} />
              )}
              <input type="datetime-local" value={newOrder.deliveryDate}
                onChange={(e) => setNewOrder(p => ({ ...p, deliveryDate: e.target.value }))}
                className={inputClass} placeholder="Scheduled date/time" />
            </div>

            {/* Reference photos */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Reference / Inspiration Photos</p>
              {orderPhotos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto mb-2">
                  {orderPhotos.map((p, i) => (
                    <div key={i} className="relative flex-shrink-0">
                      <img src={p} alt="ref" className="w-16 h-16 rounded-lg object-cover" />
                      <button onClick={() => setOrderPhotos(pp => pp.filter((_, idx) => idx !== i))}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border bg-card cursor-pointer text-xs text-muted-foreground">
                <ImageIcon className="w-4 h-4" /> Attach photos (up to 5)
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={handleCreateOrder}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/25">
              Create Order
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
