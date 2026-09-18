import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, X, ImagePlus, Trash2, Package, Check, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useShop, SHOP_CATEGORIES, ShopCategory, ShopProduct } from "@/contexts/ShopContext";
import { useToast } from "@/hooks/use-toast";
import { formatMoney } from "@/lib/currency";
import FeatureGate from "@/components/FeatureGate";

// Mirrors the exact upload pattern already used in ShowcaseCreate.tsx —
// this is a prototype, so images become base64 data URLs (no real file
// storage backend exists in this app yet).
const fileToDataUrl = (f: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(f);
  });

const SWATCHES = ["#C9A876", "#1A1A1A", "#3A3A3A", "#8B1E3F", "#0F3D3E", "#5A4632", "#D97706", "#FFFFFF"];
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

// Mock designer id used throughout the app's other prototype pages.
const CURRENT_DESIGNER_ID = "nana-ama";

const emptyDraft = {
  name: "", description: "", category: "Outerwear" as ShopCategory,
  price: "", images: [] as string[], sizes: [] as string[], colors: [] as string[], stock: "",
};

const DesignerMyShop = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { productsByDesigner, addProduct, updateProduct, deleteProduct } = useShop();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);

  const products = productsByDesigner(CURRENT_DESIGNER_ID);

  const openNew = () => { setDraft(emptyDraft); setEditingId(null); setShowForm(true); };
  const openEdit = (p: ShopProduct) => {
    setDraft({ name: p.name, description: p.description, category: p.category, price: String(p.price), images: p.images, sizes: p.sizes, colors: p.colors, stock: String(p.stock) });
    setEditingId(p.id); setShowForm(true);
  };

  const onImages = async (files: FileList | null) => {
    if (!files) return;
    const urls = await Promise.all(Array.from(files).slice(0, 5 - draft.images.length).map(fileToDataUrl));
    setDraft((d) => ({ ...d, images: [...d.images, ...urls].slice(0, 5) }));
  };

  const toggleSize = (s: string) => setDraft((d) => ({ ...d, sizes: d.sizes.includes(s) ? d.sizes.filter((x) => x !== s) : [...d.sizes, s] }));
  const toggleColor = (c: string) => setDraft((d) => ({ ...d, colors: d.colors.includes(c) ? d.colors.filter((x) => x !== c) : [...d.colors, c] }));

  const canSave = draft.name.trim() && draft.price && Number(draft.price) > 0 && draft.images.length > 0 && draft.sizes.length > 0 && draft.colors.length > 0 && draft.stock;

  const handleSave = () => {
    if (!canSave) { toast({ title: "Fill in name, price, at least one photo, size and color." }); return; }
    setSaving(true);
    const payload = {
      designerId: CURRENT_DESIGNER_ID, name: draft.name.trim(), description: draft.description.trim(),
      category: draft.category, price: Number(draft.price), currency: "GHS",
      images: draft.images, sizes: draft.sizes, colors: draft.colors,
      stock: Number(draft.stock), active: true,
    };
    if (editingId) updateProduct(editingId, payload);
    else addProduct(payload);
    setSaving(false);
    setShowForm(false);
    toast({ title: editingId ? "Product updated" : "Product added to your shop" });
  };

  return (
    <FeatureGate requiredPlan="pro" feature="My Shop">
      <div className="min-h-screen bg-background pb-24">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/50">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground flex items-center gap-2"><Package className="w-5 h-5 text-primary" /> My Shop</h1>
            <p className="text-[11px] text-muted-foreground">{products.length} product{products.length !== 1 ? "s" : ""} · shown on your client-facing profile</p>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={openNew} className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <Plus className="w-4 h-4 text-primary-foreground" />
          </motion.button>
        </div>

        <div className="px-4 pt-4 grid grid-cols-2 gap-3">
          {products.map((p) => (
            <div key={p.id} className="rounded-2xl bg-card border border-border overflow-hidden">
              <div className="relative aspect-[4/5]">
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button onClick={() => openEdit(p)} className="w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <Pencil className="w-3 h-3 text-foreground" />
                  </button>
                  <button onClick={() => { if (confirm("Remove this product from your shop?")) { deleteProduct(p.id); toast({ title: "Product removed" }); } }}
                    className="w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </div>
                {!p.active && (
                  <span className="absolute bottom-2 left-2 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-background/80 text-muted-foreground">Hidden</span>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs font-bold text-primary">{formatMoney(p.price)}</p>
                  <p className="text-[10px] text-muted-foreground">{p.stock} in stock</p>
                </div>
                <button onClick={() => updateProduct(p.id, { active: !p.active })}
                  className="w-full mt-2 py-1.5 rounded-lg bg-secondary text-[10px] font-semibold text-foreground">
                  {p.active ? "Hide from shop" : "Show in shop"}
                </button>
              </div>
            </div>
          ))}

          <button onClick={openNew} className="rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 aspect-[4/5] text-muted-foreground">
            <Plus className="w-6 h-6" />
            <span className="text-[11px] font-medium">Add product</span>
          </button>
        </div>
      </div>

      {/* Add/Edit sheet */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background overflow-y-auto">
            <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/50">
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-foreground" /></button>
              <h2 className="text-sm font-semibold text-foreground flex-1">{editingId ? "Edit product" : "New product"}</h2>
              <button onClick={handleSave} disabled={!canSave || saving}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-40 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Save
              </button>
            </div>

            <div className="p-4 space-y-5">
              {/* Images */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Photos</p>
                <div className="flex gap-2 flex-wrap">
                  {draft.images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setDraft((d) => ({ ...d, images: d.images.filter((_, j) => j !== i) }))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center">
                        <X className="w-3 h-3 text-foreground" />
                      </button>
                    </div>
                  ))}
                  {draft.images.length < 5 && (
                    <button onClick={() => imageRef.current?.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
                      <ImagePlus className="w-5 h-5" />
                    </button>
                  )}
                  <input ref={imageRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onImages(e.target.files)} />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Product name</p>
                <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. Beige Trench Coat"
                  className="w-full bg-card border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary" />
              </div>

              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Description</p>
                <textarea value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} rows={3}
                  placeholder="Describe the fabric, fit and finish…"
                  className="w-full bg-card border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Price (GHS)</p>
                  <input type="number" value={draft.price} onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))} placeholder="0.00"
                    className="w-full bg-card border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Stock quantity</p>
                  <input type="number" value={draft.stock} onChange={(e) => setDraft((d) => ({ ...d, stock: e.target.value }))} placeholder="0"
                    className="w-full bg-card border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary" />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Category</p>
                <div className="flex gap-2 flex-wrap">
                  {SHOP_CATEGORIES.map((c) => (
                    <button key={c} onClick={() => setDraft((d) => ({ ...d, category: c }))}
                      className={`px-3 py-2 rounded-full text-xs font-semibold transition-colors ${
                        draft.category === c ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Available sizes</p>
                <div className="flex gap-2 flex-wrap">
                  {SIZE_OPTIONS.map((s) => (
                    <button key={s} onClick={() => toggleSize(s)}
                      className={`w-11 h-11 rounded-xl text-xs font-semibold transition-colors ${
                        draft.sizes.includes(s) ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Available colors</p>
                <div className="flex gap-2 flex-wrap">
                  {SWATCHES.map((c) => (
                    <button key={c} onClick={() => toggleColor(c)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${draft.colors.includes(c) ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "border border-border"}`}
                      style={{ backgroundColor: c }}>
                      {draft.colors.includes(c) && <Check className="w-3.5 h-3.5" style={{ color: c === "#FFFFFF" ? "#000" : "#fff" }} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </FeatureGate>
  );
};

export default DesignerMyShop;
