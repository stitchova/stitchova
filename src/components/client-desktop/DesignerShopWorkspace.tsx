import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Glasses,
  Heart,
  Menu,
  Package,
  RefreshCcw,
  Search,
  Share2,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShopProduct, useShop } from "@/contexts/ShopContext";
import { formatMoney } from "@/lib/currency";
import EmptyState from "@/components/EmptyState";

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

const categoryIcons = [Sparkles, Shirt, Shirt, Shirt, Shirt, ShoppingBag, Glasses];

const DesignerShopWorkspace = ({
  designerId,
  designerName,
  products,
  filtered,
  categoriesInUse,
  category,
  setCategory,
  query,
  setQuery,
  liked,
  setLiked,
  cartCount,
}: Props) => {
  const navigate = useNavigate();
  const { addToCart } = useShop();
  const featured = filtered[0] ?? products[0];
  const [size, setSize] = useState(featured?.sizes[Math.min(1, featured.sizes.length - 1)] ?? "");
  const [color, setColor] = useState(featured?.colors[0] ?? "");

  useEffect(() => {
    if (!featured) return;
    setSize(featured.sizes[Math.min(1, featured.sizes.length - 1)] ?? "");
    setColor(featured.colors[0] ?? "");
  }, [featured?.id]);

  const recommendations = useMemo(
    () => filtered.filter((product) => product.id !== featured?.id).slice(0, 4),
    [featured?.id, filtered],
  );

  const toggleLiked = (productId: string) => {
    setLiked((current) => current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId]);
  };

  const addFeatured = () => {
    if (!featured || featured.stock === 0) return;
    addToCart({ productId: featured.id, size, color, quantity: 1 });
    toast.success(`${featured.name} added to your bag`);
  };

  const buyFeatured = () => {
    if (!featured || featured.stock === 0) return;
    addToCart({ productId: featured.id, size, color, quantity: 1 });
    navigate("/cart");
  };

  return (
    <div className="hidden min-h-screen bg-background p-5 lg:block xl:p-7">
      <div className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-[1440px] grid-cols-[210px_minmax(0,1fr)] overflow-hidden rounded-[2rem] border border-border/60 bg-card/35 shadow-2xl shadow-foreground/10 backdrop-blur-xl">
        <aside className="flex flex-col border-r border-border/60 bg-card/45 px-4 py-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between px-2">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-primary">Stitchova</p>
              <h1 className="mt-1 max-w-[145px] truncate font-serif text-lg text-foreground">{designerName}</h1>
            </div>
            <button aria-label="Shop menu" className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <Menu className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-4 mt-8 px-2">
            <p className="font-serif text-3xl text-foreground">Collection</p>
            <span className="mt-2 block h-0.5 w-5 rounded-full bg-primary" />
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setCategory(null)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-xs transition-all ${category === null ? "border-primary/50 bg-primary/10 text-foreground shadow-lg shadow-primary/5" : "border-transparent text-muted-foreground hover:bg-secondary/60 hover:text-foreground"}`}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${category === null ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="flex-1 font-medium">New In</span>
              {category === null && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
            </button>
            {categoriesInUse.map((item, index) => {
              const Icon = categoryIcons[index % categoryIcons.length];
              const selected = category === item;
              return (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-xs transition-all ${selected ? "border-primary/50 bg-primary/10 text-foreground shadow-lg shadow-primary/5" : "border-transparent text-muted-foreground hover:bg-secondary/60 hover:text-foreground"}`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${selected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 font-medium">{item}</span>
                  {selected && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
                </button>
              );
            })}
          </nav>

          <button
            onClick={() => navigate(`/designer/${designerId}`)}
            className="group relative mt-auto min-h-40 overflow-hidden rounded-2xl border border-border bg-secondary text-left"
          >
            {products[1]?.images[0] && <img src={products[1].images[0]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-500 group-hover:scale-105" />}
            <span className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-transparent" />
            <span className="relative flex h-full min-h-40 flex-col justify-end p-4">
              <span className="font-serif text-xl text-foreground">The Atelier</span>
              <span className="mt-1 text-[10px] text-muted-foreground">Portfolio, reviews & custom work</span>
              <span className="mt-3 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary">Explore now <ArrowRight className="h-3 w-3" /></span>
            </span>
          </button>
        </aside>

        <main className="min-w-0 px-6 py-5 xl:px-8">
          <header className="mb-5 flex items-center gap-3">
            <div className="relative mx-auto w-full max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search for products…"
                className="h-11 w-full rounded-full border border-border bg-background/50 pl-11 pr-4 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <button aria-label="Saved products" className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-primary">
              <Heart className="h-4 w-4" />
            </button>
            <button onClick={() => navigate("/cart")} aria-label="Shopping bag" className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/50 text-foreground transition-colors hover:border-primary">
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">{cartCount}</span>}
            </button>
          </header>

          {!featured ? (
            <EmptyState icon={Package} title="No products found" description="Try a different search or category." />
          ) : (
            <>
              <section className="grid min-h-[390px] grid-cols-[minmax(280px,0.82fr)_minmax(360px,1.18fr)] overflow-hidden rounded-[1.7rem] border border-border bg-card shadow-xl shadow-foreground/10">
                <div className="flex flex-col justify-center p-7 xl:p-9">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">New Arrival</p>
                  <h2 className="mt-2 max-w-sm font-serif text-4xl leading-[1.02] text-foreground xl:text-5xl">{featured.name}</h2>
                  <p className="mt-4 max-w-sm text-xs leading-relaxed text-muted-foreground">{featured.description}</p>
                  <p className="mt-5 font-serif text-2xl text-primary">{formatMoney(featured.price)}</p>

                  <div className="mt-4 flex gap-2">
                    {featured.colors.map((swatch) => (
                      <button
                        key={swatch}
                        onClick={() => setColor(swatch)}
                        aria-label={`Select colour ${swatch}`}
                        className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${color === swatch ? "border-primary ring-2 ring-primary/20" : "border-card"}`}
                        style={{ backgroundColor: swatch }}
                      >
                        {color === swatch && <Check className="h-3 w-3 text-primary-foreground" />}
                      </button>
                    ))}
                  </div>

                  <p className="mb-2 mt-5 text-[10px] font-medium text-muted-foreground">Size</p>
                  <div className="flex gap-2">
                    {featured.sizes.map((item) => (
                      <button
                        key={item}
                        onClick={() => setSize(item)}
                        className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-[10px] font-semibold transition-colors ${size === item ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background/50 text-muted-foreground hover:border-primary"}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="group relative min-h-[390px] overflow-hidden bg-secondary">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={featured.id}
                      src={featured.images[0]}
                      alt={featured.name}
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </AnimatePresence>
                  <span className="absolute inset-0 bg-gradient-to-r from-card/40 via-transparent to-transparent" />
                  <div className="absolute bottom-5 right-5 flex flex-col gap-2">
                    <button onClick={() => toast.success("Share link copied")} aria-label="Share product" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 text-foreground backdrop-blur-xl transition-colors hover:text-primary">
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => toggleLiked(featured.id)} aria-label="Save product" className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                      <Heart className={`h-4 w-4 ${liked.includes(featured.id) ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>
              </section>

              {recommendations.length > 0 && (
                <section className="mt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-serif text-lg text-foreground">You May Also Like</h3>
                    <button onClick={() => setCategory(null)} className="text-[10px] font-semibold uppercase tracking-wider text-primary">View all</button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {recommendations.map((product, index) => (
                      <motion.button
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        onClick={() => navigate(`/designer/${designerId}/shop/${product.id}`)}
                        className="group overflow-hidden rounded-xl border border-border bg-card text-left transition-colors hover:border-primary/50"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <button onClick={(event) => { event.stopPropagation(); toggleLiked(product.id); }} aria-label="Save product" className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/75 text-foreground backdrop-blur-lg">
                            <Heart className={`h-3 w-3 ${liked.includes(product.id) ? "fill-primary text-primary" : ""}`} />
                          </button>
                        </div>
                        <div className="p-3">
                          <p className="truncate text-[11px] font-semibold text-foreground">{product.name}</p>
                          <p className="mt-1 text-[10px] font-semibold text-primary">{formatMoney(product.price)}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </section>
              )}

              <section className="mt-5 grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-card/60 py-3">
                {[
                  { Icon: Truck, label: "Free Shipping", hint: "On orders over 500" },
                  { Icon: RefreshCcw, label: "Easy Returns", hint: "30-day return policy" },
                  { Icon: ShieldCheck, label: "Secure Payment", hint: "100% protected" },
                ].map(({ Icon, label, hint }) => (
                  <div key={label} className="flex items-center justify-center gap-2 px-3">
                    <Icon className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-[10px] font-semibold text-foreground">{label}</p>
                      <p className="text-[8px] text-muted-foreground">{hint}</p>
                    </div>
                  </div>
                ))}
              </section>

              <div className="mt-4 grid grid-cols-[1.15fr_0.85fr] gap-3">
                <button onClick={addFeatured} disabled={featured.stock === 0} className="flex h-14 items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-[0.97] disabled:opacity-40">
                  <ShoppingBag className="h-4 w-4" /> Add to Bag
                </button>
                <button onClick={buyFeatured} disabled={featured.stock === 0} className="h-14 rounded-xl border border-border bg-card text-xs font-bold uppercase tracking-wider text-foreground transition-colors hover:border-primary disabled:opacity-40">
                  Buy Now
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default DesignerShopWorkspace;