import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Send } from "lucide-react";
import { useShowcase, formatRelative } from "@/contexts/ShowcaseContext";
import { useRole } from "@/contexts/RoleContext";
import { useToast } from "@/hooks/use-toast";

interface Props { postId: string | null; onClose: () => void; }

const CommentsSheet = ({ postId, onClose }: Props) => {
  const { comments, addComment, deleteComment, posts, currentDesigner } = useShowcase();
  const { role } = useRole();
  const { toast } = useToast();
  const [text, setText] = useState("");
  const open = !!postId;
  const list = postId ? comments[postId] || [] : [];
  const post = postId ? posts.find((p) => p.id === postId) : null;
  const canModerate = role === "designer" && post?.designerId === currentDesigner.id;

  const send = () => {
    if (!postId || !text.trim()) return;
    addComment(postId, text);
    setText("");
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="h-[75vh] rounded-t-3xl flex flex-col p-0">
        <div className="px-5 pt-5 pb-3 border-b border-border/40">
          <h3 className="text-sm font-bold text-foreground text-center">Comments</h3>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {list.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-12">Be the first to comment.</p>
          )}
          {list.map((c) => (
            <div key={c.id} className="flex gap-3"
              onContextMenu={(e) => {
                if (canModerate) { e.preventDefault(); deleteComment(postId!, c.id); toast({ title: "Comment deleted" }); }
              }}
            >
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-foreground">{c.authorInitials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="text-xs font-semibold text-foreground">{c.authorName}</p>
                  <span className="text-[9px] text-muted-foreground">{formatRelative(c.createdAt)}</span>
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed mt-0.5">{c.text}</p>
                {canModerate && (
                  <button onClick={() => { deleteComment(postId!, c.id); toast({ title: "Comment deleted" }); }} className="text-[9px] text-destructive mt-1">Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border/40 px-4 py-3 flex items-center gap-2 safe-bottom">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Add a comment…"
            className="flex-1 glass-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          <button onClick={send} disabled={!text.trim()}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CommentsSheet;