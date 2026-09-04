import { motion, AnimatePresence } from "framer-motion";
import { CheckCheck, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { CallButtons } from "@/components/CallOverlay";
import ContactAvatar from "@/components/messaging/ContactAvatar";

export interface ClientMessageView {
  id: number;
  from: string;
  text: string;
  time: string;
  read: boolean;
}

interface Props {
  designerId: string;
  designerName: string;
  avatar: string;
  postThumb?: string;
  messages: ClientMessageView[];
  showTyping: boolean;
  input: string;
  onInput: (v: string) => void;
  onSend: () => void;
  onOpenDesigner: () => void;
  onAudioCall?: () => void;
  onVideoCall?: () => void;
}

/** Tablet/desktop workspace for the client ↔ designer chat thread. */
const ClientMessagesWorkspace = ({
  designerId, designerName, avatar, postThumb, messages, showTyping, input, onInput, onSend, onOpenDesigner, onAudioCall, onVideoCall,
}: Props) => (
  <div className="hidden lg:block px-8 pt-6 pb-16">
    <div className="mx-auto max-w-[1080px] grid grid-cols-[1fr_minmax(280px,320px)] gap-6 items-start">
      {/* Thread */}
      <div className="rounded-3xl bg-card border border-border flex flex-col h-[720px]">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <button onClick={onOpenDesigner} className="flex items-center gap-3">
            <div className="relative">
              <ContactAvatar seed={designerId} photoUrl={avatar} size={44} ring />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-status-completed ring-2 ring-card" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-foreground">{designerName}</p>
              <p className="text-[10px] text-status-completed font-medium">Online</p>
            </div>
          </button>
          {onAudioCall && onVideoCall && (
            <CallButtons className="ml-auto" onAudio={onAudioCall} onVideo={onVideoCall} />
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          <div className="flex items-center justify-center pb-2">
            <span className="text-[10px] text-muted-foreground bg-secondary px-4 py-1.5 rounded-full font-medium">Today</span>
          </div>
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={cn("flex", m.from === "client" ? "justify-end" : "justify-start")}
              >
                {m.from === "designer" && (
                  <div className="mr-2 mt-auto flex-shrink-0"><ContactAvatar seed={designerId} photoUrl={avatar} size={28} /></div>
                )}
                <div className={cn("max-w-[60%] px-4 py-3 rounded-2xl",
                  m.from === "client" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")}>
                  <p className="text-[13px] leading-relaxed">{m.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className={cn("text-[9px]", m.from === "client" ? "text-primary-foreground/60" : "text-muted-foreground")}>
                      {m.time}
                    </span>
                    {m.from === "client" && (
                      <CheckCheck className={cn("w-3 h-3", m.read ? "text-primary-foreground/70" : "text-primary-foreground/30")} />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {showTyping && (
            <div className="flex items-center gap-2">
              <ContactAvatar seed={designerId} photoUrl={avatar} size={28} />
              <div className="bg-secondary rounded-2xl px-4 py-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
                <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
                <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
              </div>
            </div>
          )}
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
      </div>

      {/* Side rail */}
      <div className="space-y-5">
        <div className="rounded-3xl bg-card border border-border p-6 text-center">
          <div className="mx-auto w-fit"><ContactAvatar seed={designerId} photoUrl={avatar} size={80} ring /></div>
          <p className="text-sm font-bold text-foreground mt-3">{designerName}</p>
          <p className="text-[11px] text-muted-foreground">Fashion designer</p>
          <button
            onClick={onOpenDesigner}
            className="mt-4 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
          >
            View profile
          </button>
        </div>
        {postThumb && (
          <div className="rounded-3xl bg-card border border-border p-4 flex items-center gap-3">
            <img src={postThumb} alt="" className="w-14 h-14 rounded-xl object-cover" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Replying about a Showcase post by</p>
              <p className="text-xs font-semibold text-foreground truncate">{designerName}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default ClientMessagesWorkspace;
