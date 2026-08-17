import { ReactNode } from "react";
import { motion } from "framer-motion";
import { LucideIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared tablet/desktop building blocks for the DESIGNER-facing workspaces.
 * Everything here renders only from `lg` upwards — the mobile app view is
 * untouched and continues to render below that breakpoint.
 */

export const DesktopOnly = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("hidden lg:block px-8 pt-6 pb-16", className)}>{children}</div>
);

/* ---------------------------------------------------------------- header */

interface WorkspaceHeaderProps {
  title: string;
  subtitle?: string;
  tabs?: readonly string[];
  activeTab?: string;
  onTab?: (t: string) => void;
  pillId?: string;
  query?: string;
  onQuery?: (v: string) => void;
  searchPlaceholder?: string;
  action?: { label: string; icon?: LucideIcon; onClick: () => void };
}

export const WorkspaceHeader = ({
  title, subtitle, tabs, activeTab, onTab, pillId = "wsPill",
  query, onQuery, searchPlaceholder = "Search…", action,
}: WorkspaceHeaderProps) => {
  const ActionIcon = action?.icon;
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div>
        <h1 className="text-3xl font-bold shimmer-text leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {tabs && tabs.length > 0 && (
        <nav className="ml-6 flex items-center gap-1 rounded-full frost-card p-1.5">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => onTab?.(t)}
              className={cn(
                "relative px-5 py-2 rounded-full text-xs font-semibold transition-colors",
                activeTab === t ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {activeTab === t && (
                <motion.div layoutId={pillId} className="absolute inset-0 rounded-full bg-primary glow-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }} />
              )}
              <span className="relative z-10">{t}</span>
            </button>
          ))}
        </nav>
      )}
      <div className="ml-auto flex items-center gap-3">
        {onQuery && (
          <div className="flex items-center gap-2 glass-input px-4 py-2.5 w-64">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder={searchPlaceholder}
              className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground flex-1 outline-none" />
          </div>
        )}
        {action && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={action.onClick}
            className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold px-5 py-3 glow-primary">
            {ActionIcon && <ActionIcon className="w-4 h-4" />} {action.label}
          </motion.button>
        )}
      </div>
    </div>
  );
};

/* ----------------------------------------------------------- stat cards */

export interface StatCard { label: string; value: string; hint?: string }

