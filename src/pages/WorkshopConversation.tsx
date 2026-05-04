import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Megaphone, Pin, Users, CheckCheck, X } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useWorkshopChat } from "@/contexts/WorkshopChatContext";
import { useRole } from "@/contexts/RoleContext";
import { useToast } from "@/hooks/use-toast";

const ease = [0.16, 1, 0.3, 1];

const formatTime = (t: number) =>
  new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const WorkshopConversation = () => {
  const navigate = useNavigate();
  const { chatId = "group" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { role } = useRole();
  const { toast } = useToast();
  const {
    members,
    currentUserId,
    getChatMessages,
    getMember,
    sendMessage,
    pinAnnouncement,
    pinnedAnnouncementId,
    markChatRead,
  } = useWorkshopChat();

  const isDesigner = role === "designer";
  const isGroup = chatId === "group";
  const messages = getChatMessages(chatId);
  const [input, setInput] = useState("");
  const [announceMode, setAnnounceMode] = useState(searchParams.get("announce") === "1");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Header subject
  const header = useMemo(() => {
    if (isGroup) return { name: "Workshop Group", sub: `${members.length} members`, isGroup: true, initials: "WS" };
    // dm:designer:<id> or dm:<a>:<b>
    const parts = chatId.split(":");
    const otherId = parts.slice(1).find((p) => p !== currentUserId) || parts[parts.length - 1];
    const m = getMember(otherId);
    return { name: m?.name ?? "Conversation", sub: m?.role ?? "", isGroup: false, initials: m?.initials ?? "?" };
  }, [chatId, isGroup, currentUserId, getMember, members.length]);

  useEffect(() => {
    markChatRead(chatId);
  }, [chatId, messages.length, markChatRead]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const pinned = useMemo(
    () => (isGroup ? messages.find((m) => m.id === pinnedAnnouncementId) : null),
    [isGroup, messages, pinnedAnnouncementId]
  );

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(chatId, input, { isAnnouncement: announceMode && isGroup && isDesigner });
    if (announceMode) {
      toast({ title: "Announcement sent", description: "Pinned for everyone in the workshop." });
      setAnnounceMode(false);
      const next = new URLSearchParams(searchParams);
      next.delete("announce");
      setSearchParams(next, { replace: true });
    }
    setInput("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease }}
        className="px-5 pt-5 pb-3 flex items-center gap-3 glass-card rounded-none border-t-0 border-x-0"
      >
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/workshop-chat")}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
          header.isGroup ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        }`}>
          {header.isGroup ? <Users className="w-5 h-5" /> : header.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{header.name}</p>
          <p className="text-[10px] text-muted-foreground">{header.sub}</p>
        </div>
      </motion.div>

      {/* Pinned banner */}
      {pinned && (
        <div className="px-5 pt-3">
          <div className="glass-card rounded-2xl p-3 flex items-start gap-3 border border-primary/30">
            <Pin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wider text-primary font-bold">Announcement</p>
              <p className="text-xs text-foreground mt-0.5">{pinned.text}</p>
            </div>
            {isDesigner && (
              <button
                onClick={() => { pinAnnouncement(null); toast({ title: "Announcement unpinned" }); }}
                className="text-muted-foreground"
                aria-label="Unpin announcement"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const mine = m.senderId === currentUserId;
            const sender = getMember(m.senderId);
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease }}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                {!mine && isGroup && (
                  <div className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold flex items-center justify-center mr-2 mt-auto flex-shrink-0">
                    {sender?.initials ?? "?"}
                  </div>
                )}
                <div
                  className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl ${
                    m.isAnnouncement
                      ? "bg-primary/15 border border-primary/40 rounded-bl-md"
                      : mine
                      ? "bg-primary text-primary-foreground rounded-br-md shadow-lg shadow-primary/10"
                      : "glass-card rounded-bl-md"
                  }`}
                >
                  {!mine && isGroup && (
                    <p className="text-[10px] font-bold text-primary mb-0.5">{sender?.name ?? "Unknown"}</p>
                  )}
                  {m.isAnnouncement && (
                    <div className="flex items-center gap-1 mb-1">
                      <Megaphone className="w-3 h-3 text-primary" />
                      <span className="text-[9px] uppercase tracking-wider text-primary font-bold">Announcement</span>
                    </div>
                  )}
                  <p className={`text-[12.5px] leading-relaxed ${m.isAnnouncement ? "text-foreground" : ""}`}>
                    {m.text}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <p className={`text-[8.5px] ${mine && !m.isAnnouncement ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {formatTime(m.time)}
                    </p>
                    {mine && !m.isAnnouncement && (
                      <CheckCheck className="w-3 h-3 text-primary-foreground/70" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Composer */}
      <div className="px-5 py-3 glass-card rounded-none border-b-0 border-x-0 safe-bottom space-y-2">
        {isGroup && isDesigner && (
          <button
            onClick={() => setAnnounceMode((v) => !v)}
            className={`flex items-center gap-2 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors ${
              announceMode ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            {announceMode ? "Announcement mode on" : "Send as announcement"}
          </button>
        )}
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={announceMode ? "Write an announcement…" : "Type a message…"}
            className="flex-1 bg-transparent glass-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20 disabled:opacity-40"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default WorkshopConversation;