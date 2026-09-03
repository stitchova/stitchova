import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { DesktopOnly, WorkspaceHeader, StatCards } from "./DesktopKit";

export interface InsightItem {
  icon: LucideIcon;
  title: string;
  confidence: number;
  description: string;
  action: string;
  route: string;
  color: string;
}

interface Props {
  insights: InsightItem[];
  onAction: (insight: InsightItem) => void;
}

/**
 * Tablet/desktop workspace for the AI Insights page. Reuses the page's data
 * and handlers — only the layout differs (wide, centered, multi-column grid).
 */
const AIInsightsWorkspace = ({ insights, onAction }: Props) => {
  const avg = Math.round(insights.reduce((s, i) => s + i.confidence, 0) / (insights.length || 1));

  return (
    <DesktopOnly>
      <div className="mx-auto max-w-[1200px]">
        <WorkspaceHeader title="AI Insights" subtitle="Smart predictions for your business" />
        <StatCards
          stats={[
            { label: "Predictions", value: "24", hint: "This month" },
            { label: "Avg confidence", value: `${avg}%`, hint: "Across latest insights" },
            { label: "Recommended actions", value: String(insights.length), hint: "Ready to act on" },
          ]}
        />

        <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
          {insights.map((insight, i) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="solid-panel p-5 flex flex-col gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <insight.icon className={`w-5 h-5 ${insight.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{insight.title}</p>
                    <span className="text-[11px] font-bold text-primary">{insight.confidence}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{insight.description}</p>
                </div>
              </div>
              <div className="mt-auto space-y-3">
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${insight.confidence}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onAction(insight)}
                  className="w-full py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/15 transition-colors"
                >
                  {insight.action} →
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DesktopOnly>
  );
};

export default AIInsightsWorkspace;
