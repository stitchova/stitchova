import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ShoppingBag, Users, Ruler, Wallet, HardHat, MessageCircle, MoreHorizontal,
} from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";

const items = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Orders", path: "/orders", icon: ShoppingBag },
  { label: "Clients", path: "/clients", icon: Users },
  { label: "Measurements", path: "/measurements", icon: Ruler },
  { label: "Payments", path: "/payments", icon: Wallet },
  { label: "Workers", path: "/workers", icon: HardHat },
  { label: "Workshop", path: "/workshop-chat", icon: MessageCircle },
  { label: "More", path: "/more", icon: MoreHorizontal },
];

const hiddenPaths = ["/onboarding", "/auth", "/set-passcode", "/.lovable/oauth/consent"];

/**
 * Designer-only top navigation for tablet/desktop widths. Replaces the mobile
 * bottom tab bar from `lg` upwards; hidden entirely on mobile and for the
 * client / worker roles.
 */
const DesignerTopNav = () => {
  const { role } = useRole();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (role !== "designer" || hiddenPaths.includes(pathname)) return null;

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);

  return (
    <header className="hidden lg:block sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1440px] px-8 h-16 flex items-center gap-6">
        <button onClick={() => navigate("/")} className="flex items-center">
          <Logo size={32} animated={false} />
        </button>
        <nav className="flex items-center gap-1 rounded-full frost-card p-1.5">
          {items.map((item) => {
            const active = isActive(item.path);
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={cn("relative px-4 py-2 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5",
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                {active && (
                  <motion.div layoutId="designerTopNavPill" className="absolute inset-0 rounded-full bg-primary glow-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                )}
                <item.icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <button onClick={() => navigate("/profile")}
          className="ml-auto w-9 h-9 rounded-full p-[2px]"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>
          <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
            <span className="text-[10px] font-bold text-foreground">JA</span>
          </div>
        </button>
      </div>
    </header>
  );
};

export default DesignerTopNav;
