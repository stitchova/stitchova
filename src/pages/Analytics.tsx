import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";
import FeatureGate from "@/components/FeatureGate";

const revenueData = [
  { month: "Jan", revenue: 12400 }, { month: "Feb", revenue: 18200 },
  { month: "Mar", revenue: 15800 }, { month: "Apr", revenue: 22100 },
  { month: "May", revenue: 19600 }, { month: "Jun", revenue: 28300 },
  { month: "Jul", revenue: 24500 },
];

const weeklyData = [
  { day: "Mon", amount: 3200 }, { day: "Tue", amount: 4100 },
  { day: "Wed", amount: 2800 }, { day: "Thu", amount: 5200 },
  { day: "Fri", amount: 4700 }, { day: "Sat", amount: 6100 },
  { day: "Sun", amount: 1900 },
];

const transactions = [
  { name: "Amina Johnson", type: "received", amount: 4500, method: "Bank Transfer", date: "Today, 2:30 PM" },
  { name: "Fabric Express", type: "sent", amount: 1200, method: "Mobile Money", date: "Today, 11:00 AM" },
  { name: "David Okonkwo", type: "received", amount: 8200, method: "Cash", date: "Yesterday" },
  { name: "Thread Supply Co", type: "sent", amount: 3400, method: "Bank Transfer", date: "Yesterday" },
  { name: "Grace Mensah", type: "received", amount: 6000, method: "Mobile Money", date: "Mar 18" },
  { name: "Zara Textiles", type: "sent", amount: 5600, method: "Bank Transfer", date: "Mar 17" },
];

const statCards = [
  { label: "Total Revenue", value: "₦142,900", change: "+12.5%", up: true },
  { label: "Pending", value: "₦23,400", change: "-3.2%", up: false },
  { label: "Expenses", value: "₦38,200", change: "+8.1%", up: true },
  { label: "Net Profit", value: "₦104,700", change: "+18.4%", up: true },
];

const periods = ["Week", "Month", "Year"];

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">₦{payload[0].value.toLocaleString()}</p>
    </div>
  );
};

const Analytics = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("Month");

  return (
    <FeatureGate requiredPlan="pro" feature="Analytics dashboard">
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/50">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <h1 className="text-lg font-semibold text-foreground">Analytics</h1>
      </div>

      <div className="px-5 pt-4 space-y-5">
        {/* Stat cards */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
          {statCards.map((s) => (
            <div key={s.label} className="card-surface p-3.5 space-y-1">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <span className={cn("text-[10px] font-medium flex items-center gap-0.5", s.up ? "text-status-completed" : "text-destructive")}>
                {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {s.change}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Period toggle */}
        <div className="flex gap-1 bg-card rounded-xl p-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-medium transition-all",
                period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Revenue chart */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="card-surface p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-foreground">Revenue Overview</h3>
            <span className="text-xs text-status-completed font-medium">+18.4%</span>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(45, 100%, 50%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(45, 100%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 5%, 18%)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(240, 5%, 65%)", fontSize: 11 }} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(45, 100%, 50%)" strokeWidth={2} fill="url(#goldGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Weekly bar chart */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="card-surface p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">This Week</h3>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(240, 5%, 65%)", fontSize: 11 }} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="hsl(45, 100%, 50%)" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Transaction history */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
          <h3 className="text-sm font-semibold text-foreground mb-3">Recent Transactions</h3>
          <div className="space-y-2">
            {transactions.map((tx, i) => (
              <motion.div key={i} whileTap={{ scale: 0.98 }} className="card-surface p-3.5 flex items-center gap-3">
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center",
                  tx.type === "received" ? "bg-status-completed/15" : "bg-destructive/15"
                )}>
                  {tx.type === "received"
                    ? <ArrowDownLeft className="w-4 h-4 text-status-completed" />
                    : <ArrowUpRight className="w-4 h-4 text-destructive" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tx.name}</p>
                  <p className="text-[11px] text-muted-foreground">{tx.method} · {tx.date}</p>
                </div>
                <span className={cn("text-sm font-semibold", tx.type === "received" ? "text-status-completed" : "text-foreground")}>
                  {tx.type === "received" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
