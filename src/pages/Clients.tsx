import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, Phone } from "lucide-react";

const clients = [
  { name: "Ama Serwaa", phone: "024 123 4567", orders: 5, initials: "AS" },
  { name: "Kofi Mensah", phone: "055 987 6543", orders: 3, initials: "KM" },
  { name: "Yaw Boateng", phone: "020 456 7890", orders: 8, initials: "YB" },
  { name: "Abena Poku", phone: "050 321 0987", orders: 2, initials: "AP" },
  { name: "Kwame Asante", phone: "027 654 3210", orders: 6, initials: "KA" },
];

const Clients = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-xl font-bold text-foreground">Clients</h1>
        <p className="text-xs text-muted-foreground mt-1">{clients.length} total clients</p>
      </div>

      {/* Search */}
      <div className="px-5 py-3">
        <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clients..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground flex-1 outline-none"
          />
        </div>
      </div>

      {/* Client List */}
      <div className="px-5 space-y-3">
        {clients.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.98 }}
            className="card-surface p-4 flex items-center gap-4"
          >
            <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">{c.initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{c.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">{c.phone}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-[10px] text-muted-foreground">{c.orders} orders</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground mt-0.5 ml-auto" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Clients;
