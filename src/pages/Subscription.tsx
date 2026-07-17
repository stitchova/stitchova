import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Crown, Zap, Star, Sparkles, Rocket, ShieldCheck, X } from "lucide-react";
import { useSubscription, PlanTier } from "@/contexts/SubscriptionContext";
import { toast } from "@/hooks/use-toast";
import { Spinner } from "@/components/Spinner";

const plans: {
  tier: PlanTier;
  name: string;
  icon: typeof Crown;
  monthlyPrice: number;
  yearlyPrice: number;
  popular: boolean;
  color: string;
  features: string[];
  limits: string[];
}[] = [
  {
    tier: "basic",
    name: "Basic",
    icon: Zap,
    monthlyPrice: 0,
    yearlyPrice: 0,
    popular: false,
    color: "text-muted-foreground",
    features: [
      "Up to 20 clients",
      "Up to 10 orders/month",
      "Basic measurements",
      "Standard support",
    ],
    limits: [
      "No analytics dashboard",
      "No worker management",
      "No AI insights",
      "No marketplace priority",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    icon: Star,
    monthlyPrice: 49,
    yearlyPrice: 470,
    popular: true,
    color: "text-primary",
    features: [
      "Unlimited clients",
      "Unlimited orders",
      "Full measurement system",
      "Worker management",
      "Analytics dashboard",
      "Basic AI insights",
      "Automated client SMS + email",
      "Priority support",
    ],
    limits: [
      "No scheduled / recurring notifications",
      "No marketplace priority",
      "No branding customization",
    ],
  },
  {
    tier: "premium",
    name: "Premium",
    icon: Crown,
    monthlyPrice: 99,
    yearlyPrice: 950,
    popular: false,
    color: "text-primary",
    features: [
      "Everything in Pro",
      "Marketplace priority visibility",
      "Advanced AI insights",
      "Branding customization",
      "Scheduled & recurring notifications",
      "Higher client reach",
      "Dedicated account manager",
      "Custom integrations",
    ],
    limits: [
      "Messages sent from platform sender",
    ],
  },
  {
    tier: "premium_plus",
    name: "Premium+",
    icon: Rocket,
    monthlyPrice: 179,
    yearlyPrice: 1720,
    popular: false,
    color: "text-primary",
    features: [
      "Everything in Premium",
      "Sent in your brand name (not platform)",
      "Fully branded transactional messages",
      "Auto stage updates (cutting → ready)",
      "Order completed & received alerts",
      "Appointment & payment reminders",
      "Downloadable message previews",
    ],
    limits: [],
  },
];

const Subscription = () => {
  const navigate = useNavigate();
  const { plan: currentPlan, setPlan } = useSubscription();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const savingsPercent = 20;

  const handleSelectPlan = (tier: PlanTier) => {
    if (tier === currentPlan) return;
    setSelectedPlan(tier);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!selectedPlan || confirming) return;
    setConfirming(true);
    // Simulate a brief payment-plan switch confirmation so the button shows feedback.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setPlan(selectedPlan);
    toast({
      title: "Plan Updated! 🎉",
      description: `You're now on the ${plans.find(p => p.tier === selectedPlan)?.name} plan.`,
    });
    setConfirming(false);
    setShowConfirm(false);
    setTimeout(() => navigate(-1), 800);
  };

  const closeConfirm = () => {
    if (confirming) return;
    setShowConfirm(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Choose Your Plan</h1>
          <p className="text-xs text-muted-foreground">Unlock the full power of Stitchova</p>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-center gap-1 p-1 rounded-xl bg-card">
          <button
            onClick={() => setBilling("monthly")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${billing === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${billing === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Yearly
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${billing === "yearly" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/20 text-primary"}`}>
              Save {savingsPercent}%
            </span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="px-5 space-y-4">
        {plans.map((p, i) => {
          const price = billing === "monthly" ? p.monthlyPrice : p.yearlyPrice;
          const isCurrent = p.tier === currentPlan;
          return (
            <motion.div
              key={p.tier}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl overflow-hidden ${p.popular ? "ring-2 ring-primary" : ""}`}
            >
              {p.popular && (
                <div className="bg-primary text-primary-foreground text-[10px] font-bold text-center py-1.5 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" /> MOST POPULAR
                </div>
              )}
              <div className="card-surface p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center`}>
                      <p.icon className={`w-5 h-5 ${p.color}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{p.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-foreground">
                          {price === 0 ? "Free" : `GHS ${price}`}
                        </span>
                        {price > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            /{billing === "monthly" ? "mo" : "yr"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-primary/20 text-primary">
                      Current
                    </span>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  {p.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-primary" />
                      </div>
                      <span className="text-xs text-foreground">{f}</span>
                    </div>
                  ))}
                  {p.limits.map((l) => (
                    <div key={l} className="flex items-center gap-2 opacity-40">
                      <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-[8px] text-muted-foreground">✕</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{l}</span>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectPlan(p.tier)}
                  disabled={isCurrent}
                  className={`w-full py-3 rounded-xl text-xs font-semibold transition-all ${
                    isCurrent
                      ? "bg-secondary text-muted-foreground cursor-default"
                      : p.popular
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {isCurrent ? "Current Plan" : p.monthlyPrice === 0 ? "Downgrade" : "Select Plan"}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/85 backdrop-blur-md z-[60] flex items-center justify-center p-5"
            onClick={closeConfirm}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm bg-card rounded-3xl border border-border/60 shadow-2xl overflow-hidden"
            >
              {/* Decorative top glow */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

              {/* Close */}
              <button
                onClick={closeConfirm}
                disabled={confirming}
                className="absolute top-4 right-4 p-2 rounded-full bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 pb-4">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto ring-1 ring-primary/20">
                    {(() => {
                      const Icon = plans.find(p => p.tier === selectedPlan)?.icon || Crown;
                      return <Icon className="w-8 h-8 text-primary" />;
                    })()}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
                      Confirm Subscription
                    </p>
                    <h3 className="text-xl font-bold text-foreground">
                      {plans.find(p => p.tier === selectedPlan)?.name} Plan
                    </h3>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs font-medium text-muted-foreground">
                    <span className="capitalize">{billing}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                    <span className="text-foreground font-semibold">
                      {billing === "monthly"
                        ? `GHS ${plans.find(p => p.tier === selectedPlan)?.monthlyPrice}/mo`
                        : `GHS ${plans.find(p => p.tier === selectedPlan)?.yearlyPrice}/yr`}
                    </span>
                  </div>
                </div>

                {/* Plan summary */}
                <div className="mt-6 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Included</p>
                  <ul className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {plans.find(p => p.tier === selectedPlan)?.features.slice(0, 5).map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-xs text-foreground">
                        <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-primary" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Trust badge */}
                <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>Secure checkout &bull; Cancel anytime</span>
                </div>
              </div>

              {/* Sticky action footer */}
              <div className="p-5 pt-0">
                <div className="flex gap-3">
                  <motion.button
                    whileTap={confirming ? undefined : { scale: 0.97 }}
                    onClick={closeConfirm}
                    disabled={confirming}
                    className="flex-1 py-3.5 rounded-xl bg-secondary text-foreground text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={confirming ? undefined : { scale: 0.97 }}
                    onClick={handleConfirm}
                    disabled={confirming}
                    className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/25 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {confirming ? (
                      <>
                        <Spinner className="w-3.5 h-3.5" />
                        Processing…
                      </>
                    ) : (
                      "Confirm"
                    )}
                  </motion.button>
                </div>
                <p className="text-center text-[10px] text-muted-foreground mt-3">
                  By confirming, you agree to the selected billing cycle.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Subscription;
