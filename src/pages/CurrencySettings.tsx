import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Coins } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";

const CurrencySettings = () => {
  const navigate = useNavigate();
  const { code, currencies, setCurrency, format } = useCurrency();

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-5 pt-6 pb-4 flex items-center gap-3 border-b border-border/40">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Currency</h1>
          <p className="text-[11px] text-muted-foreground">Used across orders, invoices & analytics</p>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-4">
        <div className="frost-card p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Coins className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Preview</p>
            <p className="text-xl font-bold text-gradient-gold">{format(12450)}</p>
          </div>
        </div>

        <div className="space-y-2">
          {currencies.map((c, i) => {
            const active = c.code === code;
            return (
              <motion.button
                key={c.code}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setCurrency(c.code);
                  toast.success(`Currency set to ${c.code}`, { description: c.label });
                }}
                className={cn(
                  "w-full p-4 rounded-2xl border flex items-center gap-3 text-left transition-colors",
                  active
                    ? "border-primary/60 bg-primary/10"
                    : "border-border/50 bg-card/60 hover:bg-card",
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-foreground">{c.symbol}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {c.code} <span className="text-muted-foreground font-normal">· {c.label}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">Example: {`${c.symbol}12,450`}</p>
                </div>
                {active && <Check className="w-4 h-4 text-primary" />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CurrencySettings;
