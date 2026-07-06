import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export interface ClientReview {
  id: string;
  designerId: string;
  clientName: string;
  rating: number;
  categories?: Record<string, number>;
  text: string;
  createdAt: number;
  orderRef?: string;
}

interface Ctx {
  reviews: ClientReview[];
  byDesigner: (designerId: string) => ClientReview[];
  addReview: (r: Omit<ClientReview, "id" | "createdAt">) => ClientReview;
}

const KEY = "stitchova.reviews.v1";
const ReviewsContext = createContext<Ctx | null>(null);

export const ReviewsProvider = ({ children }: { children: ReactNode }) => {
  const [reviews, setReviews] = useState<ClientReview[]>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(reviews)); }, [reviews]);

  const value = useMemo<Ctx>(() => ({
    reviews,
    byDesigner: (designerId) => reviews.filter((r) => r.designerId === designerId).sort((a,b) => b.createdAt - a.createdAt),
    addReview: (r) => {
      const rec: ClientReview = {
        ...r,
        id: `rev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`,
        createdAt: Date.now(),
      };
      setReviews((prev) => [rec, ...prev]);
      return rec;
    },
  }), [reviews]);

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
};

export const useReviews = () => {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews must be used within ReviewsProvider");
  return ctx;
};

export const relativeTime = (ts: number) => {
  const diff = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  const d = Math.floor(diff/86400);
  return d === 1 ? "yesterday" : `${d}d ago`;
};