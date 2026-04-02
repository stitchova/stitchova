import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Search, ChevronRight, Star, MapPin, ShoppingBag, CalendarDays, Compass } from "lucide-react";

import designerAvatar1 from "@/assets/designer-avatar-1.jpg";
import designerAvatar2 from "@/assets/designer-avatar-2.jpg";
import designerAvatar3 from "@/assets/designer-avatar-3.jpg";
import portfolio1 from "@/assets/designer-portfolio-1.jpg";
import portfolio2 from "@/assets/designer-portfolio-2.jpg";
import portfolio3 from "@/assets/designer-portfolio-3.jpg";
import portfolio4 from "@/assets/designer-portfolio-4.jpg";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const activeOrders = [
  { type: "Wedding Gown", designer: "Nana Ama Couture", designerId: "nana-ama", status: "Sewing", progress: 65, date: "Mar 28", statusColor: "bg-status-sewing" },
  { type: "3-Piece Suit", designer: "Kwame Styles", designerId: "kwame-styles", status: "Cutting", progress: 30, date: "Apr 5", statusColor: "bg-status-cutting" },
];

const recommended = [
  { name: "Nana Ama Couture", avatar: designerAvatar1, specialty: "Bridal & Evening Wear", rating: 4.9, location: "Accra", preview: portfolio1, id: "nana-ama" },
  { name: "Kwame Styles", avatar: designerAvatar2, specialty: "Traditional & Agbada", rating: 4.7, location: "Kumasi", preview: portfolio2, id: "kwame-styles" },
  { name: "Efya Designs", avatar: designerAvatar3, specialty: "Contemporary African", rating: 4.8, location: "Tema", preview: portfolio4, id: "efya-designs" },
];

const ClientHome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <span className="text-sm font-semibold text-foreground">AK</span>
          </motion.button>
          <div>
            <span className="text-sm font-semibold text-foreground">Hey, Akua! 👋</span>
            <p className="text-xs text-muted-foreground">Find your perfect designer</p>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/client-orders")} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center relative">
          <Bell className="w-5 h-5 text-foreground" />
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
        </motion.button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="px-5 space-y-6">
        {/* Search */}
        <motion.div variants={fadeUp}>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/discover")}
            className="w-full flex items-center gap-3 bg-secondary rounded-2xl px-4 py-3.5"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Search designers, styles…</span>
          </motion.button>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp}>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Compass, label: "Discover", path: "/discover" },
              { icon: CalendarDays, label: "Appointments", path: "/appointments" },
              { icon: ShoppingBag, label: "My Orders", path: "/client-orders" },
            ].map((a) => (
              <motion.button
                key={a.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(a.path)}
                className="card-surface p-4 flex flex-col items-center gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <a.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">{a.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Active Orders */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Active Orders</h2>
            <button onClick={() => navigate("/client-orders")} className="text-xs text-muted-foreground flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {activeOrders.map((o) => (
              <motion.div
                key={o.type}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/designer/${o.designerId}`)}
                className="card-surface p-4 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{o.type}</p>
                    <p className="text-[10px] text-muted-foreground">{o.designer}</p>
                  </div>
                  <span className={`text-[9px] font-semibold px-2.5 py-1 rounded-full ${o.statusColor} text-primary-foreground`}>
                    {o.status}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${o.progress}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">Due: {o.date}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recommended Designers */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Recommended for You</h2>
            <button onClick={() => navigate("/discover")} className="text-xs text-muted-foreground flex items-center gap-1">
              See All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5">
            {recommended.map((d) => (
              <motion.div
                key={d.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/designer/${d.id}`)}
                className="card-surface min-w-[200px] overflow-hidden flex-shrink-0 cursor-pointer"
              >
                <div className="relative h-36">
                  <img src={d.preview} alt={d.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2">
                      <img src={d.avatar} alt={d.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-card" />
                      <div>
                        <p className="text-[11px] font-semibold text-foreground">{d.name}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-primary fill-primary" />
                          <span className="text-[9px] text-muted-foreground">{d.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-[10px] text-muted-foreground">{d.specialty}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground">{d.location}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ClientHome;