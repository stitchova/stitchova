import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Volume2, VolumeX, Send as SendIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ShowcasePost, useShowcase, formatRelative } from "@/contexts/ShowcaseContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

interface Props {
  post: ShowcasePost;
  onOpenComments: (id: string) => void;
}

const PostCard = ({ post, onOpenComments }: Props) => {
  const navigate = useNavigate();
  const { isLiked, isSaved, toggleLike, toggleSave, likes, comments, currentDesigner, deletePost, archivePost, updatePostCaption } = useShowcase();
  const { toast } = useToast();
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [muted, setMuted] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.caption);

  const liked = isLiked(post.id);
  const saved = isSaved(post.id);
  const likeCount = (likes[post.id] || []).length;
  const commentCount = (comments[post.id] || []).length;
  const isOwner = post.designerId === currentDesigner.id;

  const handleRequest = () => {
    navigate(
      `/messages?designer=${post.designerId}&name=${encodeURIComponent(post.designerName)}&prefill=${encodeURIComponent("Hi, I'm interested in a piece like this.")}&postThumb=${encodeURIComponent(post.media[0])}`,
    );
  };

  const handleSave = () => {
    toggleSave(post.id);
    toast({ title: saved ? "Removed from saved" : "Saved to your collection" });
  };

  return (
    <article className="card-glass overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate(`/designer/${post.designerId}`)} className="flex items-center gap-2.5 flex-1 min-w-0">
          <img src={post.designerAvatar} alt={post.designerName} className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20" />
          <div className="min-w-0 text-left">
            <p className="text-xs font-bold text-foreground truncate">{post.designerName}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {post.tags.slice(0, 2).map((t) => (
                <span key={t} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{t}</span>
              ))}
              <span className="text-[9px] text-muted-foreground">· {formatRelative(post.createdAt)}</span>
            </div>
          </div>
        </button>
        <button onClick={() => setMenuOpen(true)} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Media */}
      <div className="relative bg-black">
        {post.available && (
          <span className="absolute top-3 left-3 z-10 text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary text-primary-foreground shadow-lg">
            Available to order
          </span>
        )}
        <button
          onClick={handleSave}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-background/60 backdrop-blur-md flex items-center justify-center"
          aria-label="Save"
        >
          <Bookmark className={`w-4 h-4 transition ${saved ? "fill-primary text-primary" : "text-foreground"}`} />
        </button>

        {post.mediaType === "video" ? (
          <div className="relative">
            <video src={post.media[0]} autoPlay loop muted={muted} playsInline className="w-full max-h-[520px] object-cover" />
            <button onClick={() => setMuted((m) => !m)} className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-background/60 backdrop-blur-md flex items-center justify-center">
              {muted ? <VolumeX className="w-4 h-4 text-foreground" /> : <Volume2 className="w-4 h-4 text-foreground" />}
            </button>
          </div>
        ) : (
          <div className="relative">
            <img src={post.media[carouselIdx]} alt="Post" className="w-full max-h-[520px] object-cover" />
            {post.media.length > 1 && (
              <>
                <div className="absolute inset-y-0 left-0 w-1/3" onClick={() => setCarouselIdx((i) => Math.max(0, i - 1))} />
                <div className="absolute inset-y-0 right-0 w-1/3" onClick={() => setCarouselIdx((i) => Math.min(post.media.length - 1, i + 1))} />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {post.media.map((_, i) => (
                    <span key={i} className={`h-1.5 rounded-full transition-all ${i === carouselIdx ? "w-5 bg-white" : "w-1.5 bg-white/50"}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="px-4 pt-3">
        {editing && isOwner ? (
          <div className="space-y-2">
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={300} rows={3}
              className="w-full glass-input p-3 text-xs text-foreground outline-none resize-none" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setEditing(false); setDraft(post.caption); }} className="text-[11px] px-3 py-1.5 rounded-lg bg-secondary text-foreground">Cancel</button>
              <button onClick={() => { updatePostCaption(post.id, draft); setEditing(false); toast({ title: "Caption updated" }); }} className="text-[11px] px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold">Save</button>
            </div>
          </div>
        ) : (
          <p className={`text-xs text-foreground leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
            {post.caption}
          </p>
        )}
        {!editing && post.caption.length > 80 && (
          <button onClick={() => setExpanded((e) => !e)} className="text-[10px] text-muted-foreground mt-1">
            {expanded ? "see less" : "see more"}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 flex items-center gap-4">
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => toggleLike(post.id)} className="flex items-center gap-1.5">
          <motion.span animate={liked ? { scale: [1, 1.25, 1] } : {}} transition={{ duration: 0.3 }}>
            <Heart className={`w-5 h-5 ${liked ? "fill-primary text-primary" : "text-muted-foreground"}`} />
          </motion.span>
          <span className="text-xs font-semibold text-foreground">{likeCount}</span>
        </motion.button>
        <button onClick={() => onOpenComments(post.id)} className="flex items-center gap-1.5">
          <MessageCircle className="w-5 h-5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">{commentCount}</span>
        </button>
        <div className="flex-1" />
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleRequest}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20">
          <SendIcon className="w-3.5 h-3.5" /> Request this
        </motion.button>
      </div>

      {/* Owner / general menu */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <div className="space-y-1 pt-2">
            {isOwner ? (
              <>
                <button onClick={() => { setEditing(true); setMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-secondary text-sm text-foreground">Edit caption</button>
                <button onClick={() => { archivePost(post.id); setMenuOpen(false); toast({ title: "Post archived" }); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-secondary text-sm text-foreground">Archive post</button>
                <button onClick={() => { deletePost(post.id); setMenuOpen(false); toast({ title: "Post deleted" }); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-secondary text-sm text-destructive">Delete post</button>
              </>
            ) : (
              <>
                <button onClick={() => { handleSave(); setMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-secondary text-sm text-foreground">{saved ? "Unsave post" : "Save post"}</button>
                <button onClick={() => { setMenuOpen(false); toast({ title: "Reported", description: "Thanks for letting us know." }); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-secondary text-sm text-foreground">Report</button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </article>
  );
};

export default PostCard;