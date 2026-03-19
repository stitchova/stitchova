import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, Edit2, ChevronRight } from "lucide-react";
import orderWedding from "@/assets/order-wedding.jpg";
import orderSuit from "@/assets/order-suit.jpg";

const clientsData: Record<string, {
  name: string; initials: string; phone: string; email: string; location: string;
  joined: string; totalOrders: number; totalSpent: string;
  measurements: { label: string; value: string }[];
  orders: { type: string; status: string; date: string; price: string; img: string; statusColor: string }[];
  payments: { id: string; date: string; amount: string; method: string; order: string; status: string }[];
}> = {
  "ama-serwaa": {
    name: "Ama Serwaa", initials: "AS", phone: "024 123 4567", email: "ama@email.com",
    location: "Accra, Ghana", joined: "Jan 2024", totalOrders: 5, totalSpent: "GHS 8,200",
    measurements: [
      { label: "Bust", value: '36"' }, { label: "Waist", value: '28"' },
      { label: "Hips", value: '38"' }, { label: "Shoulder", value: '15"' },
      { label: "Sleeve", value: '24"' }, { label: "Dress Length", value: '42"' },
      { label: "Inseam", value: '30"' }, { label: "Neck", value: '14"' },
    ],
    orders: [
      { type: "Wedding Gown", status: "Sewing", date: "Mar 25", price: "GHS 2,500", img: orderWedding, statusColor: "bg-status-sewing" },
      { type: "Evening Dress", status: "Completed", date: "Feb 10", price: "GHS 1,500", img: orderSuit, statusColor: "bg-status-completed" },
      { type: "Cocktail Dress", status: "Completed", date: "Jan 5", price: "GHS 1,200", img: orderWedding, statusColor: "bg-status-completed" },
    ],
    payments: [
      { id: "PAY-001", date: "Mar 20, 2024", amount: "GHS 1,500", method: "Mobile Money", order: "Wedding Gown", status: "Paid" },
      { id: "PAY-002", date: "Mar 10, 2024", amount: "GHS 1,000", method: "Cash", order: "Wedding Gown", status: "Partial" },
      { id: "PAY-003", date: "Feb 10, 2024", amount: "GHS 1,500", method: "Mobile Money", order: "Evening Dress", status: "Paid" },
      { id: "PAY-004", date: "Jan 5, 2024", amount: "GHS 1,200", method: "Bank Transfer", order: "Cocktail Dress", status: "Paid" },
    ],
  },
};

const defaultClient = clientsData["ama-serwaa"];

const tabs = ["Measurements", "Orders", "Payments"] as const;
type Tab = typeof tabs[number];

const fadeVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const MeasurementsTab = ({ measurements }: { measurements: { label: string; value: string }[] }) => (
  <motion.div variants={fadeVariant} initial="hidden" animate="visible" exit="exit" className="space-y-3">
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-muted-foreground">Last updated: Mar 15, 2024</span>
      <motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-1 text-xs text-primary font-medium">
        <Edit2 className="w-3 h-3" /> Edit
      </motion.button>
    </div>
    <div className="grid grid-cols-2 gap-3">
      {measurements.map((m) => (
        <div key={m.label} className="card-surface p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
          <p className="text-lg font-bold text-foreground mt-1">{m.value}</p>
        </div>
      ))}
    </div>
  </motion.div>
);

const OrdersTab = ({ orders }: { orders: typeof defaultClient.orders }) => (
  <motion.div variants={fadeVariant} initial="hidden" animate="visible" exit="exit" className="space-y-3">
    {orders.map((o, i) => (
      <motion.div
        key={o.type + i}
        whileTap={{ scale: 0.98 }}
        className="card-surface p-3 flex gap-3"
      >
        <img src={o.img} alt={o.type} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{o.type}</p>
              <p className="text-[11px] text-muted-foreground">Due: {o.date}</p>
            </div>
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${o.statusColor} text-primary-foreground`}>
              {o.status}
            </span>
          </div>
          <p className="text-xs font-bold text-primary mt-1.5">{o.price}</p>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

const PaymentsTab = ({ payments }: { payments: typeof defaultClient.payments }) => (
  <motion.div variants={fadeVariant} initial="hidden" animate="visible" exit="exit" className="space-y-3">
    {payments.map((p) => (
      <motion.div key={p.id} whileTap={{ scale: 0.98 }} className="card-surface p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{p.amount}</p>
            <p className="text-[11px] text-muted-foreground">{p.order}</p>
          </div>
          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
            p.status === "Paid" ? "bg-status-completed text-primary-foreground" : "bg-status-sewing text-primary-foreground"
          }`}>
            {p.status}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
          <span className="text-[10px] text-muted-foreground">{p.method}</span>
          <span className="text-[10px] text-muted-foreground">{p.date}</span>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

const ClientProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const client = clientsData[id || ""] || defaultClient;
  const [activeTab, setActiveTab] = useState<Tab>("Measurements");

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </motion.button>
        <h1 className="text-base font-bold text-foreground">Client Profile</h1>
      </div>

      {/* Profile Card */}
      <div className="px-5 mb-5">
        <div className="card-elevated p-5 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-3">
            <span className="text-lg font-bold text-primary">{client.initials}</span>
          </div>
          <h2 className="text-lg font-bold text-foreground">{client.name}</h2>
          <span className="text-[11px] text-muted-foreground mt-0.5">Client since {client.joined}</span>

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Phone className="w-3 h-3" /> {client.phone}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="w-3 h-3" /> {client.location}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 w-full">
            <div className="card-surface p-3 text-center">
              <p className="text-lg font-bold text-foreground">{client.totalOrders}</p>
              <p className="text-[10px] text-muted-foreground">Orders</p>
            </div>
            <div className="card-surface p-3 text-center">
              <p className="text-lg font-bold text-primary">{client.totalSpent}</p>
              <p className="text-[10px] text-muted-foreground">Total Spent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 mb-4">
        {tabs.map((t) => (
          <motion.button
            key={t}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
              activeTab === t ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
            }`}
          >
            {t}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-5">
        <AnimatePresence mode="wait">
          {activeTab === "Measurements" && <MeasurementsTab key="m" measurements={client.measurements} />}
          {activeTab === "Orders" && <OrdersTab key="o" orders={client.orders} />}
          {activeTab === "Payments" && <PaymentsTab key="p" payments={client.payments} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClientProfile;
