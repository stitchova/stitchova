import { Heart, ShoppingCart, Check, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShopProduct } from "@/contexts/ShopContext";
import { formatMoney } from "@/lib/currency";

interface Props {
  designerId: string;
  product: ShopProduct;
  related: ShopProduct[];
  activeImage: number;
  setActiveImage: (i: number) => void;
  size: string;
  setSize: (s: string) => void;
  color: string;
  setColor: (c: string) => void;
  liked: boolean;
  setLiked: (fn: (v: boolean) => boolean) => void;
  onAdd: () => void;
  onBuyNow: () => void;
}

const ShopProductWorkspace = ({
  designerId, product, related, activeImage, setActiveImage, size, setSize, color, setColor,
  liked, setLiked, onAdd, onBuyNow,
}: Props) => {
  const navigate = useNavigate();

  return (
    <div className="hidden lg:block px-8 pt-6 pb-16 max-w-5xl mx-auto">
      <div className="grid grid-cols-2 gap-10">
        {/* Image */}
        <div>
          <div className="rounded-3xl overflow-hidden aspect-[4/5] bg-card">
            <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all ${i === activeImage ? "ring-2 ring-primary" : "opacity-60"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="pt-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] text-primary font-semibold uppercase tracking-wider">{product.category}</p>
              <h1 className="text-3xl font-bold text-foreground mt-1">{product.name}</h1>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setLiked((l) => !l)} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Heart className={`w-4 h-4 ${liked ? "fill-primary text-primary" : "text-foreground"}`} />
              </button>
              <button onClick={() => toast("Share link copied")} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Share2 className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>

          <p className="text-2xl font-bold text-primary mt-3">{formatMoney(product.price)}</p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-4">{product.description}</p>

          {/* Colors */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-foreground mb-2">Color</p>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <button key={c} onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${color === c ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                  style={{ backgroundColor: c }}>
                  {color === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="mt-5">
            <p className="text-xs font-semibold text-foreground mb-2">Size</p>
            <div className="flex gap-2">
              {product.sizes.map((s) => (
                <button key={s} onClick={() => setSize(s)}
                  className={`w-12 h-12 rounded-xl text-sm font-semibold transition-colors ${
                    size === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:border-primary/40"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {product.stock <= 5 && (
            <p className="text-xs text-primary font-medium mt-3">
              {product.stock === 0 ? "Out of stock" : `Only ${product.stock} left in stock`}
            </p>
          )}

          <div className="flex gap-3 mt-8">
            <button onClick={onAdd} disabled={product.stock === 0}
              className="flex-1 py-3.5 rounded-xl bg-secondary text-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-secondary/70 transition-colors">
              <ShoppingCart className="w-4 h-4" /> Add to Bag
            </button>
            <button onClick={onBuyNow} disabled={product.stock === 0}
              className="flex-[1.3] py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-40 glow-primary">
              Buy Now
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-border">
            {[
              { label: "Free Shipping", hint: "On orders over 500" },
              { label: "Easy Returns", hint: "30-day policy" },
              { label: "Secure Payment", hint: "100% protected" },
            ].map((f) => (
              <div key={f.label} className="text-center">
                <p className="text-[11px] font-semibold text-foreground">{f.label}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{f.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* You May Also Like */}
      {related.length > 0 && (
        <div className="mt-14">
          <h3 className="text-sm font-semibold text-foreground mb-4">You May Also Like</h3>
          <div className="grid grid-cols-4 gap-4">
            {related.map((p) => (
              <button key={p.id} onClick={() => navigate(`/designer/${designerId}/shop/${p.id}`)}
                className="text-left rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/40 transition-colors">
                <div className="aspect-[4/5]">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                  <p className="text-xs font-bold text-primary mt-0.5">{formatMoney(p.price)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopProductWorkspace;
