import { createContext, useContext, useState, ReactNode } from "react";

export type PlanTier = "basic" | "pro" | "premium" | "premium_plus";

interface SubscriptionContextType {
  plan: PlanTier;
  setPlan: (plan: PlanTier) => void;
  isFeatureAvailable: (feature: string) => boolean;
  expiryDate: string;
}

const featureAccess: Record<PlanTier, string[]> = {
  basic: ["clients_5", "orders_10", "measurements"],
  pro: ["clients_unlimited", "orders_unlimited", "measurements", "analytics", "workers", "ai_basic"],
  premium: ["clients_unlimited", "orders_unlimited", "measurements", "analytics", "workers", "ai_advanced", "marketplace_priority", "branding"],
  premium_plus: ["clients_unlimited", "orders_unlimited", "measurements", "analytics", "workers", "ai_advanced", "marketplace_priority", "branding", "client_comms", "auto_notifications", "scheduled_notifications"],
};

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [plan, setPlanState] = useState<PlanTier>(
    () => (localStorage.getItem("fashionos-plan") as PlanTier) || "basic"
  );

  const setPlan = (newPlan: PlanTier) => {
    setPlanState(newPlan);
    localStorage.setItem("fashionos-plan", newPlan);
  };

  const isFeatureAvailable = (feature: string) => featureAccess[plan].includes(feature);

  return (
    <SubscriptionContext.Provider value={{ plan, setPlan, isFeatureAvailable, expiryDate: "Apr 30, 2026" }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
};
