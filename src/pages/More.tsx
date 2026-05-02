import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Scissors, CreditCard, BarChart3, Settings, HelpCircle, ChevronRight, Camera, Crown, LogOut, ClipboardList, Palette } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import FeatureGate from "@/components/FeatureGate";

const planLabels = { basic: "Basic", pro: "Pro", premium: "Premium" };
const planColors = { basic: "text-muted-foreground", pro: "text-primary", premium: "text-primary" };

const menuItems = [
  { icon: User, label: "My Account", desc: "View profile and settings", path: "/profile" },
  { icon: Crown, label: "Subscription", desc: "Manage your plan", path: "/subscription" },
  { icon: Palette, label: "Themes", desc: "Choose your color palette", path: "/themes" },
  { icon: Scissors, label: "Workers", desc: "Manage your tailoring team", path: "/workers", requiresPlan: "pro" as const },
  { icon: CreditCard, label: "Payments", desc: "Track revenue and expenses", path: "/analytics" },
  { icon: BarChart3, label: "Analytics", desc: "Business insights and reports", path: "/analytics", requiresPlan: "pro" as const },
  { icon: ClipboardList, label: "Activity Logs", desc: "Track all account actions", path: "/activity-logs" },
  { icon: HelpCircle, label: "Help & Support", desc: "Get help with any issue", path: "/help" },
  { icon: Settings, label: "Settings", desc: "Customize the app", path: "/settings" },
];

const More = () => {
  const navigate = useNavigate();
  const { plan, expiryDate } = useSubscription();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Profile Header */}
      <div className="flex flex-col items-center pt-10 pb-6">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate("/profile")} className="relative">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-xl font-bold text-foreground">JA</span>
          </div>
          <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-card border-2 border-background flex items-center justify-center">
            <Camera className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        </motion.button>
        <h2 className="text-lg font-bold text-foreground mt-3">Justice Ansah</h2>
        <p className="text-sm text-muted-foreground">053 698 7839</p>

        {/* Plan Badge */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/subscription")}
          className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-card"
        >
          <Crown className={`w-4 h-4 ${planColors[plan]}`} />
          <span className="text-xs font-semibold text-foreground">{planLabels[plan]} Plan</span>
          {plan !== "basic" && (
            <span className="text-[10px] text-muted-foreground">· Expires {expiryDate}</span>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        </motion.button>
      </div>

      {/* Menu */}
      <div className="px-5 space-y-3">
        {menuItems.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(item.path)}
            className="card-surface p-4 flex items-center gap-4 w-full text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <item.icon className="w-5 h-5 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="text-[11px] text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </motion.button>
        ))}

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: menuItems.length * 0.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/auth")}
          className="card-surface p-4 flex items-center gap-4 w-full text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <LogOut className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-destructive">Log Out</p>
            <p className="text-[11px] text-muted-foreground">Sign out of your account</p>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default More;
