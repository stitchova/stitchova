import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import orderWedding from "@/assets/order-wedding.jpg";
import orderSuit from "@/assets/order-suit.jpg";
import orderAgbada from "@/assets/order-agbada.jpg";

const statusTabs = ["All", "Cutting", "Sewing", "Beading", "Finishing", "Quality Check", "Completed"];

const garmentCategories = {
  Men: ["Trousers", "Shirt", "Suit", "Blazer", "Agbada", "Senator", "Kaftan"],
  Women: ["Gown", "Skirt", "Blouse", "Jumpsuit", "Bridal", "Iro & Buba", "Wrapper"],
  Children: ["Uniforms", "Dresses", "Shirts", "Trousers"],
};

const orders = [
  { img: orderWedding, type: "Wedding Gown", client: "Ama Serwaa", clientId: "ama-serwaa", status: "Sewing", date: "Mar 25", price: "GHS 2,500", statusColor: "bg-status-sewing text-primary-foreground", category: "Women", garment: "Bridal", stage: "Sewing", styleDesc: "Sweetheart neckline with cathedral train" },
  { img: orderSuit, type: "3-Piece Suit", client: "Kofi Mensah", clientId: "kofi-mensah", status: "Cutting", date: "Mar 28", price: "GHS 1,800", statusColor: "bg-status-cutting text-primary-foreground", category: "Men", garment: "Suit", stage: "Cutting", styleDesc: "Slim fit, navy blue with gold buttons" },
  { img: orderAgbada, type: "Agbada Set", client: "Yaw Boateng", clientId: "yaw-boateng", status: "Completed", date: "Mar 15", price: "GHS 3,200", statusColor: "bg-status-completed text-primary-foreground", category: "Men", garment: "Agbada", stage: "Completed", styleDesc: "Heavy embroidery with fila cap" },
  { img: orderWedding, type: "Evening Dress", client: "Abena Poku", clientId: "abena-poku", status: "Beading", date: "Apr 2", price: "GHS 1,500", statusColor: "bg-status-sewing text-primary-foreground", category: "Women", garment: "Gown", stage: "Beading", styleDesc: "Crystal beading on bodice" },
  { img: orderSuit, type: "School Uniform Set", client: "Mrs. Adjei", clientId: "mrs-adjei", status: "Finishing", date: "Apr 5", price: "GHS 600", statusColor: "bg-status-sewing text-primary-foreground", category: "Children", garment: "Uniforms", stage: "Finishing", styleDesc: "5 sets, white shirts with navy trousers" },
];

const Orders = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = orders.filter((o) => {
    const matchStatus = activeTab === "All" || o.stage === activeTab;
    const matchCategory = activeCategory === "All" || o.category === activeCategory;
    const matchSearch = `${o.type} ${o.client} ${o.garment}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchCategory && matchSearch;
  });

  const stageColor: Record<string, string> = {
    Cutting: "bg-status-cutting", Sewing: "bg-status-sewing", Beading: "bg-primary",
    Finishing: "bg-primary", "Quality Check": "bg-status-completed/70", Completed: "bg-status-completed",
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-6 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Orders</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage all your fashion orders</p>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/add")}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4 text-primary-foreground" />
        </motion.button>
      </div>

      <div className="px-5 py-3 flex gap-2">
        <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 flex-1">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground flex-1 outline-none" />
        </div>
        <motion.button whileTap={{ scale: 0.9 }} className="w-12 h-12 rounded-xl bg-card flex items-center justify-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 px-5 mb-2 overflow-x-auto scrollbar-hide">
        {["All", "Men", "Women", "Children"].map((c) => (
          <button key={c} onClick={() => setActiveCategory(c)}
            className={cn("px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors",
              activeCategory === c ? "bg-secondary text-foreground" : "text-muted-foreground")}>
            {c}
          </button>
        ))}
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 px-5 mb-4 overflow-x-auto scrollbar-hide">
        {statusTabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={cn("px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors",
              activeTab === t ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground")}>
            {t}
          </button>
        ))}
      </div>

      <div className="px-5 space-y-3">
        {filtered.map((o, i) => (
          <motion.div key={o.type + i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/order/${o.clientId}`)} className="card-surface p-3 flex gap-3 cursor-pointer">
            <img src={o.img} alt={o.type} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{o.type}</p>
                  <p className="text-[11px] text-muted-foreground">{o.client}</p>
                </div>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${stageColor[o.stage] || "bg-secondary"} text-primary-foreground`}>{o.stage}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{o.category}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{o.garment}</span>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[11px] text-muted-foreground">Due: {o.date}</span>
                <span className="text-xs font-bold text-primary">{o.price}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground self-center flex-shrink-0" />
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No orders match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
