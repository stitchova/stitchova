import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Ruler, Package, MessageCircle } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import Logo from "@/components/Logo";
import { CURRENT_WORKER } from "@/lib/workers";
import { cn } from "@/lib/utils";

const items = [
  { label: "Overview", path: "/worker-dashboard", icon: LayoutDashboard },
  { label: "My Tasks", path: "/worker-tasks", icon: ClipboardList },
  { label: "Measurements", path: "/worker-measurements", icon: Ruler },
  { label: "Materials", path: "/worker-materials", icon: Package },
  { label: "Messages", path: "/workshop-chat", icon: MessageCircle },
];

const hiddenPaths = ["/onboarding", "/auth", "/set-passcode", "/.lovable/oauth/consent"];

/**
 * Worker-only top navigation for tablet/desktop widths. Mirrors the designer
 * pattern but with the smaller worker permission set. Hidden on mobile.
 */
const WorkerTopNav = () => {
  const { role } = useRole();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (role !== "worker" || hiddenPaths.includes(pathname)) return null;

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <header className="hidden lg:block sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1440px] px-6 xl:px-8 h-16 grid grid-cols-[auto_1fr_auto] items-center gap-4">
        <button onClick={() => navigate("/worker-dashboard")} className="flex items-center justify-self-start shrink-0">
          <Logo size={32} animated={false} />
        </button>
        <nav className="flex items-center gap-1 rounded-full solid-panel p-1 justify-self-center max-w-full overflow-x-auto scrollbar-hide">
          {items.map((item) => {
            const active = isActive(item.path);
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                title={item.label}
                className={cn(
                  "relative flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 xl:px-4 py-2 text-xs font-semibold leading-none transition-colors",
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                )}>
                {active && (
                  <motion.div layoutId="workerTopNavPill" className="absolute inset-0 rounded-full bg-primary glow-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                )}
                <item.icon className="w-4 h-4 relative z-10 shrink-0" strokeWidth={active ? 2.4 : 2} />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <button onClick={() => navigate("/worker-profile")}
          aria-label="Worker profile"
          className="justify-self-end w-9 h-9 shrink-0 rounded-full p-[2px] transition-transform hover:scale-105"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>
          <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
            <span className="text-[10px] font-bold text-foreground">{CURRENT_WORKER.avatar}</span>
          </div>
        </button>
      </div>
    </header>
  );
};

export default WorkerTopNav;
