import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Shared production-stage tracker used by both the worker task card and the
// designer's OrderDetail screen. Same visual language (numbered circles +
// connector lines) — tap a stage to jump to it. Parent decides whether the
// transition is allowed (photo requirement, undo, notifications, etc.).
interface Props {
  stages: string[];
  currentIdx: number;
  onSelect?: (idx: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

export const StageTracker = ({ stages, currentIdx, onSelect, disabled, size = "md" }: Props) => {
  const circle = size === "sm" ? "w-6 h-6 text-[8px]" : "w-7 h-7 text-[10px]";
  const label = size === "sm" ? "text-[8px]" : "text-[9px]";
  return (
    <div>
      <div className="flex items-center gap-0">
        {stages.map((s, i) => {
          const done = i < currentIdx;
          const current = i === currentIdx;
          const active = done || current;
          const clickable = !!onSelect && !disabled;
          return (
            <div key={s} className="flex items-center flex-1">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onSelect?.(i)}
                aria-label={`Set stage to ${s}`}
                className={cn(
                  "rounded-full flex items-center justify-center font-bold flex-shrink-0 transition-all border-2",
                  circle,
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-muted-foreground border-border",
                  clickable && "cursor-pointer hover:ring-2 hover:ring-primary/40",
                  !clickable && "cursor-default"
                )}
              >
                {current ? (
                  <motion.span
                    animate={{ scale: [1, 1.18, 1] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                  >
                    {i + 1}
                  </motion.span>
                ) : (
                  <span>{done ? "✓" : i + 1}</span>
                )}
              </button>
              {i < stages.length - 1 && (
                <div className={cn("flex-1 h-0.5 mx-1", i < currentIdx ? "bg-primary" : "bg-border")} />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        {stages.map((s, i) => (
          <span
            key={s}
            className={cn(
              "flex-1 text-center leading-tight",
              label,
              i <= currentIdx ? "text-primary font-semibold" : "text-muted-foreground"
            )}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
};

export default StageTracker;