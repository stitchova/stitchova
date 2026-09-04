import { motion } from "framer-motion";
import { CheckCheck, Megaphone, Pin, Send, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CallButtons } from "@/components/CallOverlay";
import ContactAvatar from "@/components/messaging/ContactAvatar";

export interface WorkshopMemberView {
  id: string;
  name: string;
  initials: string;
  role: string;
}

export interface WorkshopMessageView {
  id: string;
  senderId: string;
  text: string;
  time: number;
  isAnnouncement?: boolean;
}

interface Props {
  headerName: string;
  headerSub: string;
  headerInitials: string;
  isGroup: boolean;
  isDesigner: boolean;
  members: WorkshopMemberView[];
  currentUserId: string;
  getMember: (id: string) => WorkshopMemberView | undefined;
  messages: WorkshopMessageView[];
  pinnedText?: string;
  onUnpin: () => void;
  announceMode: boolean;
  onToggleAnnounce: () => void;
  input: string;
  onInput: (v: string) => void;
  onSend: () => void;
  formatTime: (t: number) => string;
  onAudioCall?: () => void;
  onVideoCall?: () => void;
}

/** Tablet/desktop workspace for an individual workshop chat thread. */
const WorkshopConversationWorkspace = ({
  headerName, headerSub, headerInitials, isGroup, isDesigner, members, currentUserId, getMember,
  messages, pinnedText, onUnpin, announceMode, onToggleAnnounce, input, onInput, onSend, formatTime, onAudioCall, onVideoCall,
}: Props) => (
  <div className="hidden lg:block px-8 pt-6 pb-16">
    <div className="mx-auto max-w-[1200px] grid grid-cols-[1fr_minmax(260px,300px)] gap-6 items-start">
      <div className="rounded-3xl bg-card border border-border flex flex-col h-[720px]">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          {isGroup ? (
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
              <Users className="w-5 h-5" />
            </div>
          ) : (
            <ContactAvatar seed={headerName} size={44} />
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{headerName}</p>
            <p className="text-[10px] text-muted-foreground">{headerSub}</p>
          </div>
          {onAudioCall && onVideoCall && (
            <CallButtons className="ml-auto" onAudio={onAudioCall} onVideo={onVideoCall} />
          )}
        </div>

        {pinnedText && (
          <div className="px-6 pt-4">
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3 flex items-start gap-3">
              <Pin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-primary font-bold">Announcement</p>
                <p className="text-xs text-foreground mt-0.5">{pinnedText}</p>
              </div>
              {isDesigner && (
                <button onClick={onUnpin} className="text-muted-foreground" aria-label="Unpin announcement">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {messages.map((m) => {
            const mine = m.senderId === currentUserId;
            const sender = getMember(m.senderId);
            return (
              <motion.div
                key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={cn("flex", mine ? "justify-end" : "justify-start")}
              >
                {!mine && isGroup && (
                  <div className="mr-2 mt-auto flex-shrink-0">
                    <ContactAvatar seed={m.senderId} size={32} />
                  </div>
                )}
                <div className={cn("max-w-[58%] px-4 py-3 rounded-2xl",
                  m.isAnnouncement ? "bg-primary/10 border border-primary/40 text-foreground"
                    : mine ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")}>
                  {!mine && isGroup && (
                    <p className="text-[10px] font-bold text-primary mb-0.5">{sender?.name ?? "Unknown"}</p>
                  )}
                  {m.isAnnouncement && (
                    <div className="flex items-center gap-1 mb-1">
                      <Megaphone className="w-3 h-3 text-primary" />
                      <span className="text-[9px] uppercase tracking-wider text-primary font-bold">Announcement</span>
                    </div>
                  )}
                  <p className="text-[13px] leading-relaxed">{m.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className={cn("text-[9px]", mine && !m.isAnnouncement ? "text-primary-foreground/60" : "text-muted-foreground")}>
                      {formatTime(m.time)}
                    </span>
                    {mine && !m.isAnnouncement && <CheckCheck className="w-3 h-3 text-primary-foreground/70" />}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-border space-y-3">
          {isGroup && isDesigner && (
            <button
              onClick={onToggleAnnounce}
              className={cn("flex items-center gap-2 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors",
                announceMode ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")}
            >
              <Megaphone className="w-3.5 h-3.5" />
              {announceMode ? "Announcement mode on" : "Send as announcement"}
            </button>
          )}
          <div className="flex items-center gap-3">
            <input
              value={input} onChange={(e) => onInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSend()}
              placeholder={announceMode ? "Write an announcement…" : "Type a message…"}
              className="flex-1 bg-transparent glass-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <motion.button
              whileTap={{ scale: 0.9 }} onClick={onSend} disabled={!input.trim()}
              className="w-11 h-11 rounded-full bg-primary flex items-center justify-center disabled:opacity-40"
            >
              <Send className="w-4 h-4 text-primary-foreground" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-card border border-border p-6">
        <p className="text-sm font-semibold text-foreground mb-4">Workshop members ({members.length})</p>
        <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-hide pr-1">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-secondary/40 p-3">
              <div className="w-9 h-9 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold flex items-center justify-center">
                {m.initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{m.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default WorkshopConversationWorkspace;
