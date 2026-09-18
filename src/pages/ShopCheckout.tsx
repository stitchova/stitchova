import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShieldCheck, Loader2, CheckCircle2, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useShop } from "@/contexts/ShopContext";
import { formatMoney } from "@/lib/currency";
import { toast } from "sonner";

/**
 * MOCK CHECKOUT. The "Pay Now" button below simulates redirecting to
 * Paystack and waiting for a verified callback (see ShopContext.checkout).
 * No real payment is processed and no real Paystack integration exists
 * here yet — see the comments in ShopContext.tsx for exactly what a
 * developer needs to replace this with.
 */

const ShopCheckout = () => {
  const navigate = useNavigate();
  const { cart, products, cartTotal, checkout } = useShop();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [processing, setProcessing] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const lines = cart.map((c) => ({ ...c, product: products.find((p) => p.id === c.productId) })).filter((l) => l.product);
  const designerId = lines[0]?.product?.designerId ?? "";
  const canPay = name.trim() && phone.trim() && address.trim() && lines.length > 0;

  const handlePay = async () => {
    if (!canPay) { toast.error("Fill in your delivery details first."); return; }
    setProcessing(true);
    const order = await checkout(name, designerId);
    setProcessing(false);
    setReference(order.reference);
  };

  if (reference) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-full bg-status-completed/15 flex items-center justify-center mb-5">
          <CheckCircle2 className="w-10 h-10 text-status-completed" />
        </motion.div>
        <h1 className="text-xl font-bold text-foreground">Payment successful</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          Your order has been placed. The designer will start preparing it for delivery.
        </p>
        <div className="mt-6 rounded-2xl bg-card border border-border px-5 py-3">
          <p className="text-[10px] text-muted-foreground">Reference</p>
          <p className="text-sm font-mono font-semibold text-foreground">{reference}</p>
        </div>
        <div className="flex gap-3 mt-8 w-full max-w-xs">
          <button onClick={() => navigate("/client-orders")}
            className="flex-1 py-3 rounded-xl bg-secondary text-foreground text-xs font-semibold">
            View Orders
          </button>
          <button onClick={() => navigate("/discover")}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-lg mx-auto">
        <div className="px-5 pt-6 pb-3 flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </motion.button>
          <h1 className="text-lg font-bold text-foreground">Checkout</h1>
        </div>

        <div className="px-5 space-y-5 mt-2">
          {/* Delivery details */}
          <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" /> Delivery details</p>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name"
              className="w-full bg-secondary rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number"
              className="w-full bg-secondary rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Delivery address" rows={2}
              className="w-full bg-secondary rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>

          {/* Order summary */}
          <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
            <p className="text-xs font-semibold text-foreground">Order summary</p>
            {lines.map((l) => (
              <div key={`${l.productId}-${l.size}-${l.color}`} className="flex items-center gap-3">
                <img src={l.product!.images[0]} alt={l.product!.name} className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{l.product!.name}</p>
                  <p className="text-[10px] text-muted-foreground">Size {l.size} × {l.quantity}</p>
                </div>
                <p className="text-xs font-semibold text-foreground">{formatMoney(l.product!.price * l.quantity)}</p>
              </div>
            ))}
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Total</span>
              <span className="text-base font-bold text-primary">{formatMoney(cartTotal())}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-secondary/50 border border-border p-3.5 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              You'll be securely redirected to Paystack to complete payment by card or mobile money.
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
        <div className="bg-card/95 backdrop-blur-xl border-t border-border px-5 py-4 max-w-lg mx-auto">
          <motion.button whileTap={{ scale: 0.97 }} onClick={handlePay} disabled={processing || !canPay}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold glow-primary disabled:opacity-50 flex items-center justify-center gap-2">
            <AnimatePresence mode="wait">
              {processing ? (
                <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing payment…
                </motion.span>
              ) : (
                <motion.span key="pay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Pay {formatMoney(cartTotal())} with Paystack
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ShopCheckout;
