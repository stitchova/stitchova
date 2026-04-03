import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Heart, Bookmark, Grid3X3, LayoutList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import orderWedding from "@/assets/order-wedding.jpg";
import orderSuit from "@/assets/order-suit.jpg";
import orderAgbada from "@/assets/order-agbada.jpg";

const categories = ["All", "Bridal", "Traditional", "Formal", "Casual", "Children"];

const styles = [
  { id: "1", title: "Modern Bridal Gown", category: "Bridal", image: orderWedding, likes: 234, saved: false, designer: "FashionOS Studio" },
  { id: "2", title: "Classic 3-Piece Suit", category: "Formal", image: orderSuit, likes: 189, saved: true, designer: "Justice Ansah" },
  { id: "3", title: "Royal Agbada", category: "Traditional", image: orderAgbada, likes: 312, saved: false, designer: "Kente Masters" },
  { id: "4", title: "Evening Cocktail Dress", category: "Formal", image: orderWedding, likes: 156, saved: true, designer: "FashionOS Studio" },
  { id: "5", title: "Ankara Two-Piece", category: "Casual", image: orderAgbada, likes: 278, saved: false, designer: "Ankara Hub" },
  { id: "6", title: "Senator Style", category: "Traditional", image: orderSuit, likes: 201, saved: false, designer: "Justice Ansah" },
];

const StyleLibrary = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [gridView, setGridView] = useState(true);
  const [items, setItems] = useState(styles);

  const filtered = items.filter((s) => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "All" || s.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const toggleSave = (id: string) => {
    setItems((prev) => prev.map((s) => s.id === id ? { ...s, saved: !s.saved } : s));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/50">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <h1 className="text-lg font-semibold text-foreground flex-1">Style Library</h1>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setGridView(!gridView)}
          className="w-9 h-9 rounded-full bg-card flex items-center justify-center">
          {gridView ? <LayoutList className="w-4 h-4 text-muted-foreground" /> : <Grid3X3 className="w-4 h-4 text-muted-foreground" />}
        </motion.button>
      </div>

      <div className="px-5 pt-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search styles..."
            className="w-full bg-card border border-border rounded-2xl py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all" />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((c) => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors",
                activeCategory === c ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground")}>
              {c}
            </button>
          ))}
        </div>

        <div className={cn(gridView ? "grid grid-cols-2 gap-3" : "space-y-3")}>
          {filtered.map((style, i) => (
            <motion.div key={style.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn("card-glass overflow-hidden", gridView ? "" : "flex gap-3 p-3")}>
              <div className={cn("relative overflow-hidden", gridView ? "aspect-[3/4]" : "w-24 h-24 rounded-xl flex-shrink-0")}>
                <img src={style.image} alt={style.title} className="w-full h-full object-cover" />
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => toggleSave(style.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/60 backdrop-blur flex items-center justify-center">
                  <Bookmark className={cn("w-4 h-4", style.saved ? "fill-primary text-primary" : "text-foreground")} />
                </motion.button>
              </div>
              <div className={cn(gridView ? "p-3" : "flex-1 min-w-0 flex flex-col justify-center")}>
                <p className="text-xs font-semibold text-foreground truncate">{style.title}</p>
                <p className="text-[10px] text-muted-foreground">{style.designer}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Heart className="w-3 h-3 text-destructive" />
                  <span className="text-[10px] text-muted-foreground">{style.likes}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No styles found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StyleLibrary;
