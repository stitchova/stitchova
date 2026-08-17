import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Users, MessageCircle, Megaphone } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { useWorkshopChat } from "@/contexts/WorkshopChatContext";
import { cn } from "@/lib/utils";
import {
  DesktopOnly, WorkspaceHeader, ListDetail, ListPanel, ListRow, DetailPanel, DetailHeader, Avatar,
} from "./DesktopKit";

const time = (t: number) =>
  new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/** Designer workshop messaging workspace (conversation list + thread). */
const WorkshopWorkspace = ({ canAnnounce = true }: { canAnnounce?: boolean }) => {
  const { members, currentUserId, dmChatId, getChatMessages, sendMessage, markChatRead, unreadCountForChat } = useWorkshopChat();
  const [chatId, setChatId] = useState("group");
  const [query, setQuery] = useState("");
  const [text, setText] = useState("");
  const [announce, setAnnounce] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const conversations = useMemo(() => {
    const list = [{ chatId: "group", title: "Workshop group", subtitle: "Everyone in the atelier", initials: "WG" }];
    members
      .filter((m) => m.id !== currentUserId)
      .forEach((m) => list.push({
        chatId: dmChatId(currentUserId, m.id),
        title: m.name,
        subtitle: m.role,
        initials: m.initials,
      }));
    return list.filter((c) => `${c.title} ${c.subtitle}`.toLowerCase().includes(query.toLowerCase()));
  }, [members, currentUserId, dmChatId, query]);

  const messages = getChatMessages(chatId);
  const active = conversations.find((c) => c.chatId === chatId) || conversations[0];

  useEffect(() => { markChatRead(chatId); }, [chatId, messages.length, markChatRead]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages.length, chatId]);

  const send = () => {
    if (!text.trim()) return;
    sendMessage(chatId, text.trim(), { isAnnouncement: canAnnounce && announce && chatId === "group" });
    setText("");
    setAnnounce(false);
  };

  return (
    <DesktopOnly>
      <WorkspaceHeader
        title="Workshop"
        subtitle="Group announcements and direct messages with your team."
        query={query} onQuery={setQuery} searchPlaceholder="Search conversations…"
      />

      <ListDetail
        list={
          <ListPanel title="Conversations" count={conversations.length}>
            {conversations.map((c) => {
              const unread = unreadCountForChat(c.chatId);
              const last = getChatMessages(c.chatId).slice(-1)[0];
              return (
                <ListRow key={c.chatId} active={c.chatId === chatId} onClick={() => setChatId(c.chatId)}
                  leading={<Avatar initials={c.initials} />}
                  title={c.title}
                  meta={last ? last.text : c.subtitle}
                  pill={unread > 0 ? { label: String(unread), tone: "primary" } : undefined} />
              );
            })}
            {conversations.length === 0 && (
              <EmptyState icon={Users} title="No conversations" description="No teammates match this search." />
            )}
          </ListPanel>
        }
        detail={active ? (
          <DetailPanel id={chatId}>
            <DetailHeader
              eyebrow={chatId === "group" ? "Group chat" : "Direct message"}
              title={active.title}
              subtitle={active.subtitle}
              right={{ label: "Messages", value: String(messages.length) }}
            />

            <div className="rounded-2xl bg-secondary/30 border border-border/30 p-5 h-[440px] overflow-y-auto scrollbar-hide space-y-3">
              {messages.map((m) => {
                const mine = m.senderId === currentUserId;
                const sender = members.find((x) => x.id === m.senderId);
                return (
                  <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[65%] rounded-2xl px-4 py-2.5",
                      m.isAnnouncement ? "bg-primary/15 border border-primary/30"
                        : mine ? "bg-primary text-primary-foreground" : "bg-card border border-border/40")}>
                      {!mine && <p className="text-[10px] text-muted-foreground mb-0.5">{sender?.name || "Member"}</p>}
                      {m.isAnnouncement && (
                        <p className="text-[10px] text-primary flex items-center gap-1 mb-1">
                          <Megaphone className="w-3 h-3" /> Announcement
                        </p>
                      )}
                      <p className={cn("text-xs leading-relaxed", m.isAnnouncement && "text-foreground")}>{m.text}</p>
                      <p className={cn("text-[9px] mt-1", mine && !m.isAnnouncement ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {time(m.time)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <EmptyState icon={MessageCircle} title="No messages yet" description="Start the conversation below." />
              )}
              <div ref={endRef} />
            </div>

            <div className="flex items-center gap-3">
              {chatId === "group" && (
                <button onClick={() => setAnnounce((a) => !a)}
                  className={cn("rounded-full px-4 py-2.5 text-[11px] font-semibold border transition-colors flex items-center gap-1.5",
                    announce ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground")}>
                  <Megaphone className="w-3.5 h-3.5" /> Announcement
                </button>
              )}
              <input value={text} onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Write a message…"
                className="flex-1 bg-card border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors" />
              <motion.button whileTap={{ scale: 0.96 }} onClick={send}
                className="rounded-full bg-primary text-primary-foreground px-5 py-3 text-xs font-semibold flex items-center gap-2 glow-primary">
                <Send className="w-4 h-4" /> Send
              </motion.button>
            </div>
          </DetailPanel>
        ) : null}
      />
    </DesktopOnly>
  );
};

export default WorkshopWorkspace;
