import { Home, Users, ShoppingBag, MoreHorizontal, Plus, Compass, User, MessageCircle, ClipboardList, Ruler, Package, UserCircle, Clapperboard } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useRole } from "@/contexts/RoleContext";
import { useBottomNavLayout, type BottomNavItem } from "@/hooks/useBottomNavLayout";

type NavItem = BottomNavItem;

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

const hiddenPaths = [
  "/onboarding",
  "/auth",
  "/set-passcode",
  "/messages",
  "/designer-messages",
  "/.lovable/oauth/consent",
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useRole();

  const navItems = role === "designer" ? designerNav : role === "worker" ? workerNav : clientNav;
  const isHidden =
    hiddenPaths.includes(location.pathname) ||
    location.pathname.startsWith("/designer/") ||
    location.pathname.startsWith("/workshop-chat/") ||
    location.pathname === "/showcase/new";
  const { leftSlots, rightSlots, centerItem, CenterIcon, containerStyle, navStyle, gridStyle, fabStyle } =
    useBottomNavLayout(navItems);

  if (isHidden) return null;

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

  const renderSlot = (item: NavItem | null, key: string) => {
    if (!item) {
      return <div key={key} aria-hidden="true" className="h-[52px]" />;
    }

    return renderItem(item);
  };

  return (
    <div
      className="pointer-events-none fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2"
      style={{ ...containerStyle, ...navStyle }}
    >
      <div className="relative w-full">
        <div className="nav-curved pointer-events-auto flex h-[var(--bottom-nav-bar-height)] items-end overflow-hidden">
          <div className="grid w-full items-end px-2 pb-3" style={gridStyle}>
            <div className="grid min-w-0 grid-cols-2 items-end gap-1">
              {leftSlots.map((item, index) => renderSlot(item, `left-${index}`))}
            </div>
            <div aria-hidden="true" />
            <div className="grid min-w-0 grid-cols-2 items-end gap-1">
              {rightSlots.map((item, index) => renderSlot(item, `right-${index}`))}
            </div>
          </div>
        </div>
      </div>

      {centerItem && (
        <div
          aria-hidden={false}
          style={{
            position: "absolute",
            ...fabStyle,
            transform: "translate3d(-50%, 0, 0)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            willChange: "transform",
          }}
          className="pointer-events-none z-10 rounded-full"
        >
          <div className="pointer-events-none absolute inset-[-10px] rounded-full border border-primary/25 bg-primary/10 blur-[2px]" aria-hidden="true" />
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            onClick={() => navigate(centerItem.path)}
            aria-label={centerItem.label}
            style={{ transformOrigin: "center center" }}
            className="pointer-events-auto relative flex h-full w-full items-center justify-center rounded-full bg-primary shadow-[0_16px_34px_-8px_hsl(var(--primary)/0.58),0_6px_14px_-4px_hsl(0_0%_0%/0.38),inset_0_1px_0_0_hsl(var(--primary-foreground)/0.28)] ring-1 ring-primary-foreground/20 transition-shadow"
          >
            <CenterIcon className="w-8 h-8 text-primary-foreground" strokeWidth={2.4} />
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default BottomNav;