export const StatCards = ({ stats }: { stats: StatCard[] }) => (
  <div className={cn("grid gap-5 mt-6", stats.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
    {stats.map((s) => (
      <div key={s.label} className="frost-card p-5">
        <p className="text-xs text-muted-foreground">{s.label}</p>
        <p className="text-2xl font-bold text-foreground mt-2">{s.value}</p>
        {s.hint && <p className="text-[11px] text-muted-foreground mt-1">{s.hint}</p>}
      </div>
    ))}
  </div>
);

/* --------------------------------------------------------- status pills */

export type PillTone = "neutral" | "primary" | "success" | "warning" | "info" | "danger";

const toneClass: Record<PillTone, string> = {
  neutral: "bg-secondary text-muted-foreground",
  primary: "bg-primary/15 text-primary",
  success: "bg-status-completed/15 text-status-completed",
  warning: "bg-status-cutting/15 text-status-cutting",
  info: "bg-status-sewing/15 text-status-sewing",
  danger: "bg-destructive/15 text-destructive",
};

export const StatusPill = ({ label, tone = "neutral", className }: { label: string; tone?: PillTone; className?: string }) => (
  <span className={cn("text-[9px] font-semibold px-2 py-1 rounded-full whitespace-nowrap", toneClass[tone], className)}>
    {label}
  </span>
);

/* -------------------------------------------------------- list + detail */

export const ListDetail = ({ list, detail }: { list: ReactNode; detail: ReactNode }) => (
  <div className="mt-6 rounded-3xl card-elevated p-5 grid grid-cols-[minmax(320px,380px)_1fr] gap-5 items-start">
    <div className="space-y-2">{list}</div>
    {detail}
  </div>
);

export const ListPanel = ({ title, count, children }: { title: string; count: number; children: ReactNode }) => (
  <>
    <p className="text-xs font-semibold text-foreground px-1 pb-1">
      {title} <span className="text-muted-foreground font-normal">({count})</span>
    </p>
    <div className="space-y-2 max-h-[620px] overflow-y-auto scrollbar-hide pr-1">{children}</div>
  </>
);

interface ListRowProps {
  active: boolean;
  onClick: () => void;
  title: string;
  meta: string;
  pill?: { label: string; tone?: PillTone };
  leading?: ReactNode;
  trailing?: string;
}

export const ListRow = ({ active, onClick, title, meta, pill, leading, trailing }: ListRowProps) => (
  <button onClick={onClick}
    className={cn("w-full text-left rounded-2xl p-3 flex items-center gap-3 transition-colors border",
      active ? "bg-primary/10 border-primary/40" : "bg-card/60 border-border/40 hover:bg-card")}>
    {leading}
    <div className="min-w-0 flex-1">
      <p className="text-xs font-semibold text-foreground truncate">{title}</p>
      <p className="text-[11px] text-muted-foreground truncate">{meta}</p>
    </div>
    {pill && <StatusPill label={pill.label} tone={pill.tone} />}
    {trailing && <span className="text-[11px] font-semibold text-foreground whitespace-nowrap">{trailing}</span>}
  </button>
);

export const Avatar = ({ initials }: { initials: string }) => (
  <div className="w-10 h-10 rounded-full p-[2px] flex-shrink-0"
    style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>
    <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
      <span className="text-[10px] font-bold text-primary">{initials}</span>
    </div>
  </div>
);

export const DetailPanel = ({ id, children }: { id: string; children: ReactNode }) => (
  <motion.div key={id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    className="rounded-3xl bg-card/70 border border-border/40 p-6 space-y-5">
    {children}
  </motion.div>
);

export const DetailHeader = ({
  eyebrow, title, pill, subtitle, right, actions,
}: {
  eyebrow: string; title: string; pill?: { label: string; tone?: PillTone };
  subtitle?: string; right?: { label: string; value: string; hint?: string }; actions?: ReactNode;
}) => (
  <div className="flex items-start justify-between gap-6">
    <div>
      <p className="text-[11px] text-muted-foreground">{eyebrow}</p>
      <div className="flex items-center gap-3 mt-1">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        {pill && <StatusPill label={pill.label} tone={pill.tone} className="text-[10px] px-2.5" />}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
    {right && (
      <div className="text-right">
        <p className="text-[11px] text-muted-foreground">{right.label}</p>
        <p className="text-sm font-semibold text-foreground mt-1">{right.value}</p>
        {right.hint && <p className="text-[11px] text-muted-foreground">{right.hint}</p>}
      </div>
    )}
    {actions}
  </div>
);

export const InfoGrid = ({ blocks, cols = 4 }: { blocks: { label: string; value: string }[]; cols?: 3 | 4 }) => (
  <div className={cn("grid gap-3", cols === 3 ? "grid-cols-3" : "grid-cols-4")}>
    {blocks.map((b) => (
      <div key={b.label} className="rounded-2xl bg-secondary/50 border border-border/30 p-4">
        <p className="text-[10px] text-muted-foreground">{b.label}</p>
        <p className="text-sm font-semibold text-foreground mt-1.5 leading-snug">{b.value}</p>
      </div>
    ))}
  </div>
);

export const SummaryBar = ({ items, children }: { items: { label: string; value: string; accent?: boolean }[]; children?: ReactNode }) => (
  <div className="rounded-2xl bg-secondary/40 border border-border/30 p-5 flex items-center justify-between">
    <div className="flex gap-10">
      {items.map((i) => (
        <div key={i.label}>
          <p className="text-[10px] text-muted-foreground">{i.label}</p>
          <p className={cn("text-sm font-bold mt-1", i.accent ? "text-primary" : "text-foreground")}>{i.value}</p>
        </div>
      ))}
    </div>
    {children}
  </div>
);

export const SectionCard = ({ title, children, className }: { title: string; children: ReactNode; className?: string }) => (
  <div className={cn("rounded-2xl bg-secondary/30 border border-border/30 p-5", className)}>
    <p className="text-xs font-semibold text-foreground mb-3">{title}</p>
    {children}
  </div>
);
