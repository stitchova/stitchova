import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Star, MapPin, X, BadgeCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import designerAvatar1 from "@/assets/designer-avatar-1.jpg";
import designerAvatar2 from "@/assets/designer-avatar-2.jpg";
import designerAvatar3 from "@/assets/designer-avatar-3.jpg";
import portfolio1 from "@/assets/designer-portfolio-1.jpg";
import portfolio2 from "@/assets/designer-portfolio-2.jpg";
import portfolio3 from "@/assets/designer-portfolio-3.jpg";
import portfolio4 from "@/assets/designer-portfolio-4.jpg";
import portfolio5 from "@/assets/designer-portfolio-5.jpg";
import portfolio6 from "@/assets/designer-portfolio-6.jpg";

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

const DiscoverDesigners = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activePrice, setActivePrice] = useState<string | null>(null);
  const [activeRating, setActiveRating] = useState<string | null>(null);

  const filtered = designers.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "All" || d.specialty.toLowerCase().includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  const featuredDesigner = designers.find(d => d.featured);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-xl font-bold text-foreground">Discover</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Find your perfect fashion designer</p>
      </div>

      {/* Search */}
      <div className="px-5 py-3 flex items-center gap-2">
        <motion.div
          animate={{ borderColor: searchFocused ? "hsl(45, 100%, 50%, 0.3)" : "hsl(240, 5%, 18%, 0.3)" }}
          className="flex-1 flex items-center gap-2.5 glass-input px-4 py-3 transition-shadow"
          style={{ boxShadow: searchFocused ? "0 0 20px -4px hsl(45, 100%, 50%, 0.15)" : "none" }}
        >
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search designers, styles, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </motion.div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowFilters(!showFilters)}
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${showFilters ? "bg-primary" : "glass-card"}`}
        >
          <SlidersHorizontal className={`w-4 h-4 ${showFilters ? "text-primary-foreground" : "text-foreground"}`} />
        </motion.button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-3 space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Price Range</p>
                <div className="flex gap-2">
                  {["Under GHS 1K", "GHS 1K–3K", "GHS 3K+"].map((p) => (
                    <button
                      key={p}
                      onClick={() => { setActivePrice(activePrice === p ? null : p); toast(`Price: ${p}`); }}
                      className={`text-[10px] px-3 py-1.5 rounded-full transition-colors ${activePrice === p ? "bg-primary text-primary-foreground" : "glass-card text-muted-foreground hover:text-foreground"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Rating</p>
                <div className="flex gap-2">
                  {["4.5+", "4.0+", "3.5+"].map((r) => (
                    <button
                      key={r}
                      onClick={() => { setActiveRating(activeRating === r ? null : r); toast(`Rating: ${r} ★`); }}
                      className={`text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors ${activeRating === r ? "bg-primary text-primary-foreground" : "glass-card text-muted-foreground hover:text-foreground"}`}
                    >
                      <Star className={`w-3 h-3 ${activeRating === r ? "fill-primary-foreground text-primary-foreground" : "text-primary fill-primary"}`} /> {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories */}
      <div className="px-5 pb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <motion.button
              key={cat.label}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat.label)}
              className="relative text-xs px-4 py-2.5 rounded-full flex-shrink-0 font-semibold flex items-center gap-1.5 transition-colors"
              style={{
                background: activeCategory === cat.label ? "hsl(var(--primary))" : "transparent",
                color: activeCategory === cat.label ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
              }}
            >
              <span>{cat.emoji}</span>
              {cat.label}
              {activeCategory === cat.label && (
                <motion.div
                  layoutId="category-pill"
                  className="absolute inset-0 bg-primary rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Featured Designer */}
      {featuredDesigner && activeCategory === "All" && !search && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="px-5 mb-5"
        >
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/designer/${featuredDesigner.id}`)}
            className="relative h-52 rounded-2xl overflow-hidden cursor-pointer ring-1 ring-primary/20 pulse-glow"
          >
            <img src={featuredDesigner.heroImage} alt={featuredDesigner.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute top-3 left-3">
              <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-primary text-primary-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Featured
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-3">
                <img src={featuredDesigner.avatar} alt={featuredDesigner.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/30" />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-foreground">{featuredDesigner.name}</p>
                    <BadgeCheck className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{featuredDesigner.tagline}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-primary fill-primary" />
                      <span className="text-[10px] font-semibold text-foreground">{featuredDesigner.rating}</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary">From {featuredDesigner.price}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Designer List */}
      <div className="px-5 space-y-4">
        {filtered.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: i * 0.1, duration: 0.5, ease }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/designer/${d.id}`)}
            className="glass-card overflow-hidden cursor-pointer group"
          >
            {/* Hero Image */}
            <div className="relative h-44">
              <img src={d.heroImage} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
              <div className="absolute top-3 right-3">
                <span className="text-[9px] font-bold px-2.5 py-1 rounded-full glass-card text-primary backdrop-blur-lg">
                  From {d.price}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={d.avatar} alt={d.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/20" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-foreground">{d.name}</p>
                      {d.verified && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 400 }}
                        >
                          <BadgeCheck className="w-4 h-4 text-primary" />
                        </motion.div>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{d.tagline}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                  <span className="text-xs font-bold text-foreground">{d.rating}</span>
                  <span className="text-[10px] text-muted-foreground">({d.reviews})</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{d.location}</span>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); navigate(`/designer/${d.id}`); }}
                className="text-[10px] font-bold text-primary-foreground bg-primary px-4 py-2 rounded-full"
              >
                View Profile
              </motion.button>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">No designers found</p>
            <p className="text-xs text-muted-foreground mt-1">Try a different search or category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverDesigners;
