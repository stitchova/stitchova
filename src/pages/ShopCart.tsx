import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useShop } from "@/contexts/ShopContext";
import { formatMoney } from "@/lib/currency";
import EmptyState from "@/components/EmptyState";

/**
 * Cart is a single centered layout that already reads well at any screen
 * width (a narrow list of line items), so unlike the browse/detail pages
 * it doesn't need a separate desktop workspace — just a wider max-width
 * on large screens.
 */

const ShopCart = () => {
  const navigate = useNavigate();
  const { cart, products, updateCartQuantity, removeFromCart, cartTotal } = useShop();

  const lines = cart.map((c) => ({ ...c, product: products.find((p) => p.id === c.productId) })).filter((l) => l.product);

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-lg mx-auto lg:pt-6">
        <div className="sticky top-0 lg:static z-10 bg-background/80 backdrop-blur-xl px-5 pt-6 pb-3 flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </motion.button>
          <h1 className="text-lg font-bold text-foreground">Your Bag</h1>
          <span className="text-xs text-muted-foreground">({lines.length})</span>
        </div>

        {lines.length === 0 ? (
          <div className="px-5 mt-10">
            <EmptyState icon={ShoppingBag} title="Your bag is empty" description="Browse a designer's shop to add pieces here." />
          </div>
        ) : (
          <div className="px-5 space-y-3 mt-2">
            <AnimatePresence>
              {lines.map((l) => (
                <motion.div key={`${l.productId}-${l.size}-${l.color}`}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl bg-card border border-border p-3 flex gap-3">
                  <img src={l.product!.images[0]} alt={l.product!.name} className="w-20 h-24 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{l.product!.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-3.5 h-3.5 rounded-full border border-border" style={{ backgroundColor: l.color }} />
                      <span className="text-[11px] text-muted-foreground">Size {l.size}</span>
                    </div>
                    <p className="text-sm font-bold text-primary mt-1">{formatMoney(l.product!.price)}</p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-secondary rounded-full px-1 py-1">
                        <button onClick={() => updateCartQuantity(l.productId, l.size, l.color, l.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-card flex items-center justify-center">
                          <Minus className="w-3 h-3 text-foreground" />
                        </button>
                        <span className="text-xs font-semibold text-foreground w-4 text-center">{l.quantity}</span>
                        <button onClick={() => updateCartQuantity(l.productId, l.size, l.color, l.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-card flex items-center justify-center">
                          <Plus className="w-3 h-3 text-foreground" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(l.productId, l.size, l.color)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {lines.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
          <div className="bg-card/95 backdrop-blur-xl border-t border-border px-5 py-4 max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-lg font-bold text-foreground">{formatMoney(cartTotal())}</span>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate("/checkout")}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold glow-primary">
              Proceed to Checkout
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopCart;
