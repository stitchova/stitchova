import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Megaphone, Search, UserPlus, Users, Trash2, Pin, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { useWorkshopChat, WorkshopMember } from "@/contexts/WorkshopChatContext";
import { useToast } from "@/hooks/use-toast";
import EmptyState from "@/components/EmptyState";
import WorkshopWorkspace from "@/components/designer-desktop/WorkshopWorkspace";

const ease = [0.16, 1, 0.3, 1];

const formatTime = (t: number) => {
  const d = new Date(t);
  const today = new Date();
  if (d.toDateString() === today.toDateString())
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const WorkshopChat = () => {
  const navigate = useNavigate();
  const { role } = useRole();
  const { toast } = useToast();
  const {
    members,
    messages,
    pinnedAnnouncementId,
    currentUserId,
    setCurrentUserId,
    addMember,
    removeMember,
    dmChatId,
    unreadCountForChat,
    getChatMessages,
  } = useWorkshopChat();

  // Sync current user with role (designers act as designer; workers act as a default worker)
  useEffect(() => {
    if (role === "designer" && currentUserId !== "designer") setCurrentUserId("designer");
    if (role === "worker" && currentUserId === "designer") setCurrentUserId("w-tunde");
  }, [role, currentUserId, setCurrentUserId]);

  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Tailor");

  const isDesigner = role === "designer";
  const me = members.find((m) => m.id === currentUserId);

  const pinned = useMemo(
    () => messages.find((m) => m.id === pinnedAnnouncementId),
    [messages, pinnedAnnouncementId]
  );

  // Build the conversation list
  const conversations = useMemo(() => {
    const list: { id: string; chatId: string; title: string; subtitle: string; initials: string; isGroup?: boolean; isAnnouncement?: boolean; member?: WorkshopMember }[] = [];

    list.push({
      id: "group", chatId: "group", title: "Workshop Group",
      subtitle: `${members.length} members`, initials: "WS", isGroup: true,
    });

    const others = members.filter((m) => m.id !== currentUserId);
    others.forEach((m) => {
      list.push({
        id: m.id,
        chatId: dmChatId(currentUserId, m.id),
        title: m.name,
        subtitle: m.role,
        initials: m.initials,
        member: m,
      });
    });
    return list.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));
  }, [members, currentUserId, dmChatId, search]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const id = `w-${newName.trim().toLowerCase().replace(/\s+/g, "-")}-${Math.random().toString(36).slice(2, 5)}`;
    const initials = newName.trim().split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
    addMember({ id, name: newName.trim(), role: newRole, initials });
    toast({ title: "Worker added", description: `${newName} joined the workshop chat.` });
    setNewName("");
    setShowAdd(false);
  };

  const handleRemove = (m: WorkshopMember) => {
    if (m.isDesigner) return;
    removeMember(m.id);
    toast({ title: "Worker removed", description: `${m.name} no longer has access.` });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease }}
        className="px-5 pt-6 pb-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Workshop Chat</h1>
            <p className="text-[11px] text-muted-foreground">
              Signed in as <span className="text-foreground font-medium">{me?.name}</span>
            </p>
          </div>
        </div>
        {isDesigner && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowAdd(true)}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <UserPlus className="w-4 h-4 text-primary-foreground" />
          </motion.button>
        )}
      </motion.div>

      {/* Pinned Announcement */}
      {pinned && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate(`/workshop-chat/${pinned.chatId}`)}
          className="mx-5 mb-3 w-[calc(100%-2.5rem)] glass-card p-3 rounded-2xl flex items-start gap-3 text-left border border-primary/30"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Pin className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-primary font-bold">Pinned announcement</p>
            <p className="text-xs text-foreground line-clamp-2 mt-0.5">{pinned.text}</p>
          </div>
        </motion.button>
      )}

      {/* Search */}
      <div className="px-5 mb-3">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="w-full glass-input pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      {/* Quick action: announcements composer entry */}
      {isDesigner && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/workshop-chat/group?announce=1")}
          className="mx-5 mb-3 w-[calc(100%-2.5rem)] flex items-center gap-3 glass-card p-3 rounded-2xl"
        >
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
            <Megaphone className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-semibold text-foreground">Make an announcement</p>
            <p className="text-[10px] text-muted-foreground">Pinned for the whole workshop</p>
          </div>
        </motion.button>
      )}

      {/* Conversation list */}
      <div className="px-5 space-y-2">
        {conversations.length === 0 && (
          <EmptyState
            icon={MessageCircle}
            title="No conversations"
            description="Try a different search."
          />
        )}
        <AnimatePresence>
          {conversations.map((c, i) => {
            const chatMsgs = getChatMessages(c.chatId);
            const last = chatMsgs[chatMsgs.length - 1];
            const unread = unreadCountForChat(c.chatId);
            return (
              <motion.div
                key={c.chatId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: i * 0.03, ease }}
                className="relative"
              >
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/workshop-chat/${c.chatId}`)}
                  className="w-full glass-card p-3 rounded-2xl flex items-center gap-3 text-left"
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                    c.isGroup ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}>
                    {c.isGroup ? <Users className="w-5 h-5" /> : c.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{c.title}</p>
                      <p className="text-[10px] text-muted-foreground flex-shrink-0">
                        {last ? formatTime(last.time) : ""}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-[11px] text-muted-foreground truncate">
                        {last ? last.text : c.subtitle}
                      </p>
                      {unread > 0 && (
                        <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full min-w-[18px] h-[18px] px-1.5 flex items-center justify-center flex-shrink-0">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
                {/* Designer remove button on DMs to workers */}
                {isDesigner && c.member && !c.member.isDesigner && (
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => { e.stopPropagation(); handleRemove(c.member!); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center"
                    aria-label={`Remove ${c.member.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add worker dialog */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-background/60 backdrop-blur-sm"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ duration: 0.3, ease }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md glass-card rounded-t-3xl p-6 space-y-4 mx-auto"
            >
              <h3 className="text-lg font-bold text-foreground">Add Worker</h3>
              <p className="text-xs text-muted-foreground">They'll get access to the workshop chat instantly.</p>
              <div className="space-y-3">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Full name"
                  className="w-full glass-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 text-sm text-foreground outline-none"
                >
                  {["Tailor", "Cutter", "Beader", "Finisher", "Pattern Maker", "Apprentice"].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-3 rounded-xl glass-card text-sm font-semibold text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim()}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
                >
                  Add Worker
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkshopChat;