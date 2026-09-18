import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";

/**
 * MOCK / PROTOTYPE DATA LAYER.
 * This entire context is a UI prototype — everything persists to
 * localStorage only, and "checkout" simulates a successful payment after
 * a short delay. There is no real Paystack call, no server-side payment
 * verification, and no shared/authoritative stock count across devices.
 *
 * When a developer builds the real platform, this file is what gets
 * replaced: products/stock/cart/orders should move to real Supabase
 * tables, and checkout should call a Supabase Edge Function that talks to
 * Paystack's server-side verify endpoint using a secret key that never
 * ships to the browser. Every place that needs that swap is marked
 * "REAL BACKEND NEEDED HERE" below.
 */

export const SHOP_CATEGORIES = [
  "Outerwear", "Dresses", "Tops", "Pants", "Shoes", "Bags", "Accessories",
] as const;
export type ShopCategory = typeof SHOP_CATEGORIES[number];

export interface ShopProduct {
  id: string;
  designerId: string;
  name: string;
  description: string;
  category: ShopCategory;
  price: number;
  currency: string;
  images: string[]; // data URLs (mock upload) or asset paths
  sizes: string[];
  colors: string[]; // hex-ish swatch values chosen by the designer
  stock: number; // REAL BACKEND NEEDED HERE — this must become an authoritative,
                  // server-side count once real checkout exists, or two
                  // clients can both "buy the last one" at once.
  active: boolean;
  createdAt: number;
}

export interface CartLine {
  productId: string;
  size: string;
  color: string;
  quantity: number;
}

export type OrderStatus = "paid" | "processing" | "shipped" | "delivered";

export interface ShopOrder {
  id: string;
  clientName: string;
  designerId: string;
  lines: (CartLine & { name: string; price: number; image: string })[];
  total: number;
  currency: string;
  status: OrderStatus;
  createdAt: number;
  reference: string; // mock Paystack-style reference
}

interface ShopState {
  products: ShopProduct[];
  cart: CartLine[];
  orders: ShopOrder[];
}

const STORAGE_KEY = "fashionos-shop-v1";

const load = (): ShopState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore corrupt storage */ }
  return { products: SEED_PRODUCTS, cart: [], orders: [] };
};

interface ShopContextType {
  products: ShopProduct[];
  cart: CartLine[];
  orders: ShopOrder[];
  productsByDesigner: (designerId: string) => ShopProduct[];
  activeProductsByDesigner: (designerId: string) => ShopProduct[];
  getProduct: (id: string) => ShopProduct | undefined;
  addProduct: (p: Omit<ShopProduct, "id" | "createdAt">) => ShopProduct;
  updateProduct: (id: string, patch: Partial<ShopProduct>) => void;
  deleteProduct: (id: string) => void;
  addToCart: (line: CartLine) => void;
  updateCartQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  clearCart: () => void;
  cartTotal: (currency?: string) => number;
  cartCount: number;
  /** Simulated checkout — resolves after a short delay like a real payment
   *  redirect would. REAL BACKEND NEEDED HERE: replace the body of this
   *  function with a call to a Supabase Edge Function that creates a
   *  Paystack transaction, then verifies it server-side on return. */
  checkout: (clientName: string, designerId: string) => Promise<ShopOrder>;
}

