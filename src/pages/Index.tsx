import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, ChevronDown, RefreshCw, DollarSign, ShoppingBag, Users, UserPlus, Ruler, ClipboardList, CalendarDays, ChevronRight } from "lucide-react";
import orderWedding from "@/assets/order-wedding.jpg";
import orderSuit from "@/assets/order-suit.jpg";
import orderAgbada from "@/assets/order-agbada.jpg";
import fabricAnkara from "@/assets/fabric-ankara.jpg";
import fabricSilk from "@/assets/fabric-silk.jpg";
import fabricLace from "@/assets/fabric-lace.jpg";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stats = [
  { label: "Revenue", value: "GHS 12,450", icon: DollarSign, sub: "This month" },
  { label: "Active Orders", value: "23", icon: ShoppingBag, sub: "8 due this week" },
];

const quickActions = [
  { icon: UserPlus, label: "Add Client", path: "/clients" },
  { icon: Ruler, label: "Measure", path: "/measurements" },
  { icon: ClipboardList, label: "New Order", path: "/orders" },
  { icon: CalendarDays, label: "Appointment", path: "/appointments" },
];

const orders = [
  { img: orderWedding, type: "Wedding Gown", client: "Ama Serwaa", status: "Sewing", date: "Mar 25", statusColor: "bg-status-sewing" },
  { img: orderSuit, type: "3-Piece Suit", client: "Kofi Mensah", status: "Cutting", date: "Mar 28", statusColor: "bg-status-cutting" },
  { img: orderAgbada, type: "Agbada Set", client: "Yaw Boateng", status: "Completed", date: "Mar 15", statusColor: "bg-status-completed" },
];

const fabrics = [
  { img: fabricAnkara, name: "Ankara Print", brand: "Vlisco", color: "Multi" },
  { img: fabricSilk, name: "Silk Satin", brand: "Premium", color: "Navy/Gold" },
  { img: fabricLace, name: "French Lace", brand: "Imported", color: "Ivory" },
];

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-sm font-semibold text-foreground">JA</span>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-foreground">Hey, Justice!</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">053 698 7839</span>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center relative">
          <Bell className="w-5 h-5 text-foreground" />
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
        </motion.button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="px-5 space-y-6">
        {/* Stats */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Overview</h2>
            <button className="flex items-center gap-1 text-xs text-muted-foreground">
              <RefreshCw className="w-3.5 h-3.5" /> Update
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="card-surface p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <span className="text-[10px] text-muted-foreground">{s.sub}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp}>
          <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((a) => (
              <motion.button
                key={a.label}
                whileTap={{ scale: 0.95 }}
                className="card-surface p-3 flex flex-col items-center gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <a.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">{a.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
            <button className="text-xs text-muted-foreground flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5">
            {orders.map((o) => (
              <motion.div
                key={o.type}
                whileTap={{ scale: 0.97 }}
                className="card-surface min-w-[160px] overflow-hidden flex-shrink-0"
              >
                <div className="relative h-28">
                  <img src={o.img} alt={o.type} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  <span className={`absolute bottom-2 left-2 text-[9px] font-semibold px-2 py-0.5 rounded-full ${o.statusColor} text-primary-foreground`}>
                    {o.status}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-foreground">{o.type}</p>
                  <p className="text-[10px] text-muted-foreground">{o.client}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Due: {o.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Fabrics */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Fabric Collection</h2>
            <button className="text-xs text-muted-foreground flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5">
            {fabrics.map((f) => (
              <motion.div
                key={f.name}
                whileTap={{ scale: 0.97 }}
                className="card-surface min-w-[140px] overflow-hidden flex-shrink-0"
              >
                <div className="relative h-28">
                  <img src={f.img} alt={f.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-foreground">{f.name}</p>
                  <p className="text-[10px] text-muted-foreground">{f.brand} · {f.color}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
