import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ChevronRight, Phone, Users } from "lucide-react";

const clients = [
  { name: "Ama Serwaa", phone: "024 123 4567", orders: 5, initials: "AS", lastOrder: "Mar 25" },
  { name: "Kofi Mensah", phone: "055 987 6543", orders: 3, initials: "KM", lastOrder: "Mar 22" },
  { name: "Yaw Boateng", phone: "020 456 7890", orders: 8, initials: "YB", lastOrder: "Mar 18" },
  { name: "Abena Poku", phone: "050 321 0987", orders: 2, initials: "AP", lastOrder: "Mar 15" },
  { name: "Kwame Asante", phone: "027 654 3210", orders: 6, initials: "KA", lastOrder: "Mar 10" },
];

const tabs = ["All", "Active", "New"];

const Clients = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="designer-hero px-5 pt-6 pb-5 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold shimmer-text">Clients</h1>
            <p className="text-xs text-muted-foreground mt-1">{clients.length} total clients</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl frost-card flex items-center justify-center">
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 py-3 mt-2 flex gap-2">
        <div className="flex items-center gap-3 glass-input px-4 py-3 flex-1">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground flex-1 outline-none"
          />
        </div>
        <motion.button whileTap={{ scale: 0.9 }} className="w-12 h-12 rounded-xl frost-card flex items-center justify-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 mb-4">
        {tabs.map((t) => (
          <motion.button
            key={t}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(t)}
            className={`relative px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === t ? "text-primary-foreground" : "frost-card text-muted-foreground"
            }`}
          >
            {activeTab === t && (
              <motion.div layoutId="clientsTabIndicator"
                className="absolute inset-0 rounded-xl bg-primary glow-primary"
                transition={{ type: "spring", stiffness: 400, damping: 30 }} />
            )}
            <span className="relative z-10">{t}</span>
          </motion.button>
        ))}
      </div>

      {/* Client List */}
      <div className="px-5 space-y-3">
        {filtered.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -1 }}
            onClick={() => navigate(`/client/${c.name.toLowerCase().replace(/\s+/g, "-")}`)}
            className="frost-card p-4 flex items-center gap-4 cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full p-[2px] flex-shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{c.initials}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{c.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">{c.phone}</span>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
              <span className="text-[10px] text-muted-foreground">{c.orders} orders</span>
              <span className="text-[9px] text-muted-foreground">Last: {c.lastOrder}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No clients found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;
