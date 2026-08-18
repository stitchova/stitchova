import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, ShoppingBag, Compass, MessageCircle, User } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", path: "/client-home", icon: Home },
  { label: "My Orders", path: "/client-orders", icon: ShoppingBag },
  { label: "Discover", path: "/discover", icon: Compass },
  { label: "Messages", path: "/messages", icon: MessageCircle },
];

const hiddenPaths = ["/onboarding", "/auth", "/set-passcode", "/.lovable/oauth/consent"];

/**
 * Client-only top navigation for tablet/desktop widths. Same structural
 * pattern as DesignerTopNav / WorkerTopNav — replaces the mobile bottom tab
 * bar from `lg` upwards, hidden entirely on mobile and for other roles.
 */
const ClientTopNav = () => {
  const { role } = useRole();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (role !== "client" || hiddenPaths.includes(pathname)) return null;

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  return (
    <header className="hidden lg:block sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1440px] px-8 h-16 grid grid-cols-[1fr_auto_1fr] items-center gap-6">
        <button onClick={() => navigate("/client-home")} className="flex items-center justify-self-start">
          <Logo size={32} animated={false} />
        </button>
        <nav className="flex items-center justify-center gap-1 rounded-full solid-panel p-1.5">
          {items.map((item) => {
            const active = isActive(item.path);
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={cn("relative px-4 py-2 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5",
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                {active && (
                  <motion.div layoutId="clientTopNavPill" className="absolute inset-0 rounded-full bg-primary glow-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                )}
                <item.icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <button onClick={() => navigate("/profile")}
          className="justify-self-end w-9 h-9 rounded-full p-[2px]"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>
          <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
            <User className="w-4 h-4 text-foreground" />
          </div>
        </button>
      </div>
    </header>
  );
};

export default ClientTopNav;
