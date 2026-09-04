import { motion } from "framer-motion";
import { CheckCheck, Search, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { DesktopOnly, WorkspaceHeader } from "./DesktopKit";
import { CallButtons } from "@/components/CallOverlay";
import ContactAvatar from "@/components/messaging/ContactAvatar";

export interface ConversationView {
  id: string;
  clientName: string;
  clientInitials: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  typing?: boolean;
  phone: string;
  email: string;
  location: string;
  totalOrders: number;
  lastVisit: string;
  measurements: string;
}

export interface MessageView {
  id: number;
  from: "designer" | "client";
  text?: string;
  type: "text" | "voice" | "image";
  duration?: string;
  imageUrl?: string;
  time: string;
  read?: boolean;
}

interface Props {
  conversations: ConversationView[];
  activeConvo?: ConversationView;
  activeChat: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearch: (v: string) => void;
  messages: MessageView[];
  input: string;
  onInput: (v: string) => void;
  onSend: () => void;
  onAudioCall?: () => void;
  onVideoCall?: () => void;
}

/** Tablet/desktop two-pane workspace for designer client messaging. */
const DesignerMessagesWorkspace = ({
  conversations, activeConvo, activeChat, onSelect, searchQuery, onSearch,
  messages, input, onInput, onSend, onAudioCall, onVideoCall,
}: Props) => (
  <DesktopOnly>
    <div className="mx-auto max-w-[1280px]">
      <WorkspaceHeader title="Messages" subtitle="Client conversations" />

      <div className="mt-6 rounded-3xl card-elevated p-5 grid grid-cols-[minmax(300px,360px)_1fr] gap-5 items-start">
        {/* Conversation list */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 glass-input px-4 py-2.5">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={searchQuery} onChange={(e) => onSearch(e.target.value)} placeholder="Search conversations…"
              className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground flex-1 outline-none"
            />
          </div>
          <div className="space-y-2 max-h-[620px] overflow-y-auto scrollbar-hide pr-1">
            {conversations.map((c) => (
              <button
                key={c.id} onClick={() => onSelect(c.id)}
                className={cn("w-full text-left rounded-2xl p-3 flex items-center gap-3 border transition-colors",
                  activeChat === c.id ? "bg-primary/10 border-primary/40" : "bg-card border-border hover:bg-secondary/40")}
              >
                x
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{c.clientInitials}</span>
                  </div>
                  {c.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-status-completed ring-2 ring-card" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-foreground truncate">{c.clientName}</p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{c.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {c.typing ? <span className="text-primary italic">typing…</span> : c.lastMessage}
                  </p>
                </div>
                {c.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                    {c.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Thread */}
        <div className="rounded-3xl bg-card border border-border flex flex-col h-[680px]">
          {!activeConvo ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Select a conversation to start chatting.</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{activeConvo.clientInitials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{activeConvo.clientName}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {activeConvo.online ? <span className="text-status-completed">Online</span> : "Last seen recently"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">{activeConvo.location}</p>
                    <p className="text-[10px] text-muted-foreground">{activeConvo.totalOrders} orders · {activeConvo.measurements}</p>
                  </div>
                  {onAudioCall && onVideoCall && (
                    <CallButtons onAudio={onAudioCall} onVideo={onVideoCall} />
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
                {messages.map((m) => (
                  <motion.div
                    key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className={cn("flex", m.from === "designer" ? "justify-end" : "justify-start")}
                  >
                    <div className={cn("max-w-[60%] rounded-2xl px-4 py-3",
                      m.from === "designer" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")}>
                      {m.type === "text" && <p className="text-[13px] leading-relaxed">{m.text}</p>}
                      {m.type === "voice" && <p className="text-[13px]">Voice note · {m.duration}</p>}
                      {m.type === "image" && <p className="text-[13px]">Photo attachment</p>}
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className={cn("text-[9px]", m.from === "designer" ? "text-primary-foreground/60" : "text-muted-foreground")}>
                          {m.time}
                        </span>
                        {m.from === "designer" && <CheckCheck className="w-3 h-3 text-primary-foreground/70" />}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="px-6 py-4 border-t border-border flex items-center gap-3">
                <input
                  value={input} onChange={(e) => onInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSend()}
                  placeholder="Type a message…"
                  className="flex-1 bg-transparent glass-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }} onClick={onSend} disabled={!input.trim()}
                  className="w-11 h-11 rounded-full bg-primary flex items-center justify-center disabled:opacity-40"
                >
                  <Send className="w-4 h-4 text-primary-foreground" />
                </motion.button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  </DesktopOnly>
);

export default DesignerMessagesWorkspace;
