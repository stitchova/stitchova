import { Search, ShoppingCart, Heart, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShopProduct } from "@/contexts/ShopContext";
import { formatMoney } from "@/lib/currency";
import EmptyState from "@/components/EmptyState";
import { Package } from "lucide-react";

/**
 * Desktop shop workspace — the closest literal match to the reference
 * layout (category sidebar + hero "new arrival" card + product grid),
 * rebuilt entirely with theme tokens so it follows all 7 themes instead
 * of the reference's fixed dark/gold palette.
 */

interface Props {
  designerId: string;
  designerName: string;
  products: ShopProduct[];
  filtered: ShopProduct[];
  categoriesInUse: string[];
  category: string | null;
  setCategory: (c: string | null) => void;
  query: string;
  setQuery: (q: string) => void;
  liked: string[];
  setLiked: (fn: (l: string[]) => string[]) => void;
  cartCount: number;
}

const DesignerShopWorkspace = ({
  designerId, designerName, products, filtered, categoriesInUse, category, setCategory,
  query, setQuery, liked, setLiked, cartCount,
}: Props) => {
  const navigate = useNavigate();
  const hero = products[0]; // most recently added product, used as the "New Arrival" feature
  const rest = filtered.filter((p) => p.id !== hero?.id);

  return (
    <div className="hidden lg:flex min-h-screen bg-background">
      {/* Category sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border/60 p-6 flex flex-col">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Shop</p>
        <h1 className="text-2xl font-bold text-foreground mt-1 mb-6 truncate">{designerName}</h1>

        <nav className="space-y-1 flex-1">
          <button onClick={() => setCategory(null)}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              category === null ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
            }`}>
            All products
          </button>
          {categoriesInUse.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                category === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}>
              {c}
            </button>
          ))}
        </nav>

        <button onClick={() => navigate(`/designer/${designerId}`)}
          className="mt-6 rounded-2xl bg-secondary p-4 text-left hover:bg-secondary/70 transition-colors">
          <p className="text-xs font-semibold text-foreground">Back to profile</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Portfolio, reviews & more</p>
        </button>
      </aside>

      {/* Main area */}
      <div className="flex-1 px-8 pt-6 pb-16 max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for products…"
              className="w-full bg-card border border-border rounded-2xl py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
          </div>
          <button onClick={() => navigate("/cart")} className="relative w-11 h-11 rounded-2xl bg-card border border-border flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="w-4 h-4 text-foreground" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Package} title="No products found" description="Try a different search or category." />
        ) : (
          <>
            {/* Hero — "New Arrival" featured card */}
            {hero && (category === null && !query) && (
              <button onClick={() => navigate(`/designer/${designerId}/shop/${hero.id}`)}
                className="w-full text-left rounded-3xl card-elevated overflow-hidden grid grid-cols-2 gap-0 mb-8">
                <div className="p-8 flex flex-col justify-center">
                  <p className="text-[11px] text-primary font-semibold flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5" /> New Arrival
                  </p>
                  <h2 className="text-3xl font-bold text-foreground leading-tight">{hero.name}</h2>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-3">{hero.description}</p>
                  <p className="text-2xl font-bold text-primary mt-5">{formatMoney(hero.price)}</p>
                  <div className="flex gap-1.5 mt-4">
                    {hero.colors.map((c) => (
                      <span key={c} className="w-6 h-6 rounded-full border-2 border-card" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div className="aspect-square">
                  <img src={hero.images[0]} alt={hero.name} className="w-full h-full object-cover" />
                </div>
              </button>
            )}

            <h3 className="text-sm font-semibold text-foreground mb-4">
              {category ? category : query ? `Results for "${query}"` : "You May Also Like"}
            </h3>

            <div className="grid grid-cols-4 gap-4">
              <AnimatePresence>
                {(category || query ? filtered : rest).map((p, i) => (
                  <motion.button
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => navigate(`/designer/${designerId}/shop/${p.id}`)}
                    className="text-left rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/40 transition-colors"
                  >
                    <div className="relative aspect-[4/5]">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); setLiked((l) => l.includes(p.id) ? l.filter((x) => x !== p.id) : [...l, p.id]); }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center"
                      >
                        <Heart className={`w-3.5 h-3.5 ${liked.includes(p.id) ? "fill-primary text-primary" : "text-foreground"}`} />
                      </button>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                      <p className="text-xs font-bold text-primary mt-0.5">{formatMoney(p.price)}</p>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DesignerShopWorkspace;
