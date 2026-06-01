import { Home, Users, ShoppingBag, BarChart3, MoreHorizontal, Plus, Compass, CalendarDays, User, MessageCircle, ClipboardList, Ruler, Package, UserCircle, Clapperboard } from "lucide-react";
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
  { icon: Clapperboard, label: "Showcase", path: "/showcase" },
  { icon: Plus, label: "Add", path: "/add", isCenter: true },
  { icon: MessageCircle, label: "Messages", path: "/designer-messages" },
  { icon: MoreHorizontal, label: "More", path: "/more" },
];

const clientNav: NavItem[] = [
  { icon: Home, label: "Home", path: "/client-home" },
  { icon: Compass, label: "Discover", path: "/discover" },
  { icon: Clapperboard, label: "Showcase", path: "/showcase" },
  { icon: ShoppingBag, label: "Orders", path: "/client-orders" },
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
  if (location.pathname.startsWith("/workshop-chat/")) return null;
  if (location.pathname === "/showcase/new") return null;

  const navItems = role === "designer" ? designerNav : role === "worker" ? workerNav : clientNav;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="glass-nav">
        <div className="flex items-end justify-around px-3 pt-2 pb-3 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            if (item.isCenter) {
              return (
                <motion.button
                  key={item.path}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate(item.path)}
                  className="relative -mt-10 flex items-center justify-center w-16 h-16 rounded-full bg-primary shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.6)] ring-8 ring-background"
                >
                  <Plus className="w-7 h-7 text-primary-foreground" strokeWidth={2.5} />
                </motion.button>
              );
            }

            return (
              <motion.button
                key={item.path}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center gap-1 py-1 px-3 min-w-[56px]"
              >
                <item.icon
                  className={`w-6 h-6 transition-colors duration-200 ${
                    isActive ? "text-foreground" : "text-muted-foreground/60"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                  fill={isActive ? "currentColor" : "none"}
                />
                <span
                  className={`text-[11px] transition-colors duration-200 ${
                    isActive
                      ? "text-foreground font-bold"
                      : "text-muted-foreground/60 font-medium"
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
