import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import orderWedding from "@/assets/order-wedding.jpg";
import orderSuit from "@/assets/order-suit.jpg";
import orderAgbada from "@/assets/order-agbada.jpg";

const tabs = ["All", "Cutting", "Sewing", "Completed"];

const orders = [
  { img: orderWedding, type: "Wedding Gown", client: "Ama Serwaa", status: "Sewing", date: "Mar 25", price: "GHS 2,500", statusColor: "bg-status-sewing text-primary-foreground" },
  { img: orderSuit, type: "3-Piece Suit", client: "Kofi Mensah", status: "Cutting", date: "Mar 28", price: "GHS 1,800", statusColor: "bg-status-cutting text-primary-foreground" },
  { img: orderAgbada, type: "Agbada Set", client: "Yaw Boateng", status: "Completed", date: "Mar 15", price: "GHS 3,200", statusColor: "bg-status-completed text-primary-foreground" },
  { img: orderWedding, type: "Evening Dress", client: "Abena Poku", status: "Sewing", date: "Apr 2", price: "GHS 1,500", statusColor: "bg-status-sewing text-primary-foreground" },
];

const Orders = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-xl font-bold text-foreground">Orders</h1>
        <p className="text-xs text-muted-foreground mt-1">Manage all your fashion orders</p>
      </div>

      {/* Search */}
      <div className="px-5 py-3 flex gap-2">
        <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 flex-1">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground flex-1 outline-none"
          />
        </div>
        <motion.button whileTap={{ scale: 0.9 }} className="w-12 h-12 rounded-xl bg-card flex items-center justify-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 mb-4 overflow-x-auto scrollbar-hide">
        {tabs.map((t, i) => (
          <button
            key={t}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              i === 0 ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Order List */}
      <div className="px-5 space-y-3">
        {orders.map((o, i) => (
          <motion.div
            key={o.type + i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.98 }}
            className="card-surface p-3 flex gap-3"
          >
            <img src={o.img} alt={o.type} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{o.type}</p>
                  <p className="text-[11px] text-muted-foreground">{o.client}</p>
                </div>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${o.statusColor}`}>
                  {o.status}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-muted-foreground">Due: {o.date}</span>
                <span className="text-xs font-bold text-primary">{o.price}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
