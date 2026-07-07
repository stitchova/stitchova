import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import portfolio1 from "@/assets/designer-portfolio-1.jpg";
import portfolio2 from "@/assets/designer-portfolio-2.jpg";
import portfolio3 from "@/assets/designer-portfolio-3.jpg";
import portfolio4 from "@/assets/designer-portfolio-4.jpg";
import portfolio5 from "@/assets/designer-portfolio-5.jpg";
import portfolio6 from "@/assets/designer-portfolio-6.jpg";
import designerAvatar1 from "@/assets/designer-avatar-1.jpg";
import designerAvatar2 from "@/assets/designer-avatar-2.jpg";
import designerAvatar3 from "@/assets/designer-avatar-3.jpg";

export const STYLE_TAGS = [
  "Kaba", "Suit", "Dress", "Bridal", "Casual", "Traditional", "Corporate", "Children",
] as const;
export type StyleTag = typeof STYLE_TAGS[number];

export interface ShowcaseComment {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  text: string;
  createdAt: number;
}

export interface ShowcasePost {
  id: string;
  designerId: string;
  designerName: string;
  designerAvatar: string;
  verified: boolean;
  media: string[]; // image data urls or asset paths
  mediaType: "image" | "video";
  poster?: string; // preview thumbnail for videos
  caption: string;
  tags: StyleTag[];
  available: boolean;
  createdAt: number;
  archived?: boolean;
}

interface ShowcaseState {
  posts: ShowcasePost[];
  likes: Record<string, string[]>; // postId -> userIds
  comments: Record<string, ShowcaseComment[]>;
  saved: string[]; // postIds saved by current user
}

const STORAGE_KEY = "fashionos-showcase-v2";

const SEED_POSTS: ShowcasePost[] = [
  {
    id: "p1", designerId: "nana-ama", designerName: "Nana Ama Couture", designerAvatar: designerAvatar1,
    verified: true, media: [portfolio1, portfolio4], mediaType: "image",
    caption: "Bridal silk gown finished this week — handcrafted lace bodice with kente accents.",
    tags: ["Bridal", "Dress"], available: true, createdAt: Date.now() - 1000 * 60 * 60 * 6,
  },
  {
    id: "p2", designerId: "kwame-styles", designerName: "Kwame Styles", designerAvatar: designerAvatar2,
    verified: true, media: [portfolio2], mediaType: "image",
    caption: "Three-piece agbada in royal blue with gold embroidery. DM to order.",
    tags: ["Traditional", "Suit"], available: true, createdAt: Date.now() - 1000 * 60 * 60 * 28,
  },
  {
    id: "p3", designerId: "efya-designs", designerName: "Efya Designs", designerAvatar: designerAvatar3,
    verified: false, media: [portfolio3, portfolio5, portfolio6], mediaType: "image",
    caption: "Fresh ankara casual drop. Made for the everyday woman.",
    tags: ["Casual", "Kaba"], available: false, createdAt: Date.now() - 1000 * 60 * 60 * 50,
  },
  {
    id: "p4", designerId: "nana-ama", designerName: "Nana Ama Couture", designerAvatar: designerAvatar1,
    verified: true, media: [portfolio4], mediaType: "image",
    caption: "Corporate kaba — tailored for the modern executive.",
    tags: ["Corporate", "Kaba"], available: true, createdAt: Date.now() - 1000 * 60 * 60 * 80,
  },
  {
    id: "p5", designerId: "kwame-styles", designerName: "Kwame Styles", designerAvatar: designerAvatar2,
    verified: true,
    media: ["https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"],
    mediaType: "video",
    poster: portfolio2,
    caption: "Behind the seams — new gold-thread agbada in motion. Tap to unmute.",
    tags: ["Traditional", "Suit"], available: true, createdAt: Date.now() - 1000 * 60 * 60 * 12,
  },
  {
    id: "p6", designerId: "nana-ama", designerName: "Nana Ama Couture", designerAvatar: designerAvatar1,
    verified: true,
    media: ["https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"],
    mediaType: "video",
    poster: portfolio5,
    caption: "Bridal fitting reel — every stitch matters.",
    tags: ["Bridal", "Dress"], available: true, createdAt: Date.now() - 1000 * 60 * 60 * 3,
  },
];

const CURRENT_USER_ID = "me";

interface Ctx extends ShowcaseState {
  currentDesigner: { id: string; name: string; avatar: string; verified: boolean };
  visiblePosts: ShowcasePost[];
  isLiked: (postId: string) => boolean;
  isSaved: (postId: string) => boolean;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
  createPost: (input: Omit<ShowcasePost, "id" | "createdAt" | "designerId" | "designerName" | "designerAvatar" | "verified">) => ShowcasePost;
  updatePostCaption: (postId: string, caption: string) => void;
  deletePost: (postId: string) => void;
  archivePost: (postId: string) => void;
  postsByDesigner: (designerId: string) => ShowcasePost[];
  savedPosts: ShowcasePost[];
}

