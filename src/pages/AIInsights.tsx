import { motion } from "framer-motion";
import { ArrowLeft, Brain, TrendingUp, Users, Clock, Sparkles, Target, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FeatureGate from "@/components/FeatureGate";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

const insights = [
  {
    icon: Target, title: "Body Measurement Prediction", confidence: 92,
    description: "Ama Serwaa's waist measurement likely increased by 0.5\" based on seasonal patterns.",
    action: "Review measurement", color: "text-primary",
  },
  {
    icon: Users, title: "Client Return Likelihood", confidence: 87,
    description: "Kofi Mensah has 87% chance of placing a new order within 2 weeks based on past behavior.",
    action: "Send follow-up", color: "text-status-completed",
  },
  {
    icon: Sparkles, title: "Best Worker Match", confidence: 95,
    description: "Tunde A. is the best match for bridal gown orders — 95% quality score on similar jobs.",
    action: "Assign to order", color: "text-primary",
  },
  {
    icon: Clock, title: "Production Time Estimate", confidence: 78,
    description: "Current Wedding Gown order is estimated to take 12 more days based on task completion rate.",
    action: "View timeline", color: "text-status-sewing",
  },
  {
    icon: TrendingUp, title: "Cost Prediction", confidence: 84,
    description: "Fabric costs are trending up 8% this quarter. Consider bulk purchasing lace materials.",
    action: "View report", color: "text-status-cutting",
  },
  {
    icon: Zap, title: "Worker Performance Alert", confidence: 90,
    description: "Kwesi B. has improved finishing speed by 23% this month — consider bonus or promotion.",
    action: "View worker", color: "text-status-completed",
  },
];

const AIInsights = () => {
  const navigate = useNavigate();

  return (
    <FeatureGate requiredPlan="pro" feature="AI Insights">
      <div className="min-h-screen bg-background pb-24">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/50">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" /> AI Insights
            </h1>
            <p className="text-[11px] text-muted-foreground">Smart predictions for your business</p>
          </div>
        </div>

        <div className="px-5 pt-4 space-y-4">
          {/* Summary Cards */}
          <motion.div {...fadeUp} className="grid grid-cols-3 gap-3">
            {[
              { label: "Predictions", value: "24", sub: "This month" },
              { label: "Accuracy", value: "89%", sub: "Avg confidence" },
              { label: "Actions", value: "6", sub: "Recommended" },
            ].map((s) => (
              <div key={s.label} className="card-glass p-3 text-center">
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
                <p className="text-[9px] text-primary mt-0.5">{s.sub}</p>
              </div>
            ))}
          </motion.div>

          {/* Insight Cards */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Latest Insights</p>
            {insights.map((insight, i) => (
              <motion.div key={insight.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }} className="card-glass p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <insight.icon className={`w-5 h-5 ${insight.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{insight.title}</p>
                      <span className="text-[10px] font-bold text-primary">{insight.confidence}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="w-full bg-secondary rounded-full h-1.5 mr-3">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${insight.confidence}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full bg-primary rounded-full" />
                  </div>
                  <motion.button whileTap={{ scale: 0.95 }}
                    className="text-[10px] text-primary font-semibold whitespace-nowrap">
                    {insight.action} →
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </FeatureGate>
  );
};

export default AIInsights;
