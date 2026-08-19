import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Star, MapPin, X, BadgeCheck, Sparkles, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

import designerAvatar1 from "@/assets/designer-avatar-1.jpg";
import designerAvatar2 from "@/assets/designer-avatar-2.jpg";
import designerAvatar3 from "@/assets/designer-avatar-3.jpg";
import portfolio1 from "@/assets/designer-portfolio-1.jpg";
import portfolio2 from "@/assets/designer-portfolio-2.jpg";
import portfolio6 from "@/assets/designer-portfolio-6.jpg";

/**
 * Tablet/desktop workspace for Discover. Previously zero desktop treatment
 * at all. Reuses the exact same designer data and filter logic as the
 * mobile page (category / price / rating — all genuinely functional, not
 * decorative), laid out as a real grid with a large featured hero banner
 * instead of a single stacked column.
 */

const ease = [0.16, 1, 0.3, 1];

const categories = [
  { label: "All", emoji: "✨" },
  { label: "Bridal", emoji: "👰" },
  { label: "Traditional", emoji: "🪘" },
  { label: "Corporate", emoji: "👔" },
  { label: "Casual", emoji: "👕" },
  { label: "Evening", emoji: "🌙" },
];

const designers = [
  {
    id: "nana-ama", name: "Nana Ama Couture", avatar: designerAvatar1,
    specialty: "Bridal & Evening Wear", tagline: "Crafting dreams in fabric since 2015",
    rating: 4.9, reviews: 127, location: "East Legon, Accra", price: "GHS 2,500",
    verified: true, heroImage: portfolio1, featured: true,
  },
  {
    id: "kwame-styles", name: "Kwame Styles", avatar: designerAvatar2,
    specialty: "Traditional & Agbada", tagline: "Modern African menswear redefined",
    rating: 4.7, reviews: 89, location: "Adum, Kumasi", price: "GHS 1,800",
    verified: true, heroImage: portfolio2, featured: false,
  },
  {
    id: "efya-designs", name: "Efya Designs", avatar: designerAvatar3,
    specialty: "Contemporary African", tagline: "Where tradition meets modern elegance",
    rating: 4.8, reviews: 64, location: "Tema, Accra", price: "GHS 1,200",
    verified: false, heroImage: portfolio6, featured: false,
  },
];

const priceToNumber = (p: string) => Number(p.replace(/[^0-9]/g, ""));

