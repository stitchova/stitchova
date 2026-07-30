import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, ChevronRight, LogOut, Bell, Shield, HelpCircle, Settings, CreditCard, ShoppingBag, Users, Sparkles, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { useShowcase } from "@/contexts/ShowcaseContext";
import { toast } from "sonner";
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
  const { savedPosts } = useShowcase();
  const isDesigner = role === "designer";
  const [tab, setTab] = useState<"menu" | "saved">("menu");

  const handleLogout = () => {
    localStorage.removeItem("fashionos-role");
    localStorage.removeItem("fashionos-authenticated");
    localStorage.removeItem("stitchova-lock-unlocked");
    toast.success("Logged out");
    navigate("/auth");
  };

  const menuItems = [
    { icon: Bell, label: "Notifications", desc: "Manage your alerts", path: isDesigner ? "/designer-messages" : "/messages", badge: 3, tint: "bg-primary/10 text-primary" },
    ...(isDesigner
      ? [{ icon: CreditCard, label: "Analytics", desc: "Revenue & business insights", path: "/analytics", badge: 0, tint: "bg-green-500/10 text-green-400" }]
      : [{ icon: ShoppingBag, label: "My Orders", desc: "Track your orders", path: "/client-orders", badge: 0, tint: "bg-green-500/10 text-green-400" }]),
    { icon: Shield, label: "Privacy & Security", desc: "Account protection", path: "/settings", badge: 0, tint: "bg-blue-500/10 text-blue-400" },
    { icon: Settings, label: "Settings", desc: "App preferences", path: "/settings", badge: 0, tint: "bg-purple-500/10 text-purple-400" },
    { icon: HelpCircle, label: "Help & Support", desc: "Get assistance", path: "/help", badge: 0, tint: "bg-orange-500/10 text-orange-400" },
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

        {/* Tabs (client only) */}
        {!isDesigner && (
          <div className="flex gap-1 mb-4 bg-secondary rounded-xl p-1">
            {(["menu", "saved"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition ${
                  tab === t ? "bg-card text-foreground" : "text-muted-foreground"
                }`}>
                {t === "menu" ? "Account" : `Saved (${savedPosts.length})`}
              </button>
            ))}
          </div>
        )}

        {/* Saved tab */}
        {!isDesigner && tab === "saved" && (
          <div>
            {savedPosts.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-3">
                  <Bookmark className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">No saved posts yet</p>
                <p className="text-xs text-muted-foreground mt-1">Tap the bookmark icon on any showcase post to save it.</p>
                <button onClick={() => navigate("/showcase")} className="mt-4 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  Browse Showcase
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {savedPosts.map((p) => (
                  <button key={p.id} onClick={() => navigate("/showcase")}
                    className="aspect-square rounded-xl overflow-hidden relative">
                    <img src={p.media[0]} alt="" className="w-full h-full object-cover" />
                    {p.available && (
                      <span className="absolute top-2 left-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">Available</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {(isDesigner || tab === "menu") && <>
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
          onClick={handleLogout}
          className="w-full mt-5 p-4 flex items-center justify-center gap-2 rounded-2xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="w-4 h-4 text-destructive" />
          <span className="text-sm font-bold text-destructive">Log Out</span>
        </motion.button>
        </>}
      </div>
    </div>
  );
};

export default Profile;
