import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, ShoppingCart, Check, Share2, Truck, RefreshCcw, ShieldCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useShop } from "@/contexts/ShopContext";
import { formatMoney } from "@/lib/currency";
import { toast } from "sonner";
import ShopProductWorkspace from "@/components/client-desktop/ShopProductWorkspace";

const ShopProductDetail = () => {
  const navigate = useNavigate();
  const { id = "nana-ama", productId = "" } = useParams();
  const { getProduct, activeProductsByDesigner, addToCart } = useShop();

  const product = getProduct(productId);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState(product?.sizes[Math.min(1, product.sizes.length - 1)] ?? "");
  const [color, setColor] = useState(product?.colors[0] ?? "");
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm font-semibold text-foreground">Product not found</p>
        <button onClick={() => navigate(-1)} className="text-xs text-primary font-semibold">Go back</button>
      </div>
    );
  }

  const related = activeProductsByDesigner(id).filter((p) => p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    addToCart({ productId: product.id, size, color, quantity: 1 });
    setAdded(true);
    toast.success(`Added to bag — ${product.name} (${size})`);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    addToCart({ productId: product.id, size, color, quantity: 1 });
    navigate("/cart");
  };

  return (
    <>
      <ShopProductWorkspace
        designerId={id} product={product} related={related}
        activeImage={activeImage} setActiveImage={setActiveImage}
        size={size} setSize={setSize} color={color} setColor={setColor}
        liked={liked} setLiked={setLiked} onAdd={handleAdd} onBuyNow={handleBuyNow}
      />

      <div className="min-h-screen bg-background pb-32 lg:hidden">
        {/* Image */}
        <div className="relative h-96">
          <AnimatePresence mode="wait">
            <motion.img key={activeImage} src={product.images[activeImage]} alt={product.name}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full h-full object-cover" />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute top-0 left-0 right-0 px-5 pt-6 flex items-center justify-between">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </motion.button>
            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setLiked((l) => !l)} className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center">
                <Heart className={`w-4 h-4 ${liked ? "fill-primary text-primary" : "text-foreground"}`} />
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => toast("Share link copied")} className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center">
                <Share2 className="w-4 h-4 text-foreground" />
              </motion.button>
            </div>
          </div>
          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
              {product.images.map((_, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`h-1.5 rounded-full transition-all ${i === activeImage ? "w-6 bg-primary" : "w-1.5 bg-card"}`} />
              ))}
            </div>
          )}
        </div>

        <div className="px-5 pt-5 space-y-5">
          <div>
            <p className="text-[10px] text-primary font-semibold uppercase tracking-wider">{product.category}</p>
            <h1 className="text-xl font-bold text-foreground mt-1">{product.name}</h1>
            <p className="text-lg font-bold text-primary mt-1">{formatMoney(product.price)}</p>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Colors */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Color</p>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <button key={c} onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${color === c ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                  style={{ backgroundColor: c }}>
                  {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Size</p>
            <div className="flex gap-2">
              {product.sizes.map((s) => (
                <button key={s} onClick={() => setSize(s)}
                  className={`w-11 h-11 rounded-xl text-xs font-semibold transition-colors ${
                    size === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {product.stock <= 5 && (
            <p className="text-[11px] text-primary font-medium">
              {product.stock === 0 ? "Out of stock" : `Only ${product.stock} left in stock`}
            </p>
          )}

          {/* You may also like */}
          {related.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground mb-3">You May Also Like</p>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {related.map((p) => (
                  <button key={p.id} onClick={() => navigate(`/designer/${id}/shop/${p.id}`)}
                    className="flex-shrink-0 w-28 text-left">
                    <div className="w-28 h-32 rounded-xl overflow-hidden bg-card">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] font-medium text-foreground mt-1.5 truncate">{p.name}</p>
                    <p className="text-[10px] font-bold text-primary">{formatMoney(p.price)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card/60 py-3">
            {[
              { Icon: Truck, label: "Free Shipping" },
              { Icon: RefreshCcw, label: "Easy Returns" },
              { Icon: ShieldCheck, label: "Secure Payment" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 px-2">
                <Icon className="w-4 h-4 text-primary" />
                <p className="text-[9px] font-semibold text-foreground text-center">{label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Fixed CTA bar (mobile only) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom lg:hidden">
        <div className="bg-card/95 backdrop-blur-xl border-t border-border px-5 py-3 max-w-md mx-auto flex gap-2">
          <motion.button whileTap={{ scale: 0.96 }} onClick={handleAdd} disabled={product.stock === 0}
            className="flex-1 py-3.5 rounded-xl bg-secondary text-foreground text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-40">
            {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            {added ? "Added" : "Add to Bag"}
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={handleBuyNow} disabled={product.stock === 0}
            className="flex-[1.3] py-3.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-40">
            Buy Now
          </motion.button>
        </div>
      </div>
    </>
  );
};

export default ShopProductDetail;