const DiscoverWorkspace = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [activePrice, setActivePrice] = useState<string | null>(null);
  const [activeRating, setActiveRating] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = designers.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "All" || d.specialty.toLowerCase().includes(activeCategory.toLowerCase());
    const dPrice = priceToNumber(d.price);
    const matchesPrice = !activePrice
      || (activePrice === "Under GHS 1K" && dPrice < 1000)
      || (activePrice === "GHS 1K–3K" && dPrice >= 1000 && dPrice <= 3000)
      || (activePrice === "GHS 3K+" && dPrice > 3000);
    const matchesRating = !activeRating || d.rating >= Number(activeRating.replace("+", ""));
    return matchesSearch && matchesCat && matchesPrice && matchesRating;
  });

  const featured = designers.find((d) => d.featured);
  const showFeatured = featured && activeCategory === "All" && !search && !activePrice && !activeRating;
  const activeFilterCount = (activePrice ? 1 : 0) + (activeRating ? 1 : 0);

  return (
    <div className="hidden lg:block px-8 pt-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Discover</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Find your perfect fashion designer</p>
        </div>
        <div className="ml-6 flex-1 max-w-md flex items-center gap-2.5 solid-input px-4 py-3">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text" placeholder="Search designers, styles, location…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        <button onClick={() => setShowFilters((v) => !v)}
          className={cn("flex items-center gap-2 rounded-full px-4 py-3 text-xs font-semibold transition-colors",
            showFilters || activeFilterCount > 0 ? "bg-primary text-primary-foreground" : "solid-panel text-foreground")}>
          <SlidersHorizontal className="w-4 h-4" /> Filters
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-background text-primary text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease }} className="overflow-hidden">
            <div className="flex items-center gap-8 py-4">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Price Range</p>
                <div className="flex gap-2">
                  {["Under GHS 1K", "GHS 1K–3K", "GHS 3K+"].map((p) => (
                    <button key={p} onClick={() => setActivePrice(activePrice === p ? null : p)}
                      className={cn("text-xs px-3.5 py-2 rounded-full transition-colors",
                        activePrice === p ? "bg-primary text-primary-foreground" : "solid-panel text-muted-foreground hover:text-foreground")}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Rating</p>
                <div className="flex gap-2">
                  {["4.5+", "4.0+", "3.5+"].map((r) => (
                    <button key={r} onClick={() => setActiveRating(activeRating === r ? null : r)}
                      className={cn("text-xs px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-colors",
                        activeRating === r ? "bg-primary text-primary-foreground" : "solid-panel text-muted-foreground hover:text-foreground")}>
                      <Star className={cn("w-3.5 h-3.5", activeRating === r ? "fill-primary-foreground text-primary-foreground" : "text-primary fill-primary")} /> {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories */}
      <nav className="flex items-center gap-1.5 rounded-full solid-panel p-1.5 w-fit my-5">
        {categories.map((cat) => (
          <button key={cat.label} onClick={() => setActiveCategory(cat.label)}
            className={cn("relative px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors",
              activeCategory === cat.label ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            {activeCategory === cat.label && (
              <motion.div layoutId="discoverCatPill" className="absolute inset-0 rounded-full bg-primary glow-primary"
                transition={{ type: "spring", stiffness: 400, damping: 32 }} />
            )}
            <span className="relative z-10 flex items-center gap-1.5"><span>{cat.emoji}</span>{cat.label}</span>
          </button>
        ))}
      </nav>

      {/* Featured designer — full-width cinematic hero */}
      <AnimatePresence>
        {showFeatured && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease }} className="mb-6">
            <motion.div whileHover={{ scale: 1.005 }} onClick={() => navigate(`/designer/${featured!.id}`)}
              className="relative h-72 rounded-3xl overflow-hidden cursor-pointer ring-1 ring-primary/20">
              <img src={featured!.heroImage} alt={featured!.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/40 to-transparent" />
              <div className="absolute top-5 left-5">
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-primary text-primary-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Featured
                </span>
              </div>
              <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-10 max-w-lg">
                <div className="flex items-center gap-3">
                  <img src={featured!.avatar} alt={featured!.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/30" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xl font-bold text-foreground">{featured!.name}</p>
                      <BadgeCheck className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{featured!.tagline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <span className="text-sm font-semibold text-foreground">{featured!.rating}</span>
                    <span className="text-xs text-muted-foreground">({featured!.reviews})</span>
                  </div>
                  <span className="text-sm font-bold text-primary">From {featured!.price}</span>
                </div>
                <motion.button whileTap={{ scale: 0.96 }} onClick={(e) => { e.stopPropagation(); navigate(`/designer/${featured!.id}`); }}
                  className="mt-5 w-fit text-sm font-bold text-primary-foreground bg-primary px-6 py-3 rounded-full">
                  View Profile
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Designer grid */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl solid-panel p-20 flex flex-col items-center justify-center text-center">
          <Search className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-sm font-semibold text-foreground">No designers found</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different search, category, or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map((d, i) => (
              <motion.div key={d.id} layout
                initial={{ opacity: 0, y: 16, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0 }} transition={{ delay: (i % 6) * 0.06, duration: 0.5, ease }}
                whileHover={{ y: -5 }} onClick={() => navigate(`/designer/${d.id}`)}
                className="solid-panel overflow-hidden cursor-pointer group">
                <div className="relative h-56">
                  <img src={d.heroImage} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] font-bold px-2.5 py-1.5 rounded-full solid-panel text-primary">
                      From {d.price}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2.5">
                      <img src={d.avatar} alt={d.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-foreground truncate">{d.name}</p>
                          {d.verified && <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{d.tagline}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                      <span className="text-xs font-bold text-foreground">{d.rating}</span>
                      <span className="text-[11px] text-muted-foreground">({d.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">{d.location}</span>
                    </div>
                  </div>
                  <motion.button whileTap={{ scale: 0.94 }}
                    onClick={(e) => { e.stopPropagation(); navigate(`/designer/${d.id}`); }}
                    className="text-[11px] font-bold text-primary-foreground bg-primary px-3.5 py-2 rounded-full">
                    View
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default DiscoverWorkspace;
