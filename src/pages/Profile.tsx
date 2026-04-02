import { motion } from "framer-motion";
import { ArrowLeft, Camera, ChevronRight, LogOut, Bell, Shield, HelpCircle, Settings, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";

const Profile = () => {
  const navigate = useNavigate();
  const { role } = useRole();

  const isDesigner = role === "designer";

  const menuItems = [
    { icon: Bell, label: "Notifications", desc: "Manage your alerts", path: "/designer-messages" },
    { icon: CreditCard, label: "Payments", desc: "Payment methods & history", path: "/analytics" },
    { icon: Shield, label: "Privacy & Security", desc: "Account protection", path: "/profile" },
    { icon: Settings, label: "Settings", desc: "App preferences", path: "/profile" },
    { icon: HelpCircle, label: "Help & Support", desc: "Get assistance", path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
      </div>

      <div className="px-5">
        {/* Avatar */}
        <div className="flex flex-col items-center py-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-xl font-bold text-foreground">{isDesigner ? "JA" : "AK"}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <Camera className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-base font-bold text-foreground mt-3">{isDesigner ? "Justice Agyeman" : "Akua Konadu"}</h2>
          <p className="text-xs text-muted-foreground">{isDesigner ? "Fashion Designer" : "Client"}</p>
        </div>


        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              className="w-full card-surface p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          ))}
        </div>

        {/* Logout */}
        <motion.button whileTap={{ scale: 0.98 }} onClick={() => navigate("/auth")} className="w-full mt-4 p-4 flex items-center justify-center gap-2 rounded-2xl border border-destructive/20">
          <LogOut className="w-4 h-4 text-destructive" />
          <span className="text-sm font-semibold text-destructive">Log Out</span>
        </motion.button>
      </div>
    </div>
  );
};

export default Profile;