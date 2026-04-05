import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, Package, Scissors, Clock, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import portfolio1 from "@/assets/designer-portfolio-1.jpg";
import portfolio2 from "@/assets/designer-portfolio-2.jpg";
import portfolio4 from "@/assets/designer-portfolio-4.jpg";
import designerAvatar1 from "@/assets/designer-avatar-1.jpg";
import designerAvatar2 from "@/assets/designer-avatar-2.jpg";
import designerAvatar3 from "@/assets/designer-avatar-3.jpg";

const ease = [0.16, 1, 0.3, 1];
const tabs = ["Active", "Completed", "All"];

const stages = [
  { label: "Cutting", icon: Scissors },
  { label: "Sewing", icon: Package },
  { label: "Finishing", icon: Clock },
  { label: "Ready", icon: CheckCircle2 },
];

const orders = [
  { img: portfolio1, type: "Wedding Gown", designer: "Nana Ama Couture", designerId: "nana-ama", avatar: designerAvatar1, status: "Sewing", stage: 1, date: "Mar 28", price: "GHS 3,200", active: true },
  { img: portfolio2, type: "3-Piece Agbada", designer: "Kwame Styles", designerId: "kwame-styles", avatar: designerAvatar2, status: "Cutting", stage: 0, date: "Apr 5", price: "GHS 2,100", active: true },
  { img: portfolio4, type: "Evening Gown", designer: "Efya Designs", designerId: "efya-designs", avatar: designerAvatar3, status: "Completed", stage: 3, date: "Feb 14", price: "GHS 1,800", active: false },
];

const ClientOrders = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Active");

  const filtered = orders.filter((o) => {
    if (activeTab === "Active") return o.active;
    if (activeTab === "Completed") return !o.active;
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <h1 className="text-xl font-bold text-foreground">My Orders</h1>
      </div>

      {/* Animated Tab Bar */}
      <div className="px-5 mb-5">
        <div className="flex gap-1 glass-card p-1.5 relative">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 text-xs font-semibold rounded-xl relative z-10 transition-colors"
              style={{ color: activeTab === tab ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))" }}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 bg-primary rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((o, i) => (
            <motion.div
              key={o.type}
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/designer/${o.designerId}`)}
              className="glass-card overflow-hidden cursor-pointer"
            >
              <div className="flex">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <img src={o.img} alt={o.type} className="w-full h-full object-cover rounded-l-2xl" />
                  <div className="absolute bottom-2 right-2">
                    <img src={o.avatar} alt={o.designer} className="w-7 h-7 rounded-full object-cover ring-2 ring-card" />
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">{o.type}</p>
                      <p className="text-[11px] text-muted-foreground">{o.designer}</p>
                    </div>
                    <span className="text-xs font-bold text-primary">{o.price}</span>
                  </div>

                  {/* Stage Indicator */}
                  <div className="flex items-center gap-1 mt-3">
                    {stages.map((s, si) => (
                      <div key={s.label} className="flex items-center">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3 + si * 0.1, ease }}
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            si <= o.stage
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground"
                          } ${si === o.stage && o.active ? "pulse-glow" : ""}`}
                        >
                          <s.icon className="w-3 h-3" />
                        </motion.div>
                        {si < stages.length - 1 && (
                          <div className={`w-4 h-0.5 ${si < o.stage ? "bg-primary" : "bg-secondary"}`} />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground">Due: {o.date}</span>
                    {!o.active && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/review/${o.designerId}`); }}
                        className="flex items-center gap-1 text-[10px] font-semibold text-primary"
                      >
                        <Star className="w-3 h-3 fill-primary" /> Rate
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">No orders yet</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">Discover talented designers to get started</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/discover")}
              className="text-xs font-semibold text-primary-foreground bg-primary px-5 py-2.5 rounded-full"
            >
              Discover Designers
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ClientOrders;
