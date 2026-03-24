import { motion } from "framer-motion";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const fabrics = [
  { name: "Ankara Print", brand: "Vlisco", color: "Multi", qty: "5 yards", price: "GHS 350" },
  { name: "Silk Satin", brand: "Premium", color: "Navy/Gold", qty: "3 yards", price: "GHS 520" },
  { name: "French Lace", brand: "Imported", color: "Ivory", qty: "4 yards", price: "GHS 780" },
  { name: "Kente Cloth", brand: "Bonwire", color: "Gold/Green", qty: "6 yards", price: "GHS 900" },
  { name: "Cotton Poplin", brand: "Local", color: "White", qty: "10 yards", price: "GHS 150" },
];

const Fabrics = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/50">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <h1 className="text-lg font-semibold text-foreground flex-1">Fabric Collection</h1>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/add")} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
          <Plus className="w-4 h-4 text-primary-foreground" />
        </motion.button>
      </div>

      <div className="px-5 pt-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search fabrics..."
            className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="space-y-3">
          {fabrics.map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-surface p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🧵</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{f.name}</p>
                <p className="text-[11px] text-muted-foreground">{f.brand} · {f.color}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-foreground">{f.price}</p>
                <p className="text-[10px] text-muted-foreground">{f.qty}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Fabrics;
