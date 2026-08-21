import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft,
  Coins, Wallet, Receipt, Target, Sparkles, Info,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";
import FeatureGate from "@/components/FeatureGate";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAtelier } from "@/contexts/AtelierContext";
import { projectRevenue } from "@/lib/projections";

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

const garmentProfitData = [
  { name: "Bridal", value: 35, color: "hsl(var(--primary))" },
  { name: "Suits", value: 25, color: "hsl(var(--accent))" },
  { name: "Traditional", value: 22, color: "hsl(var(--status-completed))" },
  { name: "Casual", value: 18, color: "hsl(var(--muted-foreground))" },
];

const workerProductivity = [
  { name: "Tunde A.", tasks: 24, onTime: 92 },
  { name: "Amina K.", tasks: 18, onTime: 96 },
  { name: "Kwesi B.", tasks: 21, onTime: 85 },
  { name: "Esi M.", tasks: 15, onTime: 98 },
];

const transactions = [
  { name: "Amina Johnson", type: "received", amount: 4500, method: "Bank Transfer", date: "Today, 2:30 PM" },
  { name: "Fabric Express", type: "sent", amount: 1200, method: "Mobile Money", date: "Today, 11:00 AM" },
  { name: "David Okonkwo", type: "received", amount: 8200, method: "Cash", date: "Yesterday" },
  { name: "Thread Supply Co", type: "sent", amount: 3400, method: "Bank Transfer", date: "Yesterday" },
  { name: "Grace Mensah", type: "received", amount: 6000, method: "Mobile Money", date: "Mar 18" },
  { name: "Zara Textiles", type: "sent", amount: 5600, method: "Bank Transfer", date: "Mar 17" },
];

const periods = ["Week", "Month", "Year"];
const fadeUp = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } };

