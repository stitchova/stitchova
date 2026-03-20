import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Star, MapPin, X, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import designerAvatar1 from "@/assets/designer-avatar-1.jpg";
import designerAvatar2 from "@/assets/designer-avatar-2.jpg";
import designerAvatar3 from "@/assets/designer-avatar-3.jpg";
import portfolio1 from "@/assets/designer-portfolio-1.jpg";
import portfolio2 from "@/assets/designer-portfolio-2.jpg";
import portfolio3 from "@/assets/designer-portfolio-3.jpg";
import portfolio4 from "@/assets/designer-portfolio-4.jpg";
import portfolio5 from "@/assets/designer-portfolio-5.jpg";
import portfolio6 from "@/assets/designer-portfolio-6.jpg";

const categories = ["All", "Bridal", "Traditional", "Corporate", "Casual", "Evening"];

const designers = [
  {
    id: "nana-ama",
    name: "Nana Ama Couture",
    avatar: designerAvatar1,
    specialty: "Bridal & Evening Wear",
    tagline: "Crafting dreams in fabric since 2015",
    rating: 4.9,
    reviews: 127,
    location: "East Legon, Accra",
    price: "GHS 2,500",
    verified: true,
    images: [portfolio1, portfolio4],
  },
  {
    id: "kwame-styles",
    name: "Kwame Styles",
    avatar: designerAvatar2,
    specialty: "Traditional & Agbada",
    tagline: "Modern African menswear redefined",
    rating: 4.7,
    reviews: 89,
    location: "Adum, Kumasi",
    price: "GHS 1,800",
    verified: true,
    images: [portfolio2, portfolio3],
  },
  {
    id: "efya-designs",
    name: "Efya Designs",
    avatar: designerAvatar3,
    specialty: "Contemporary African",
    tagline: "Where tradition meets modern elegance",
    rating: 4.8,
    reviews: 64,
    location: "Tema, Accra",
    price: "GHS 1,200",
    verified: false,
    images: [portfolio6, portfolio5],
  },
];

const DiscoverDesigners = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = designers.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "All" || d.specialty.toLowerCase().includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-xl font-bold text-foreground">Discover</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Find your perfect fashion designer</p>
      </div>

      {/* Search & Filter */}
      <div className="px-5 py-3 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2.5 bg-secondary rounded-xl px-3.5 py-2.5">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search designers, styles, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowFilters(!showFilters)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${showFilters ? "bg-primary" : "bg-secondary"}`}
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
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-3 space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Price Range</p>
                <div className="flex gap-2">
                  {["Under GHS 1K", "GHS 1K–3K", "GHS 3K+"].map((p) => (
                    <button key={p} className="text-[10px] px-3 py-1.5 rounded-full bg-secondary text-muted-foreground">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Rating</p>
                <div className="flex gap-2">
                  {["4.5+", "4.0+", "3.5+"].map((r) => (
                    <button key={r} className="text-[10px] px-3 py-1.5 rounded-full bg-secondary text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3 text-primary fill-primary" /> {r}
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
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-4 py-2 rounded-full flex-shrink-0 font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Designer List */}
      <div className="px-5 space-y-4">
        {filtered.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/designer/${d.id}`)}
            className="card-surface overflow-hidden cursor-pointer"
          >
            {/* Preview Images */}
            <div className="flex h-36">
              {d.images.map((img, idx) => (
                <div key={idx} className="flex-1 relative">
                  <img src={img} alt={`${d.name} work ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img src={d.avatar} alt={d.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-foreground">{d.name}</p>
                      {d.verified && (
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-[8px] text-primary-foreground font-bold">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{d.tagline}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
              </div>

              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                  <span className="text-xs font-semibold text-foreground">{d.rating}</span>
                  <span className="text-[10px] text-muted-foreground">({d.reviews})</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{d.location}</span>
                </div>
                <span className="text-[10px] font-semibold text-primary ml-auto">From {d.price}</span>
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No designers found</p>
            <p className="text-xs text-muted-foreground mt-1">Try a different search or category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverDesigners;