const ShopContext = createContext<ShopContextType | null>(null);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ShopState>(load);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage full/unavailable */ }
  }, [state]);

  const productsByDesigner = useCallback(
    (designerId: string) => state.products.filter((p) => p.designerId === designerId),
    [state.products]
  );
  const activeProductsByDesigner = useCallback(
    (designerId: string) => state.products.filter((p) => p.designerId === designerId && p.active),
    [state.products]
  );
  const getProduct = useCallback((id: string) => state.products.find((p) => p.id === id), [state.products]);

  const addProduct: ShopContextType["addProduct"] = (p) => {
    const product: ShopProduct = { ...p, id: `sp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, createdAt: Date.now() };
    setState((s) => ({ ...s, products: [product, ...s.products] }));
    return product;
  };

  const updateProduct: ShopContextType["updateProduct"] = (id, patch) =>
    setState((s) => ({ ...s, products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));

  const deleteProduct: ShopContextType["deleteProduct"] = (id) =>
    setState((s) => ({ ...s, products: s.products.filter((p) => p.id !== id) }));

  const addToCart: ShopContextType["addToCart"] = (line) =>
    setState((s) => {
      const existing = s.cart.find((c) => c.productId === line.productId && c.size === line.size && c.color === line.color);
      if (existing) {
        return { ...s, cart: s.cart.map((c) => (c === existing ? { ...c, quantity: c.quantity + line.quantity } : c)) };
      }
      return { ...s, cart: [...s.cart, line] };
    });

  const updateCartQuantity: ShopContextType["updateCartQuantity"] = (productId, size, color, quantity) =>
    setState((s) => ({
      ...s,
      cart: quantity <= 0
        ? s.cart.filter((c) => !(c.productId === productId && c.size === size && c.color === color))
        : s.cart.map((c) => (c.productId === productId && c.size === size && c.color === color ? { ...c, quantity } : c)),
    }));

  const removeFromCart: ShopContextType["removeFromCart"] = (productId, size, color) =>
    setState((s) => ({ ...s, cart: s.cart.filter((c) => !(c.productId === productId && c.size === size && c.color === color)) }));

  const clearCart = () => setState((s) => ({ ...s, cart: [] }));

  const cartTotal = () =>
    state.cart.reduce((sum, line) => {
      const p = state.products.find((pr) => pr.id === line.productId);
      return sum + (p ? p.price * line.quantity : 0);
    }, 0);

  const cartCount = state.cart.reduce((sum, l) => sum + l.quantity, 0);

  const checkout: ShopContextType["checkout"] = (clientName, designerId) =>
    new Promise((resolve) => {
      // REAL BACKEND NEEDED HERE — this timeout stands in for redirecting
      // to Paystack and waiting on a verified webhook/callback.
      setTimeout(() => {
        const lines = state.cart.map((c) => {
          const p = state.products.find((pr) => pr.id === c.productId)!;
          return { ...c, name: p.name, price: p.price, image: p.images[0] };
        });
        const order: ShopOrder = {
          id: `so_${Date.now()}`,
          clientName, designerId, lines,
          total: lines.reduce((s, l) => s + l.price * l.quantity, 0),
          currency: "GHS",
          status: "paid",
          createdAt: Date.now(),
          reference: `MOCK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        };
        setState((s) => ({
          ...s,
          orders: [order, ...s.orders],
          cart: [],
          products: s.products.map((p) => {
            const line = lines.find((l) => l.productId === p.id);
            return line ? { ...p, stock: Math.max(0, p.stock - line.quantity) } : p;
          }),
        }));
        resolve(order);
      }, 1400);
    });

  const value = useMemo<ShopContextType>(() => ({
    products: state.products, cart: state.cart, orders: state.orders,
    productsByDesigner, activeProductsByDesigner, getProduct,
    addProduct, updateProduct, deleteProduct,
    addToCart, updateCartQuantity, removeFromCart, clearCart,
    cartTotal, cartCount, checkout,
  }), [state, productsByDesigner, activeProductsByDesigner, getProduct]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
};

// Seed data so the shop isn't empty on first load, tied to the existing
// mock designer ids used across Discover/Showcase/DesignerProfilePage.
import portfolio1 from "@/assets/designer-portfolio-1.jpg";
import portfolio2 from "@/assets/designer-portfolio-2.jpg";
import portfolio3 from "@/assets/designer-portfolio-3.jpg";
import portfolio4 from "@/assets/designer-portfolio-4.jpg";
import portfolio5 from "@/assets/designer-portfolio-5.jpg";
import portfolio6 from "@/assets/designer-portfolio-6.jpg";

const SEED_PRODUCTS: ShopProduct[] = [
  {
    id: "sp1", designerId: "nana-ama", name: "Beige Trench Coat",
    description: "Timeless and elegant trench coat with a flattering fit. Perfect for any season and occasion.",
    category: "Outerwear", price: 750, currency: "GHS",
    images: [portfolio4, portfolio1], sizes: ["S", "M", "L", "XL"],
    colors: ["#C9A876", "#3A3A3A", "#1A1A1A"], stock: 6, active: true, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: "sp2", designerId: "nana-ama", name: "Wool Blend Coat",
    description: "A structured wool-blend coat with a tailored silhouette.",
    category: "Outerwear", price: 920, currency: "GHS",
    images: [portfolio3], sizes: ["S", "M", "L"], colors: ["#5A4632", "#1A1A1A"], stock: 3, active: true, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  },
  {
    id: "sp3", designerId: "nana-ama", name: "Silk Evening Gown",
    description: "Hand-finished silk gown with a fitted bodice and flowing train.",
    category: "Dresses", price: 1800, currency: "GHS",
    images: [portfolio5], sizes: ["XS", "S", "M", "L"], colors: ["#8B1E3F", "#1A1A1A"], stock: 2, active: true, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
  },
  {
    id: "sp4", designerId: "kwame-styles", name: "Agbada Set",
    description: "Traditional agbada with modern tailoring and premium fabric.",
    category: "Tops", price: 1400, currency: "GHS",
    images: [portfolio2], sizes: ["M", "L", "XL", "XXL"], colors: ["#0F3D3E", "#C9A876"], stock: 5, active: true, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
  },
  {
    id: "sp5", designerId: "efya-designs", name: "Ankara Wrap Skirt",
    description: "Bold ankara print skirt with an adjustable wrap waist.",
    category: "Dresses", price: 320, currency: "GHS",
    images: [portfolio6], sizes: ["S", "M", "L", "XL"], colors: ["#D97706", "#1A1A1A", "#0F3D3E"], stock: 8, active: true, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
];
