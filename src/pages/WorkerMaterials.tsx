import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scissors, Shirt, Palette, Sparkles, Info } from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } };

const iconTint: Record<string, string> = {
  Scissors: "bg-primary/10 text-primary",
  Shirt: "bg-blue-400/10 text-blue-400",
  Palette: "bg-purple-400/10 text-purple-400",
  Sparkles: "bg-green-400/10 text-green-400",
};

const materials = [
  { id: 1, order: "Ankara Gown – Mrs. Adebayo", items: [
    { name: "Ankara Fabric (Floral)", qty: "3 yards", icon: Scissors, iconKey: "Scissors" },
    { name: "White Lining", qty: "2 yards", icon: Shirt, iconKey: "Shirt" },
    { name: "Matching Thread", qty: "2 spools", icon: Palette, iconKey: "Palette" },
    { name: "Zipper (18\")", qty: "1 pc", icon: Sparkles, iconKey: "Sparkles" },
  ]},
  { id: 2, order: "Agbada Set – Mr. Okafor", items: [
    { name: "Guinea Brocade (White)", qty: "5 yards", icon: Scissors, iconKey: "Scissors" },
    { name: "Embroidery Thread", qty: "4 spools", icon: Palette, iconKey: "Palette" },
    { name: "Inner Lining", qty: "3 yards", icon: Shirt, iconKey: "Shirt" },
  ]},
  { id: 3, order: "Bridesmaid Dress – Kemi O.", items: [
    { name: "Lace Overlay (Champagne)", qty: "3 yards", icon: Scissors, iconKey: "Scissors" },
    { name: "Satin Base", qty: "3 yards", icon: Shirt, iconKey: "Shirt" },
    { name: "Beads (Gold)", qty: "1 pack", icon: Sparkles, iconKey: "Sparkles" },
    { name: "Matching Thread", qty: "2 spools", icon: Palette, iconKey: "Palette" },
  ]},
];

const WorkerMaterials = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border px-5 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Materials</h1>
          </div>
        </div>
      </div>

      {/* Read-only info bar */}
      <div className="px-5 pt-4 mb-4">
        <motion.div {...fadeUp} className="card-glass p-3 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Info className="w-3.5 h-3.5 text-primary" />
          </div>
          <p className="text-[10px] text-muted-foreground">Materials are assigned by the designer. View only.</p>
        </motion.div>
      </div>

      <div className="px-5 space-y-4">
        {materials.map((order, oi) => (
          <motion.div key={order.id} {...fadeUp} transition={{ delay: oi * 0.05 }}
            className="card-glass overflow-hidden">
            <div className="px-4 py-3 border-b border-border/20">
              <p className="text-sm font-bold text-foreground">{order.order}</p>
            </div>
            <div className="divide-y divide-border/10">
              {order.items.map((item, ii) => (
                <motion.div key={ii} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + ii * 0.04 }}
                  className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconTint[item.iconKey]}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">{item.name}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">{item.qty}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WorkerMaterials;
