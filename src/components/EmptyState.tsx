import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    className="flex flex-col items-center justify-center text-center py-16 px-6"
  >
    <div className="w-16 h-16 rounded-2xl bg-secondary/60 flex items-center justify-center mb-4">
      <Icon className="w-7 h-7 text-muted-foreground" />
    </div>
    <p className="text-sm font-semibold text-foreground">{title}</p>
    {description && (
      <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">{description}</p>
    )}
    {action && (
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={action.onClick}
        className="mt-5 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
      >
        {action.label}
      </motion.button>
    )}
  </motion.div>
);

export default EmptyState;