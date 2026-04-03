import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, Edit2, ChevronRight, Save, X, Calendar, User, CreditCard, Clock, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import orderWedding from "@/assets/order-wedding.jpg";
import orderSuit from "@/assets/order-suit.jpg";

const clientsData: Record<string, {
  name: string; initials: string; phone: string; email: string; location: string;
  joined: string; totalOrders: number; totalSpent: string; gender: string; dob: string;
  address: string; notes: string;
  measurements: { label: string; value: string; date: string }[];
  orders: { type: string; status: string; date: string; price: string; img: string; statusColor: string; category: string }[];
  payments: { id: string; date: string; amount: string; method: string; order: string; status: string; planType: string; balance: string }[];
  appointments: { date: string; type: string; time: string; status: string }[];
}> = {
  "ama-serwaa": {
    name: "Ama Serwaa", initials: "AS", phone: "024 123 4567", email: "ama@email.com",
    location: "Accra, Ghana", joined: "Jan 2024", totalOrders: 5, totalSpent: "GHS 8,200",
    gender: "Female", dob: "1995-03-15", address: "12 Ring Road, Osu, Accra",
    notes: "Prefers form-fitting styles. Allergic to synthetic fabrics.",
    measurements: [
      { label: "Bust", value: '36"', date: "Mar 2024" }, { label: "Waist", value: '28"', date: "Mar 2024" },
      { label: "Hips", value: '38"', date: "Mar 2024" }, { label: "Shoulder", value: '15"', date: "Mar 2024" },
      { label: "Sleeve", value: '24"', date: "Mar 2024" }, { label: "Dress Length", value: '42"', date: "Mar 2024" },
      { label: "Inseam", value: '30"', date: "Jan 2024" }, { label: "Neck", value: '14"', date: "Jan 2024" },
    ],
    orders: [
      { type: "Wedding Gown", status: "Sewing", date: "Mar 25", price: "GHS 2,500", img: orderWedding, statusColor: "bg-status-sewing", category: "Bridal" },
      { type: "Evening Dress", status: "Completed", date: "Feb 10", price: "GHS 1,500", img: orderSuit, statusColor: "bg-status-completed", category: "Formal" },
      { type: "Cocktail Dress", status: "Completed", date: "Jan 5", price: "GHS 1,200", img: orderWedding, statusColor: "bg-status-completed", category: "Formal" },
    ],
    payments: [
      { id: "PAY-001", date: "Mar 20, 2024", amount: "GHS 1,500", method: "Mobile Money", order: "Wedding Gown", status: "Paid", planType: "Deposit", balance: "GHS 1,000" },
      { id: "PAY-002", date: "Mar 10, 2024", amount: "GHS 1,000", method: "Cash", order: "Wedding Gown", status: "Partial", planType: "Installment", balance: "GHS 0" },
      { id: "PAY-003", date: "Feb 10, 2024", amount: "GHS 1,500", method: "Mobile Money", order: "Evening Dress", status: "Paid", planType: "Full Payment", balance: "GHS 0" },
      { id: "PAY-004", date: "Jan 5, 2024", amount: "GHS 1,200", method: "Bank Transfer", order: "Cocktail Dress", status: "Paid", planType: "Full Payment", balance: "GHS 0" },
    ],
    appointments: [
      { date: "Mar 25, 2024", type: "Fitting", time: "10:00 AM", status: "Upcoming" },
      { date: "Mar 10, 2024", type: "Measurement", time: "2:00 PM", status: "Completed" },
      { date: "Jan 5, 2024", type: "Consultation", time: "11:00 AM", status: "Completed" },
    ],
  },
};

const defaultClient = clientsData["ama-serwaa"];

const tabs = ["Measurements", "Orders", "Payments", "History"] as const;
type Tab = typeof tabs[number];

const fadeVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const MeasurementsTab = ({ measurements }: { measurements: typeof defaultClient.measurements }) => (
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
          <p className="text-[9px] text-primary mt-0.5">{m.date}</p>
        </div>
      ))}
    </div>
  </motion.div>
);