const Analytics = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("Month");
  const { format, code } = useCurrency();

  const Money = ({ value, decimals }: { value: number; decimals?: boolean }) => (
    <span className="font-mono tabular-nums">{format(value, decimals)}</span>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl border border-primary/25 bg-card/95 backdrop-blur-xl px-3 py-2 shadow-2xl">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-bold text-primary font-mono">{format(payload[0].value)}</p>
      </div>
    );
  };

  const totals = useMemo(() => {
    const revenue = revenueData.reduce((s, r) => s + r.revenue, 0);
    return {
      revenue,
      pending: Math.round(revenue * 0.16),
      outstanding: Math.round(revenue * 0.13),
      profit: Math.round(revenue * 0.73),
      avgOrder: Math.round(revenue / 48),
    };
  }, []);

  const statCards = [
    { label: "Total Revenue", value: totals.revenue, change: "+12.5%", up: true, icon: Coins },
    { label: "Pending", value: totals.pending, change: "-3.2%", up: false, icon: Wallet },
    { label: "Outstanding", value: totals.outstanding, change: "+5.1%", up: true, icon: Receipt },
    { label: "Net Profit", value: totals.profit, change: "+18.4%", up: true, icon: Target },
  ];

  return (
    <FeatureGate requiredPlan="pro" feature="Analytics dashboard">
      <div className="min-h-screen bg-background pb-28">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/70 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/40">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <h1 className="text-lg font-bold shimmer-text flex-1">Analytics</h1>
          <button
            onClick={() => navigate("/settings/currency")}
            className="px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-[11px] font-semibold text-primary"
          >
            {code}
          </button>
        </div>

        <div className="px-5 pt-4 space-y-5 lg:max-w-6xl lg:mx-auto">
          {/* Hero balance */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible"
            className="relative overflow-hidden rounded-3xl border border-primary/20 p-5"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.16), hsl(var(--card)) 55%)" }}
          >
            <div
              className="absolute -top-16 -right-10 w-48 h-48 rounded-full blur-3xl opacity-40"
              style={{ background: "hsl(var(--primary) / 0.35)" }}
            />
            <div className="relative">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Net revenue · this {period.toLowerCase()}
              </div>
              <p className="mt-2 text-3xl font-bold text-gradient-gold font-mono tabular-nums">
                {format(totals.revenue)}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-status-completed/15 text-status-completed text-[11px] font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +18.4% vs last {period.toLowerCase()}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-secondary text-[11px] text-muted-foreground">
                  Avg order <Money value={totals.avgOrder} />
                </span>
              </div>
            </div>
          </motion.div>

          {/* Period toggle */}
          <div className="flex gap-1 frost-card rounded-2xl p-1">
            {periods.map((p) => (
              <motion.button
                key={p} whileTap={{ scale: 0.96 }} onClick={() => setPeriod(p)}
                className={cn("relative flex-1 py-2 rounded-xl text-xs font-semibold transition-colors",
                  period === p ? "text-primary-foreground" : "text-muted-foreground")}
              >
                {period === p && (
                  <motion.div layoutId="periodIndicator"
                    className="absolute inset-0 rounded-xl bg-primary glow-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                <span className="relative z-10">{p}</span>
              </motion.button>
            ))}
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="frost-card p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{s.label}</span>
                  <div className="w-7 h-7 rounded-lg bg-primary/12 flex items-center justify-center">
                    <s.icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>
                <p className="text-lg font-bold text-foreground font-mono tabular-nums">{format(s.value)}</p>
                <span className={cn("text-[10px] font-semibold flex items-center gap-0.5",
                  s.up ? "text-status-completed" : "text-destructive")}>
                  {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{s.change}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Revenue chart */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}
              className="frost-card p-4 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Revenue Overview</h3>
                  <p className="text-[11px] text-muted-foreground">Last 7 months · {code}</p>
                </div>
                <span className="text-xs text-status-completed font-semibold">+18.4%</span>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.3 }} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5}
                      fill="url(#goldGrad)" dot={{ r: 0 }} activeDot={{ r: 5, fill: "hsl(var(--primary))" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Garment profitability */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}
              className="card-surface p-4">
              <h3 className="text-sm font-semibold text-foreground mb-4">Most Profitable Garments</h3>
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={garmentProfitData} cx="50%" cy="50%" innerRadius={32} outerRadius={52}
                        paddingAngle={4} dataKey="value" stroke="none">
                        {garmentProfitData.map((e) => <Cell key={e.name} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2.5">
                  {garmentProfitData.map((g) => (
                    <div key={g.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: g.color }} />
                          <span className="text-xs text-foreground">{g.name}</span>
                        </div>
                        <span className="text-xs font-bold text-foreground">{g.value}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-secondary overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${g.value}%` }}
                          transition={{ duration: 0.7 }} className="h-full rounded-full"
                          style={{ background: g.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Worker productivity */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
              className="card-surface p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Worker Productivity</h3>
              <div className="space-y-3">
                {workerProductivity.map((w) => (
                  <div key={w.name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-foreground">
                        {w.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-foreground font-medium">{w.name}</span>
                        <span className="text-[10px] text-muted-foreground">{w.tasks} tasks · {w.onTime}% on-time</span>
                      </div>
                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${w.onTime}%` }}
                          transition={{ duration: 0.8 }} className="h-full bg-primary rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Weekly bars */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.25 }}
              className="card-surface p-4">
              <h3 className="text-sm font-semibold text-foreground mb-4">This Week</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--primary) / 0.08)" }} />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Transactions */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }}
              className="card-surface p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Recent Transactions</h3>
              <div className="space-y-2">
                {transactions.map((t) => {
                  const received = t.type === "received";
                  return (
                    <div key={`${t.name}-${t.date}`}
                      className="flex items-center gap-3 rounded-2xl bg-secondary/30 p-3">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                        received ? "bg-status-completed/15" : "bg-destructive/15")}>
                        {received
                          ? <ArrowDownLeft className="w-4 h-4 text-status-completed" />
                          : <ArrowUpRight className="w-4 h-4 text-destructive" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">{t.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{t.method} · {t.date}</p>
                      </div>
                      <span className={cn("text-xs font-bold font-mono tabular-nums",
                        received ? "text-status-completed" : "text-destructive")}>
                        {received ? "+" : "−"}{format(t.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
};

export default Analytics;
