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
  { icon: Plus, label: "Add", path: "/add", isCenter: true },
  { icon: MessageCircle, label: "Messages", path: "/designer-messages" },
  { icon: MoreHorizontal, label: "More", path: "/more" },
];

const clientNav: NavItem[] = [
  { icon: Home, label: "Home", path: "/client-home" },
  { icon: Compass, label: "Discover", path: "/discover" },
  { icon: Clapperboard, label: "Showcase", path: "/showcase", isCenter: true },
  { icon: ShoppingBag, label: "Orders", path: "/client-orders" },
  { icon: User, label: "Profile", path: "/profile" },
];

const workerNav: NavItem[] = [
  { icon: Home, label: "Home", path: "/worker-dashboard" },
  { icon: ClipboardList, label: "Tasks", path: "/worker-tasks" },
  { icon: Ruler, label: "Measure", path: "/worker-measurements", isCenter: true },
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
  const centerItem = navItems.find((i) => i.isCenter);
  const sideItems = navItems.filter((i) => !i.isCenter);
  const half = sideItems.length / 2;
  const leftItems = sideItems.slice(0, half);
  const rightItems = sideItems.slice(half);
  const CenterIcon = centerItem?.icon ?? Plus;

  const renderItem = (item: NavItem) => {
    const isActive = location.pathname === item.path;
    return (
      <motion.button
        key={item.path}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate(item.path)}
        className="relative flex flex-col items-center gap-1 py-1 px-2 min-w-[56px]"
      >
        <item.icon
          className={`w-6 h-6 transition-colors duration-200 ${
            isActive ? "text-foreground" : "text-muted-foreground/60"
          }`}
          strokeWidth={isActive ? 2.5 : 2}
        />
        <span
          className={`text-[11px] transition-colors duration-200 ${
            isActive ? "text-foreground font-bold" : "text-muted-foreground/60 font-medium"
          }`}
        >
          {item.label}
        </span>
      </motion.button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom pointer-events-none">
      <div className="relative max-w-md mx-auto">
        {/* Curved/notched bar */}
        <div className="nav-curved pointer-events-auto h-[78px] flex items-end">
          <div className="flex w-full items-end pb-3 px-2">
            <div className="flex flex-1 items-end justify-around">
              {leftItems.map(renderItem)}
            </div>
            {/* Spacer reserving notch area */}
            <div className="w-[84px] shrink-0" aria-hidden="true" />
            <div className="flex flex-1 items-end justify-around">
              {rightItems.map(renderItem)}
            </div>
          </div>
        </div>

        {/* Floating center brand button */}
        {centerItem && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.04 }}
            onClick={() => navigate(centerItem.path)}
            aria-label={centerItem.label}
            className="pointer-events-auto absolute left-1/2 -translate-x-1/2 -top-7 z-10 flex items-center justify-center w-[72px] h-[72px] rounded-full bg-primary shadow-[0_12px_28px_-6px_hsl(var(--primary)/0.55),0_4px_10px_-2px_hsl(0_0%_0%/0.35),inset_0_1px_0_0_hsl(var(--primary-foreground)/0.25)] transition-shadow"
          >
            <CenterIcon className="w-8 h-8 text-primary-foreground" strokeWidth={2.4} />
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default BottomNav;
