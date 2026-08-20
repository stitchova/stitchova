import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Bookmark, BadgeCheck, Plus, Sparkles, Play, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useShowcase, STYLE_TAGS } from "@/contexts/ShowcaseContext";
import { useRole } from "@/contexts/RoleContext";
import SmartImage from "@/components/SmartImage";

/**
 * Tablet/desktop workspace for the Showcase feed.
 *
 * Adds on top of the base masonry grid:
 * - Infinite scroll: posts load in batches as the user scrolls near the
 *   bottom (IntersectionObserver sentinel), rather than rendering
 *   everything at once. With only a handful of posts in the current mock
 *   dataset this reaches "you're all caught up" quickly — but the
 *   mechanism is real and will scale once there's a real feed.
 * - Optimistic like/save: tapping the heart or bookmark responds
 *   instantly with a spring bounce and a brief radiating burst, rather
 *   than a flat icon-swap.
 * - Sticky filter bar: the tag pills stay visible while scrolling instead
 *   of disappearing up the page.
 * - Blur-up image loading via SmartImage (skeleton -> blurred -> sharp),
 *   instead of a hard pop-in once the image downloads.
 */

const ease = [0.16, 1, 0.3, 1];
const PAGE_SIZE = 4;

const ShowcaseWorkspace = () => {
  const navigate = useNavigate();
  const { role } = useRole();
  const { visiblePosts, isLiked, isSaved, toggleLike, toggleSave, comments } = useShowcase();
  const [activeTag, setActiveTag] = useState<string>("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [burst, setBurst] = useState<Record<string, "like" | "save" | null>>({});
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const filtered = activeTag === "All" ? visiblePosts : visiblePosts.filter((p) => p.tags.includes(activeTag as never));
  const page = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const openPost = visiblePosts.find((p) => p.id === openId) || null;

  // Reset pagination whenever the active filter changes
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [activeTag]);

  // Infinite scroll: load the next batch when the sentinel enters view
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setVisibleCount((c) => c + PAGE_SIZE); },
      { rootMargin: "400px" }
    );
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [hasMore, sentinelRef.current]);

  const fireBurst = useCallback((id: string, kind: "like" | "save") => {
    setBurst((b) => ({ ...b, [id]: kind }));
    setTimeout(() => setBurst((b) => ({ ...b, [id]: null })), 500);
  }, []);

  const handleLike = (id: string) => {
    const wasLiked = isLiked(id);
    toggleLike(id);
    if (!wasLiked) fireBurst(id, "like");
  };
  const handleSave = (id: string) => {
    const wasSaved = isSaved(id);
    toggleSave(id);
    if (!wasSaved) fireBurst(id, "save");
  };

  return (
    <div className="hidden lg:block px-8 pt-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Showcase</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Fresh work from designers on the platform</p>
        </div>
        {role === "designer" && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate("/showcase/new")}
            className="ml-auto flex items-center gap-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold px-5 py-3 glow-primary flex-shrink-0">
            <Plus className="w-4 h-4" /> New post
          </motion.button>
        )}
      </div>

      {/* Sticky filter bar — stays visible while scrolling the grid below */}
      <nav className="sticky top-16 z-30 flex items-center gap-1.5 rounded-full solid-panel p-1.5 overflow-x-auto max-w-2xl mb-6 backdrop-blur-xl">
        {["All", ...STYLE_TAGS].map((tag) => (
          <button key={tag} onClick={() => setActiveTag(tag)}
            className={cn("relative px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
              activeTag === tag ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            {activeTag === tag && (
              <motion.div layoutId="showcaseTagPill" className="absolute inset-0 rounded-full bg-primary glow-primary"
                transition={{ type: "spring", stiffness: 400, damping: 32 }} />
            )}
            <span className="relative z-10">{tag}</span>
          </button>
        ))}
      </nav>

      {/* Masonry grid — CSS columns keep natural image aspect ratios */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl solid-panel p-20 flex flex-col items-center justify-center text-center">
          <Sparkles className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-sm font-semibold text-foreground">No posts in this style yet</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different tag, or check back soon.</p>
        </div>
      ) : (
        <>
          <div className="columns-4 gap-4 [column-fill:_balance]">
            <AnimatePresence>
              {page.map((p, i) => (
                <motion.div key={p.id} layout
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % PAGE_SIZE) * 0.06, duration: 0.5, ease }}
                  whileHover={{ y: -3 }}
                  onClick={() => setOpenId(p.id)}
                  className="break-inside-avoid mb-4 cursor-pointer solid-panel overflow-hidden group">
                  <div className="relative">
                    {p.mediaType === "video" ? (
                      <video
                        src={p.media[0]}
                        poster={p.poster}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        onMouseEnter={(e) => void e.currentTarget.play().catch(() => {})}
                        onMouseLeave={(e) => e.currentTarget.pause()}
                      />
                    ) : (
                      <SmartImage src={p.media[0]} alt={p.caption} containerClassName="w-full"
                        className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                    )}
                    {p.mediaType === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/20 pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-background/80 flex items-center justify-center group-hover:opacity-0 transition-opacity">
                          <Play className="w-5 h-5 text-foreground fill-foreground ml-0.5" />
                        </div>
                      </div>
                    )}
                    {!p.available && (
                      <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-background/80 text-muted-foreground">
                        Sold out
                      </span>
                    )}

                    {/* Optimistic like burst */}
                    <AnimatePresence>
                      {burst[p.id] === "like" && (
                        <motion.div
                          initial={{ scale: 0.4, opacity: 0.9 }} animate={{ scale: 1.6, opacity: 0 }}
                          exit={{ opacity: 0 }} transition={{ duration: 0.5, ease }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <Heart className="w-16 h-16 fill-primary text-primary" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-1 group-hover:translate-y-0">
                      <div className="flex items-center gap-2">
                        <img src={p.designerAvatar} alt={p.designerName} className="w-6 h-6 rounded-full object-cover ring-1 ring-border" />
                        <span className="text-xs font-semibold text-foreground truncate">{p.designerName}</span>
                        {p.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                      </div>
                    </div>
                  </div>
                  <div className="p-3.5 flex items-center gap-4">
                    <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); handleLike(p.id); }}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <motion.span animate={isLiked(p.id) ? { scale: [1, 1.35, 1] } : {}} transition={{ duration: 0.35, ease }}>
                        <Heart className={cn("w-4 h-4 transition-colors", isLiked(p.id) && "fill-primary text-primary")} />
                      </motion.span>
                    </motion.button>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MessageCircle className="w-4 h-4" /> {comments[p.id]?.length || 0}
                    </span>
                    <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); handleSave(p.id); }}
                      className="ml-auto text-muted-foreground hover:text-primary transition-colors relative">
                      <motion.span animate={isSaved(p.id) ? { scale: [1, 1.35, 1] } : {}} transition={{ duration: 0.35, ease }}>
                        <Bookmark className={cn("w-4 h-4 transition-colors", isSaved(p.id) && "fill-primary text-primary")} />
                      </motion.span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Infinite scroll sentinel + end state */}
          {hasMore ? (
            <div ref={sentinelRef} className="flex items-center justify-center py-10">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                Loading more…
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">You're all caught up</p>
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {openPost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpenId(null)}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-10">
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25, ease }}
              onClick={(e) => e.stopPropagation()}
              className="solid-panel max-w-4xl w-full max-h-[85vh] grid grid-cols-[1.4fr_1fr] overflow-hidden">
              {openPost.mediaType === "video" ? (
                <video src={openPost.media[0]} poster={openPost.poster} controls autoPlay muted loop playsInline
                  className="w-full h-full object-cover max-h-[85vh] bg-background" />
              ) : (
                <SmartImage src={openPost.media[0]} alt={openPost.caption}
                  containerClassName="w-full h-full max-h-[85vh]" className="w-full h-full object-cover max-h-[85vh]" />
              )}
              <div className="p-6 flex flex-col">
                <div className="flex items-center gap-3">
                  <img src={openPost.designerAvatar} alt={openPost.designerName} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                      {openPost.designerName} {openPost.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{openPost.tags.join(" · ")}</p>
                  </div>
                </div>
                <p className="text-sm text-foreground mt-4 leading-relaxed">{openPost.caption}</p>
                <div className="mt-auto pt-6 flex items-center gap-4 border-t border-border">
                  <motion.button whileTap={{ scale: 0.8 }} onClick={() => handleLike(openPost.id)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <motion.span animate={isLiked(openPost.id) ? { scale: [1, 1.35, 1] } : {}} transition={{ duration: 0.35, ease }}>
                      <Heart className={cn("w-5 h-5", isLiked(openPost.id) && "fill-primary text-primary")} />
                    </motion.span>
                    Like
                  </motion.button>
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MessageCircle className="w-5 h-5" /> {comments[openPost.id]?.length || 0} comments
                  </span>
                  <motion.button whileTap={{ scale: 0.8 }} onClick={() => handleSave(openPost.id)}
                    className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <motion.span animate={isSaved(openPost.id) ? { scale: [1, 1.35, 1] } : {}} transition={{ duration: 0.35, ease }}>
                      <Bookmark className={cn("w-5 h-5", isSaved(openPost.id) && "fill-primary text-primary")} />
                    </motion.span>
                    Save
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShowcaseWorkspace;
