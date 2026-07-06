import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription, PlanTier } from "@/contexts/SubscriptionContext";

interface FeatureGateProps {
  requiredPlan: PlanTier;
  feature: string;
  children: React.ReactNode;
}

const planHierarchy: Record<PlanTier, number> = { basic: 0, pro: 1, premium: 2, premium_plus: 3 };
const planLabels: Record<PlanTier, string> = { basic: "Basic", pro: "Pro", premium: "Premium", premium_plus: "Premium+" };

const FeatureGate = ({ requiredPlan, feature, children }: FeatureGateProps) => {
  const { plan } = useSubscription();
  const navigate = useNavigate();
  const hasAccess = planHierarchy[plan] >= planHierarchy[requiredPlan];

  if (hasAccess) return <>{children}</>;

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none opacity-50">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-2xl z-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-3 p-6 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Upgrade to {planLabels[requiredPlan]}
          </p>
          <p className="text-xs text-muted-foreground max-w-[200px]">
            {feature} is available on the {planLabels[requiredPlan]} plan and above.
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/subscription")}
            className="mt-1 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
          >
            Upgrade Now
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default FeatureGate;