const OrdersTab = ({ orders }: { orders: typeof defaultClient.orders }) => (
  <motion.div variants={fadeVariant} initial="hidden" animate="visible" exit="exit" className="space-y-3">
    {orders.map((o, i) => (
      <motion.div key={o.type + i} whileTap={{ scale: 0.98 }} className="card-surface p-3 flex gap-3">
        <img src={o.img} alt={o.type} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{o.type}</p>
              <p className="text-[11px] text-muted-foreground">{o.category} · Due: {o.date}</p>
            </div>
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${o.statusColor} text-primary-foreground`}>{o.status}</span>
          </div>
          <p className="text-xs font-bold text-primary mt-1.5">{o.price}</p>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

const PaymentsTab = ({ payments }: { payments: typeof defaultClient.payments }) => {
  const outstanding = payments.filter(p => p.status === "Partial");
  return (
    <motion.div variants={fadeVariant} initial="hidden" animate="visible" exit="exit" className="space-y-3">
      {outstanding.length > 0 && (
        <div className="card-glass p-3 border-l-2 border-l-primary">
          <p className="text-xs font-semibold text-primary">Outstanding Balance</p>
          <p className="text-lg font-bold text-foreground">{outstanding.reduce((_, p) => p.balance, "GHS 0")}</p>
        </div>
      )}
      {payments.map((p) => (
        <motion.div key={p.id} whileTap={{ scale: 0.98 }} className="card-surface p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{p.amount}</p>
              <p className="text-[11px] text-muted-foreground">{p.order}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${p.status === "Paid" ? "bg-status-completed text-primary-foreground" : "bg-status-sewing text-primary-foreground"}`}>{p.status}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{p.planType}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
            <span className="text-[10px] text-muted-foreground">{p.method}</span>
            <span className="text-[10px] text-muted-foreground">{p.date}</span>
          </div>
          {p.balance !== "GHS 0" && (
            <p className="text-[10px] text-primary mt-1">Balance remaining: {p.balance}</p>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

const HistoryTab = ({ client }: { client: typeof defaultClient }) => {
  const timeline = [
    ...client.appointments.map(a => ({ date: a.date, type: "appointment", label: `${a.type} — ${a.time}`, status: a.status, icon: Calendar })),
    ...client.orders.map(o => ({ date: o.date + ", 2024", type: "order", label: `${o.type} — ${o.price}`, status: o.status, icon: User })),
    ...client.payments.map(p => ({ date: p.date, type: "payment", label: `${p.amount} — ${p.order}`, status: p.status, icon: CreditCard })),
  ];

  return (
    <motion.div variants={fadeVariant} initial="hidden" animate="visible" exit="exit" className="space-y-3">
      <p className="text-xs text-muted-foreground mb-2">Complete client history</p>
      {timeline.map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
          className="flex gap-3 items-start">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <item.icon className="w-3.5 h-3.5 text-primary" />
            </div>
            {i < timeline.length - 1 && <div className="w-px h-8 bg-border/50" />}
          </div>
          <div className="flex-1 pb-4">
            <p className="text-xs font-semibold text-foreground">{item.label}</p>
            <p className="text-[10px] text-muted-foreground">{item.date}</p>
            <span className={`text-[9px] px-2 py-0.5 rounded-full mt-1 inline-block ${item.status === "Completed" || item.status === "Paid" ? "bg-status-completed/15 text-status-completed" : "bg-primary/10 text-primary"}`}>{item.status}</span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

const ClientProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  const client = clientsData[id || ""] || defaultClient;
  const [activeTab, setActiveTab] = useState<Tab>("Measurements");
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: client.name, phone: client.phone, email: client.email,
    location: client.location, gender: client.gender, dob: client.dob,
    address: client.address, notes: client.notes,
  });

  const handleSaveEdit = () => {
    setEditing(false);
    toast({ title: "Profile updated", description: "Client details saved successfully." });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </motion.button>
        <h1 className="text-base font-bold text-foreground flex-1">Client Profile</h1>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditing(!editing)}
          className="flex items-center gap-1 text-xs text-primary font-medium">
          {editing ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
          {editing ? "Cancel" : "Edit"}
        </motion.button>
      </div>

      <div className="px-5 mb-5">
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="card-elevated p-5 space-y-3">
              {[
                { key: "name", label: "Full Name" }, { key: "phone", label: "Phone" },
                { key: "email", label: "Email" }, { key: "address", label: "Address" },
                { key: "dob", label: "Date of Birth", type: "date" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">{f.label}</label>
                  <input type={f.type || "text"} value={editData[f.key as keyof typeof editData]}
                    onChange={(e) => setEditData({ ...editData, [f.key]: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                </div>
              ))}
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Gender</label>
                <div className="flex gap-2">
                  {["Male", "Female"].map((g) => (
                    <motion.button key={g} whileTap={{ scale: 0.95 }} onClick={() => setEditData({ ...editData, gender: g })}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${editData.gender === g ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"}`}>
                      {g}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Notes & Preferences</label>
                <textarea value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} rows={3}
                  className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none" />
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSaveEdit}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="card-elevated p-5 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-3">
                <span className="text-lg font-bold text-primary">{client.initials}</span>
              </div>
              <h2 className="text-lg font-bold text-foreground">{client.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{client.gender}</span>
                <span className="text-[11px] text-muted-foreground">Since {client.joined}</span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {client.phone}</div>
                <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {client.location}</div>
              </div>
              {client.notes && (
                <p className="text-[11px] text-muted-foreground mt-2 bg-secondary/50 px-3 py-1.5 rounded-lg italic">"{client.notes}"</p>
              )}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-2 px-5 mb-4 overflow-x-auto scrollbar-hide">
        {tabs.map((t) => (
          <motion.button key={t} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${activeTab === t ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}>
            {t}
          </motion.button>
        ))}
      </div>

      <div className="px-5">
        <AnimatePresence mode="wait">
          {activeTab === "Measurements" && <MeasurementsTab key="m" measurements={client.measurements} />}
          {activeTab === "Orders" && <OrdersTab key="o" orders={client.orders} />}
          {activeTab === "Payments" && <PaymentsTab key="p" payments={client.payments} />}
          {activeTab === "History" && <HistoryTab key="h" client={client} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClientProfile;
