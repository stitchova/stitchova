import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import portfolio1 from "@/assets/designer-portfolio-1.jpg";
import portfolio2 from "@/assets/designer-portfolio-2.jpg";
import portfolio4 from "@/assets/designer-portfolio-4.jpg";

const tabs = ["Active", "Completed", "All"];

const orders = [
  { img: portfolio1, type: "Wedding Gown", designer: "Nana Ama Couture", status: "Sewing", date: "Mar 28", price: "GHS 3,200", progress: 65, statusColor: "bg-status-sewing", active: true },
  { img: portfolio2, type: "3-Piece Agbada", designer: "Kwame Styles", status: "Cutting", date: "Apr 5", price: "GHS 2,100", progress: 30, statusColor: "bg-status-cutting", active: true },
  { img: portfolio4, type: "Evening Gown", designer: "Efya Designs", status: "Completed", date: "Feb 14", price: "GHS 1,800", progress: 100, statusColor: "bg-status-completed", active: false },
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

      <div className="px-5 mb-4">
        <div className="flex gap-1 bg-secondary rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                activeTab === tab ? "bg-card text-foreground" : "text-muted-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-3">
        {filtered.map((o, i) => (
          <motion.div
            key={o.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileTap={{ scale: 0.98 }}
            className="card-surface overflow-hidden"
          >
            <div className="flex">
              <img src={o.img} alt={o.type} className="w-24 h-24 object-cover" />
              <div className="flex-1 p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{o.type}</p>
                    <p className="text-[10px] text-muted-foreground">{o.designer}</p>
                  </div>
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${o.statusColor} text-primary-foreground`}>
                    {o.status}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-secondary rounded-full h-1">
                    <div className="bg-primary h-1 rounded-full" style={{ width: `${o.progress}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground">Due: {o.date}</span>
                  <span className="text-xs font-semibold text-primary">{o.price}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ClientOrders;
