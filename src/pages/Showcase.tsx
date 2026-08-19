import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Scissors, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useShowcase, STYLE_TAGS, StyleTag } from "@/contexts/ShowcaseContext";
import { useRole } from "@/contexts/RoleContext";
import PostCard from "@/components/showcase/PostCard";
import CommentsSheet from "@/components/showcase/CommentsSheet";
import ShowcaseWorkspace from "@/components/client-desktop/ShowcaseWorkspace";

const PAGE_SIZE = 4;

const Showcase = () => {
  const navigate = useNavigate();
  const { role } = useRole();
  const { visiblePosts } = useShowcase();
  const [activeTag, setActiveTag] = useState<"All" | StyleTag>("All");
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = activeTag === "All" ? visiblePosts : visiblePosts.filter((p) => p.tags.includes(activeTag));
  const items = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  useEffect(() => { setVisible(PAGE_SIZE); }, [activeTag]);

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loadingMore) {
        setLoadingMore(true);
        setTimeout(() => { setVisible((v) => v + PAGE_SIZE); setLoadingMore(false); }, 600);
      }
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadingMore]);

  return (
    <>
      {/* Tablet/desktop workspace */}
      <ShowcaseWorkspace />

      {/* Mobile view (unchanged) */}
      <div className="min-h-screen bg-background pb-28 lg:hidden">
      {/* Header */}
      <div className="px-5 pt-6 pb-3 sticky top-0 z-30 glass-nav">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Showcase</h1>
          <p className="text-[10px] text-muted-foreground">{filtered.length} posts</p>
        </div>
        {/* Filter pills */}
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {(["All", ...STYLE_TAGS] as const).map((t) => (
            <button key={t} onClick={() => setActiveTag(t)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition ${
                activeTag === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="px-4 pt-4 space-y-5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Scissors className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">No posts yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">Designers will showcase their work here.</p>
            <button onClick={() => navigate("/discover")}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
              <Compass className="w-3.5 h-3.5" /> Explore designers
            </button>
          </div>
        ) : (
          items.map((p) => <PostCard key={p.id} post={p} onOpenComments={setOpenComments} />)
        )}

        {hasMore && (
          <div ref={sentinelRef} className="space-y-3">
            <div className="card-glass overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
              <Skeleton className="w-full h-72 rounded-none" />
              <div className="px-4 py-3 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Designer FAB */}
      {role === "designer" && (
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/showcase/new")}
          className="fixed bottom-24 right-5 w-14 h-14 rounded-2xl glass-fab glow-primary flex items-center justify-center z-40">
          <Plus className="w-6 h-6 text-primary-foreground" />
        </motion.button>
      )}

      <CommentsSheet postId={openComments} onClose={() => setOpenComments(null)} />
      </div>
    </>
  );
};

export default Showcase;