import { Home, Users, ShoppingBag, BarChart3, MoreHorizontal, Plus, Compass, CalendarDays, User, MessageCircle, ClipboardList, Ruler, Package, UserCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useRole } from "@/contexts/RoleContext";

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  isCenter?: boolean;
}

const designerNav: NavItem[] = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Plus, label: "Add", path: "/add", isCenter: true },
  { icon: MessageCircle, label: "Messages", path: "/designer-messages" },
  { icon: MoreHorizontal, label: "More", path: "/more" },
];

const clientNav: NavItem[] = [
  { icon: Home, label: "Home", path: "/client-home" },
  { icon: Compass, label: "Discover", path: "/discover" },
  { icon: ShoppingBag, label: "Orders", path: "/client-orders" },
  { icon: CalendarDays, label: "Bookings", path: "/appointments" },
  { icon: User, label: "Profile", path: "/profile" },
];

const workerNav: NavItem[] = [
  { icon: Home, label: "Home", path: "/worker-dashboard" },
  { icon: ClipboardList, label: "Tasks", path: "/worker-tasks" },
  { icon: Ruler, label: "Measure", path: "/worker-measurements" },
  { icon: Package, label: "Materials", path: "/worker-materials" },
  { icon: UserCircle, label: "Profile", path: "/worker-profile" },
];

const hiddenPaths = ["/onboarding", "/auth", "/messages", "/designer-messages"];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useRole();

  if (hiddenPaths.includes(location.pathname)) return null;
  if (location.pathname.startsWith("/designer/")) return null;

  const navItems = role === "designer" ? designerNav : role === "worker" ? workerNav : clientNav;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="bg-card/90 backdrop-blur-2xl border-t border-border/30">
        <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            if (item.isCenter) {
              return (
                <motion.button
                  key={item.path}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => navigate(item.path)}
                  className="relative -mt-7 flex items-center justify-center w-14 h-14 rounded-2xl bg-primary shadow-lg shadow-primary/40 glow-primary"
                >
                  <Plus className="w-6 h-6 text-primary-foreground" />
                </motion.button>
              );
            }

            return (
              <motion.button
                key={item.path}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center gap-0.5 py-1 px-3"
              >
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -top-2 w-5 h-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground/70"
                  }`}
                />
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground/70"
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
