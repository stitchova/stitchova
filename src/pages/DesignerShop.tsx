import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, ShoppingCart, Heart, Sparkles, Shirt, ShoppingBag, Glasses, Truck, RefreshCcw, ShieldCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useShop, SHOP_CATEGORIES } from "@/contexts/ShopContext";
import { formatMoney } from "@/lib/currency";
import EmptyState from "@/components/EmptyState";
import { Package } from "lucide-react";
import DesignerShopWorkspace from "@/components/client-desktop/DesignerShopWorkspace";

/**
 * Client-facing designer shop — the "Add to Bag" / "Buy Now" flow here is a
 * full mock checkout (see ShopContext.tsx for what's mocked vs real).
 */

const designerNames: Record<string, string> = {
  "nana-ama": "Nana Ama Couture",
  "kwame-styles": "Kwame Styles",
  "efya-designs": "Efya Designs",
};

const categoryIcons = [Shirt, Shirt, Shirt, Shirt, Shirt, ShoppingBag, Glasses];


const DesignerShop = () => {
  const navigate = useNavigate();
  const { id = "nana-ama" } = useParams();
  const { activeProductsByDesigner, cartCount } = useShop();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [liked, setLiked] = useState<string[]>([]);

  const designerName = designerNames[id] || "Designer";
  const products = activeProductsByDesigner(id);
  const filtered = useMemo(
    () => products.filter((p) =>
      (!category || p.category === category) &&
      p.name.toLowerCase().includes(query.toLowerCase())
    ),
    [products, category, query]
  );

  const categoriesInUse = useMemo(
    () => SHOP_CATEGORIES.filter((c) => products.some((p) => p.category === c)),
    [products]
  );

  return (
    <>
      <DesignerShopWorkspace
        designerId={id} designerName={designerName} products={products} filtered={filtered}
        categoriesInUse={categoriesInUse} category={category} setCategory={setCategory}
        query={query} setQuery={setQuery} liked={liked} setLiked={setLiked} cartCount={cartCount}
      />

      <div className="min-h-screen bg-background pb-10 lg:hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-4 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card flex items-center justify-center flex-shrink-0">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </motion.button>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground">Shop</p>
              <h1 className="text-base font-bold text-foreground truncate">{designerName}</h1>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/cart")} className="relative w-9 h-9 rounded-full bg-card flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-4 h-4 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </motion.button>
          </div>

          <div className="mt-3 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for products…"
              className="w-full bg-card border border-border rounded-2xl py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
          </div>
        </div>

        {/* Category rail */}
        {categoriesInUse.length > 0 && (
          <div className="px-4 pb-4 flex gap-3 overflow-x-auto scrollbar-hide">
            {[{ key: null as string | null, label: "New In" }, ...categoriesInUse.map((c) => ({ key: c as string | null, label: c }))].map((item, i) => {
              const Icon = item.key === null ? Sparkles : categoryIcons[(i - 1) % categoryIcons.length];
              const active = category === item.key;
              return (
                <button key={item.label} onClick={() => setCategory(item.key)} className="flex-shrink-0 flex flex-col items-center gap-1.5 w-16">
                  <span className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors ${
                    active ? "bg-primary/15 border-primary text-primary" : "bg-card border-border text-muted-foreground"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className={`text-[10px] font-semibold truncate w-full text-center ${active ? "text-foreground" : "text-muted-foreground"}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}


        {/* Product grid */}
        <div className="px-4 grid grid-cols-2 gap-3 mt-1">
          <AnimatePresence>
            {filtered.map((p, i) => (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/designer/${id}/shop/${p.id}`)}
                className="text-left rounded-2xl bg-card border border-border overflow-hidden"
              >
                <div className="relative aspect-[4/5]">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setLiked((l) => l.includes(p.id) ? l.filter((x) => x !== p.id) : [...l, p.id]); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Heart className={`w-3.5 h-3.5 ${liked.includes(p.id) ? "fill-primary text-primary" : "text-foreground"}`} />
                  </button>
                  {p.stock <= 3 && p.stock > 0 && (
                    <span className="absolute bottom-2 left-2 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-background/80 text-foreground">
                      Only {p.stock} left
                    </span>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                  <p className="text-xs font-bold text-primary mt-0.5">{formatMoney(p.price)}</p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="px-4 mt-8">
            <EmptyState icon={Package} title="No products found" description="Try a different search or category." />
          </div>
        )}

        <div className="px-4 mt-6">
          <div className="grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card/60 py-3">
            {[
              { Icon: Truck, label: "Free Shipping" },
              { Icon: RefreshCcw, label: "Easy Returns" },
              { Icon: ShieldCheck, label: "Secure Payment" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 px-2">
                <Icon className="w-4 h-4 text-primary" />
                <p className="text-[9px] font-semibold text-foreground text-center">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </>
  );
};

export default DesignerShop;
