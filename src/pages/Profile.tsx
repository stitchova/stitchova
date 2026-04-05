import { motion } from "framer-motion";
import { ArrowLeft, Camera, ChevronRight, LogOut, Bell, Shield, HelpCircle, Settings, CreditCard, ShoppingBag, Users, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import designerAvatar1 from "@/assets/designer-avatar-1.jpg";
import designerAvatar2 from "@/assets/designer-avatar-2.jpg";
import designerAvatar3 from "@/assets/designer-avatar-3.jpg";

const ease = [0.16, 1, 0.3, 1];

const myDesigners = [
  { name: "Nana Ama", avatar: designerAvatar1, id: "nana-ama" },
  { name: "Kwame", avatar: designerAvatar2, id: "kwame-styles" },
  { name: "Efya", avatar: designerAvatar3, id: "efya-designs" },
];

const Profile = () => {
  const navigate = useNavigate();
  const { role } = useRole();
  const isDesigner = role === "designer";

  const menuItems = [
    { icon: Bell, label: "Notifications", desc: "Manage your alerts", path: "/designer-messages", badge: 3, tint: "bg-primary/10 text-primary" },
    { icon: CreditCard, label: "Payments", desc: "Payment methods & history", path: "/analytics", badge: 0, tint: "bg-green-500/10 text-green-400" },
    { icon: Shield, label: "Privacy & Security", desc: "Account protection", path: "/profile", badge: 0, tint: "bg-blue-500/10 text-blue-400" },
    { icon: Settings, label: "Settings", desc: "App preferences", path: "/profile", badge: 0, tint: "bg-purple-500/10 text-purple-400" },
    { icon: HelpCircle, label: "Help & Support", desc: "Get assistance", path: "/profile", badge: 0, tint: "bg-orange-500/10 text-orange-400" },
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
        {/* Avatar with gradient ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease }}
          className="flex flex-col items-center py-6"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-br from-primary via-primary/50 to-primary/20">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{isDesigner ? "JA" : "AK"}</span>
              </div>
            </div>
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
            >
              <Camera className="w-4 h-4 text-primary-foreground" />
            </motion.div>
          </div>
          <h2 className="text-lg font-bold text-foreground mt-4">{isDesigner ? "Justice Agyeman" : "Akua Konadu"}</h2>
          <p className="text-xs text-muted-foreground">{isDesigner ? "Fashion Designer" : "Client"}</p>

          {/* Stats Row */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold text-foreground">5</span>
              <span className="text-[10px]">Orders</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold text-foreground">3</span>
              <span className="text-[10px]">Designers</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px]">Since 2024</span>
            </div>
          </div>
        </motion.div>

        {/* My Designers */}
        {!isDesigner && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease }}
            className="mb-5"
          >
            <p className="text-xs font-bold text-foreground mb-3">My Designers</p>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide">
              {myDesigners.map((d) => (
                <motion.button
                  key={d.id}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => navigate(`/designer/${d.id}`)}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0"
                >
                  <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-primary/40 to-primary/10">
                    <img src={d.avatar} alt={d.name} className="w-full h-full rounded-full object-cover" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">{d.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(item.path)}
              className="w-full glass-card p-4 flex items-center gap-3"
            >
              <div className={`w-10 h-10 rounded-xl ${item.tint} flex items-center justify-center`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                {item.badge > 0 && (
                  <span className="text-[9px] font-bold bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Logout */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          onClick={() => navigate("/auth")}
          className="w-full mt-5 p-4 flex items-center justify-center gap-2 rounded-2xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="w-4 h-4 text-destructive" />
          <span className="text-sm font-bold text-destructive">Log Out</span>
        </motion.button>
      </div>
    </div>
  );
};

export default Profile;
