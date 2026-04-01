import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scissors, Shirt, Palette, Sparkles } from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

const materials = [
  { id: 1, order: "Ankara Gown – Mrs. Adebayo", items: [
    { name: "Ankara Fabric (Floral)", qty: "3 yards", icon: Scissors },
    { name: "White Lining", qty: "2 yards", icon: Shirt },
    { name: "Matching Thread", qty: "2 spools", icon: Palette },
    { name: "Zipper (18\")", qty: "1 pc", icon: Sparkles },
  ]},
  { id: 2, order: "Agbada Set – Mr. Okafor", items: [
    { name: "Guinea Brocade (White)", qty: "5 yards", icon: Scissors },
    { name: "Embroidery Thread", qty: "4 spools", icon: Palette },
    { name: "Inner Lining", qty: "3 yards", icon: Shirt },
  ]},
  { id: 3, order: "Bridesmaid Dress – Kemi O.", items: [
    { name: "Lace Overlay (Champagne)", qty: "3 yards", icon: Scissors },
    { name: "Satin Base", qty: "3 yards", icon: Shirt },
    { name: "Beads (Gold)", qty: "1 pack", icon: Sparkles },
    { name: "Matching Thread", qty: "2 spools", icon: Palette },
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
            <p className="text-[10px] text-muted-foreground">Read-only — assigned by designer</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-4">
        {materials.map((order, oi) => (
          <motion.div key={order.id} {...fadeUp} transition={{ delay: oi * 0.05 }}
            className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-bold text-foreground">{order.order}</p>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item, ii) => (
                <div key={ii} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">{item.name}</p>
                  </div>
                  <span className="text-xs text-primary font-semibold">{item.qty}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WorkerMaterials;
