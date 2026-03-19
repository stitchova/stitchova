import { Home, Users, ShoppingBag, BarChart3, MoreHorizontal, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Plus, label: "Add", path: "/add", isCenter: true },
  { icon: ShoppingBag, label: "Orders", path: "/orders" },
  { icon: MoreHorizontal, label: "More", path: "/more" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/onboarding") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="bg-card/95 backdrop-blur-xl border-t border-border">
        <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            if (item.isCenter) {
              return (
                <motion.button
                  key={item.path}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate(item.path)}
                  className="relative -mt-6 flex items-center justify-center w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/30"
                >
                  <Plus className="w-6 h-6 text-primary-foreground" />
                </motion.button>
              );
            }

            return (
              <motion.button
                key={item.path}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-0.5 py-1 px-3"
              >
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