const ShowcaseContext = createContext<Ctx | null>(null);

export const ShowcaseProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ShowcaseState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { posts: SEED_POSTS, likes: { p1: ["u2", "u3"], p2: ["u4"] }, comments: { p1: [{ id: "c1", authorId: "u2", authorName: "Akua M.", authorInitials: "AM", text: "Stunning! 😍", createdAt: Date.now() - 1000 * 60 * 60 }] }, saved: [] };
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const currentDesigner = { id: "me-designer", name: "Justice Agyeman", avatar: designerAvatar1, verified: true };

  const visiblePosts = useMemo(
    () => state.posts.filter((p) => !p.archived).sort((a, b) => b.createdAt - a.createdAt),
    [state.posts],
  );

  const isLiked = useCallback((id: string) => (state.likes[id] || []).includes(CURRENT_USER_ID), [state.likes]);
  const isSaved = useCallback((id: string) => state.saved.includes(id), [state.saved]);

  const toggleLike = useCallback((postId: string) => {
    setState((s) => {
      const cur = s.likes[postId] || [];
      const next = cur.includes(CURRENT_USER_ID) ? cur.filter((u) => u !== CURRENT_USER_ID) : [...cur, CURRENT_USER_ID];
      return { ...s, likes: { ...s.likes, [postId]: next } };
    });
  }, []);

  const toggleSave = useCallback((postId: string) => {
    setState((s) => ({ ...s, saved: s.saved.includes(postId) ? s.saved.filter((p) => p !== postId) : [...s.saved, postId] }));
  }, []);

  const addComment = useCallback((postId: string, text: string) => {
    if (!text.trim()) return;
    setState((s) => {
      const newComment: ShowcaseComment = {
        id: `c-${Date.now()}`, authorId: CURRENT_USER_ID, authorName: "You", authorInitials: "YU",
        text: text.trim(), createdAt: Date.now(),
      };
      return { ...s, comments: { ...s.comments, [postId]: [...(s.comments[postId] || []), newComment] } };
    });
  }, []);

  const deleteComment = useCallback((postId: string, commentId: string) => {
    setState((s) => ({ ...s, comments: { ...s.comments, [postId]: (s.comments[postId] || []).filter((c) => c.id !== commentId) } }));
  }, []);

  const createPost: Ctx["createPost"] = useCallback((input) => {
    const post: ShowcasePost = {
      id: `p-${Date.now()}`,
      designerId: currentDesigner.id,
      designerName: currentDesigner.name,
      designerAvatar: currentDesigner.avatar,
      verified: currentDesigner.verified,
      createdAt: Date.now(),
      ...input,
    };
    setState((s) => ({ ...s, posts: [post, ...s.posts] }));
    return post;
  }, []);

  const updatePostCaption = useCallback((postId: string, caption: string) => {
    setState((s) => ({ ...s, posts: s.posts.map((p) => (p.id === postId ? { ...p, caption } : p)) }));
  }, []);

  const deletePost = useCallback((postId: string) => {
    setState((s) => ({ ...s, posts: s.posts.filter((p) => p.id !== postId) }));
  }, []);

  const archivePost = useCallback((postId: string) => {
    setState((s) => ({ ...s, posts: s.posts.map((p) => (p.id === postId ? { ...p, archived: true } : p)) }));
  }, []);

  const postsByDesigner = useCallback(
    (designerId: string) => state.posts.filter((p) => p.designerId === designerId && !p.archived).sort((a, b) => b.createdAt - a.createdAt),
    [state.posts],
  );

  const savedPosts = useMemo(
    () => state.saved.map((id) => state.posts.find((p) => p.id === id)).filter(Boolean) as ShowcasePost[],
    [state.saved, state.posts],
  );

  return (
    <ShowcaseContext.Provider
      value={{
        ...state, currentDesigner, visiblePosts, isLiked, isSaved, toggleLike, toggleSave,
        addComment, deleteComment, createPost, updatePostCaption, deletePost, archivePost,
        postsByDesigner, savedPosts,
      }}
    >
      {children}
    </ShowcaseContext.Provider>
  );
};

export const useShowcase = () => {
  const ctx = useContext(ShowcaseContext);
  if (!ctx) throw new Error("useShowcase must be used within ShowcaseProvider");
  return ctx;
};

export const formatRelative = (ts: number) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(ts).toLocaleDateString();
};