import { motion } from "framer-motion";
import { User, Scissors, CreditCard, BarChart3, Settings, HelpCircle, ChevronRight, Camera } from "lucide-react";

const menuItems = [
  { icon: User, label: "My Account", desc: "View history and manage subscriptions" },
  { icon: Scissors, label: "Workers", desc: "Manage your tailoring team" },
  { icon: CreditCard, label: "Payments", desc: "Track revenue and expenses" },
  { icon: BarChart3, label: "Analytics", desc: "Business insights and reports" },
  { icon: HelpCircle, label: "Help & Support", desc: "Get help with any issue" },
  { icon: Settings, label: "Settings", desc: "Customize the app" },
];

const More = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Profile Header */}
      <div className="flex flex-col items-center pt-10 pb-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-xl font-bold text-foreground">JA</span>
          </div>
          <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-card border-2 border-background flex items-center justify-center">
            <Camera className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        </div>
        <h2 className="text-lg font-bold text-foreground mt-3">Justice Ansah</h2>
        <p className="text-sm text-muted-foreground">053 698 7839</p>
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
      </div>
    </div>
  );
};

export default More;
