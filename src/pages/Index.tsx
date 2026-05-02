import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, ChevronDown, RefreshCw, DollarSign, ShoppingBag, Users, UserPlus, Ruler, ClipboardList, CalendarDays, ChevronRight, Crown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useSubscription } from "@/contexts/SubscriptionContext";

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
  { label: "Revenue", value: "GHS 12,450", icon: DollarSign, sub: "This month", trend: "+12%", path: "/analytics" },
  { label: "Active Orders", value: "23", icon: ShoppingBag, sub: "8 due this week", trend: "+3", path: "/orders" },
];

const quickActions = [
  { icon: UserPlus, label: "Add Client", path: "/clients" },
  { icon: Ruler, label: "Measure", path: "/measurements" },
  { icon: ClipboardList, label: "New Order", path: "/orders" },
  { icon: CalendarDays, label: "Appointment", path: "/appointments" },
];

const orders = [
  { img: orderWedding, type: "Wedding Gown", client: "Ama Serwaa", clientId: "ama-serwaa", status: "Sewing", date: "Mar 25", statusColor: "bg-status-sewing" },
  { img: orderSuit, type: "3-Piece Suit", client: "Kofi Mensah", clientId: "kofi-mensah", status: "Cutting", date: "Mar 28", statusColor: "bg-status-cutting" },
  { img: orderAgbada, type: "Agbada Set", client: "Yaw Boateng", clientId: "yaw-boateng", status: "Completed", date: "Mar 15", statusColor: "bg-status-completed" },
];

const fabrics = [
  { img: fabricAnkara, name: "Ankara Print", brand: "Vlisco", color: "Multi" },
  { img: fabricSilk, name: "Silk Satin", brand: "Premium", color: "Navy/Gold" },
  { img: fabricLace, name: "French Lace", brand: "Imported", color: "Ivory" },
];

const planLabels = { basic: "Basic", pro: "Pro", premium: "Premium" };

const Index = () => {
  const navigate = useNavigate();
  
  const { plan } = useSubscription();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Header */}
      <div className="designer-hero px-5 pt-6 pb-6 flex items-center justify-between rounded-b-3xl">
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate("/profile")}
            className="w-11 h-11 rounded-full p-[2px]"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>
            <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
              <span className="text-sm font-semibold text-foreground">JA</span>
            </div>
          </motion.button>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold shimmer-text">Hey, Justice!</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">053 698 7839</span>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/designer-messages")}
          className="w-10 h-10 rounded-full frost-card flex items-center justify-center relative">
          <Bell className="w-5 h-5 text-foreground" />
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary pulse-glow" />
        </motion.button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="px-5 space-y-6 mt-4">
        {/* Subscription Banner */}
        {plan === "basic" && (
          <motion.div variants={fadeUp}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/subscription")}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs font-semibold text-foreground">Upgrade to Pro</p>
                <p className="text-[10px] text-muted-foreground">Unlock analytics, workers & more</p>
              </div>
              <ChevronRight className="w-4 h-4 text-primary" />
            </motion.button>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Overview</h2>
            <button
              onClick={() => toast.success("Overview refreshed", { description: "Latest figures loaded." })}
              className="flex items-center gap-1 text-xs text-muted-foreground active:text-foreground transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Update
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <motion.button
                key={s.label}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(s.path)}
                className="frost-card p-4 space-y-2 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-status-completed" />
                    <span className="text-[10px] text-status-completed font-medium">{s.trend}</span>
                  </div>
                </div>
                <p className="text-xl font-bold text-gradient-gold">{s.value}</p>
                <span className="text-[10px] text-muted-foreground">{s.sub}</span>
              </motion.button>
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
                whileTap={{ scale: 0.92 }}
                whileHover={{ y: -2 }}
                onClick={() => navigate(a.path)}
                className="frost-card p-3 flex flex-col items-center gap-2"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.18), hsl(var(--accent) / 0.12))" }}>
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
            <button onClick={() => navigate("/orders")} className="text-xs text-muted-foreground flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5">
            {orders.map((o) => (
              <motion.div
                key={o.type}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/client/${o.clientId}`)}
                className="card-surface min-w-[160px] overflow-hidden flex-shrink-0 cursor-pointer"
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
            <button onClick={() => navigate("/add")} className="text-xs text-muted-foreground flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5">
            {fabrics.map((f) => (
              <motion.div
                key={f.name}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/add")}
                className="card-surface min-w-[140px] overflow-hidden flex-shrink-0 cursor-pointer"
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
