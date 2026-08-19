import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Mic, Image, Paperclip, X, Play, Pause, Plus, Search, Phone, Video, MoreVertical, CheckCheck, Mail, MapPin, Calendar, ShoppingBag, Ruler } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

interface Message {
  id: number;
  from: "designer" | "client";
  text?: string;
  type: "text" | "voice" | "image";
  duration?: string;
  imageUrl?: string;
  time: string;
  read?: boolean;
}

interface Conversation {
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

const conversations: Conversation[] = [
  { id: "1", clientName: "Akua Mensah", clientInitials: "AM", lastMessage: "When will my dress be ready?", time: "10:30 AM", unread: 2, online: true, typing: true, phone: "+233 24 567 8901", email: "akua@email.com", location: "Accra, Ghana", totalOrders: 5, lastVisit: "Mar 28, 2025", measurements: "Updated" },
  { id: "2", clientName: "Kofi Boateng", clientInitials: "KB", lastMessage: "Thank you! The agbada looks amazing", time: "Yesterday", unread: 0, online: false, phone: "+233 20 123 4567", email: "kofi.b@email.com", location: "Kumasi, Ghana", totalOrders: 3, lastVisit: "Mar 15, 2025", measurements: "Pending" },
  { id: "3", clientName: "Esi Thompson", clientInitials: "ET", lastMessage: "Can I see fabric options?", time: "Yesterday", unread: 1, online: true, phone: "+233 27 890 1234", email: "esi.t@email.com", location: "Tema, Ghana", totalOrders: 1, lastVisit: "Mar 22, 2025", measurements: "Updated" },
  { id: "4", clientName: "Yaw Asante", clientInitials: "YA", lastMessage: "I'd like to book a fitting session", time: "Mon", unread: 0, online: false, phone: "+233 55 678 9012", email: "", location: "Takoradi, Ghana", totalOrders: 2, lastVisit: "Feb 10, 2025", measurements: "Outdated" },
  { id: "5", clientName: "Abena Darko", clientInitials: "AD", lastMessage: "Perfect, see you on Saturday!", time: "Sun", unread: 0, online: true, phone: "+233 24 345 6789", email: "abena.d@email.com", location: "Accra, Ghana", totalOrders: 8, lastVisit: "Mar 30, 2025", measurements: "Updated" },
];

const chatMessages: Message[] = [
  { id: 1, from: "client", type: "text", text: "Hi! I wanted to check on my wedding gown order.", time: "10:28 AM", read: true },
  { id: 2, from: "designer", type: "text", text: "Hello Akua! Your gown is progressing beautifully. We're currently in the beading phase.", time: "10:30 AM", read: true },
  { id: 3, from: "client", type: "text", text: "That sounds wonderful! Can I see a progress photo?", time: "10:31 AM", read: true },
  { id: 4, from: "designer", type: "image", imageUrl: "", time: "10:33 AM", read: true },
  { id: 5, from: "designer", type: "voice", duration: "0:34", time: "10:34 AM", read: true },
  { id: 6, from: "client", type: "text", text: "When will my dress be ready?", time: "10:35 AM", read: false },
];

const DesignerMessages = () => {
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(chatMessages);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showAttach, setShowAttach] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConvo = conversations.find((c) => c.id === activeChat);

  const filteredConvos = conversations.filter((c) =>
    c.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: "designer", type: "text", text: input, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), read: false },
    ]);
    setInput("");
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const mins = Math.floor(recordingTime / 60);
    const secs = recordingTime % 60;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: "designer", type: "voice", duration: `${mins}:${secs.toString().padStart(2, "0")}`, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), read: false },
    ]);
    setRecordingTime(0);
  };

  const sendImage = () => {
    setShowAttach(false);
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: "designer", type: "image", imageUrl: "", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), read: false },
    ]);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // ── CONVERSATIONS LIST ──
  if (!activeChat) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <div className="px-5 pt-6 pb-4 flex items-center gap-3 relative">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </motion.button>
            <h1 className="text-xl font-bold text-foreground flex-1">Messages</h1>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowSearch(!showSearch)}
              className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
              <Search className="w-4.5 h-4.5 text-muted-foreground" />
            </motion.button>
          </div>

          <AnimatePresence>
            {showSearch && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="px-5 pb-3 overflow-hidden">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search conversations..." autoFocus
                    className="w-full bg-card border border-border rounded-2xl py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-5 space-y-2">
          {filteredConvos.map((c, i) => (
            <motion.button key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 30 }}
              whileTap={{ scale: 0.98 }} onClick={() => setActiveChat(c.id)}
              className="w-full card-glass p-4 flex items-center gap-3.5 group">
              <div className="relative flex-shrink-0">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center" style={{ width: 52, height: 52 }}>
                  <span className="text-sm font-bold text-primary">{c.clientInitials}</span>
                </div>
                {c.online && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-status-completed ring-[3px] ring-background" />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-semibold text-foreground">{c.clientName}</p>
                  <span className="text-[10px] text-muted-foreground">{c.time}</span>
                </div>
                {c.typing ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-primary font-medium italic">typing</span>
                    <motion.div className="flex gap-0.5">
                      {[0, 1, 2].map((dot) => (
                        <motion.div key={dot} className="w-1 h-1 rounded-full bg-primary"
                          animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.2 }} />
                      ))}
                    </motion.div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
                )}
              </div>
              {c.unread > 0 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}
                  className="w-5.5 h-5.5 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
                  style={{ width: 22, height: 22 }}>
                  <span className="text-[9px] font-bold text-primary-foreground">{c.unread}</span>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // ── CHAT VIEW ──
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Chat Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-card to-transparent" />
        <div className="px-5 pt-6 pb-3 flex items-center gap-3 relative border-b border-border/50">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setActiveChat(null)}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          {/* Clickable avatar to view profile */}
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowProfile(true)} className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{activeConvo?.clientInitials}</span>
            </div>
            {activeConvo?.online && (
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-status-completed ring-2 ring-background" />
            )}
          </motion.button>
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowProfile(true)} className="flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">{activeConvo?.clientName}</p>
            <p className="text-[10px] text-muted-foreground">
              {activeConvo?.online ? <span className="text-status-completed">Online</span> : "Last seen recently"}
            </p>
          </motion.button>
          <div className="flex items-center gap-1">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => toast.info("Voice calling isn't available yet — send a WhatsApp-style message instead.")} className="w-9 h-9 rounded-xl flex items-center justify-center bg-card">
              <Phone className="w-4 h-4 text-muted-foreground" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => toast.info("Video calling isn't available yet — send a WhatsApp-style message instead.")} className="w-9 h-9 rounded-xl flex items-center justify-center bg-card">
              <Video className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-border/50" />
          <span className="text-[10px] text-muted-foreground font-medium px-2">Today</span>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        {messages.map((m, idx) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: idx * 0.03, type: "spring", stiffness: 300, damping: 30 }}
            className={`flex ${m.from === "designer" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[78%] ${m.from === "designer" ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-bl-md"} ${m.from === "designer" ? "bg-primary text-primary-foreground" : "bg-card border border-border/50 text-foreground"} overflow-hidden`}>
              {m.type === "text" && (
                <div className="px-4 py-3">
                  <p className="text-[13px] leading-relaxed">{m.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${m.from === "designer" ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                    <span className="text-[9px]">{m.time}</span>
                    {m.from === "designer" && <CheckCheck className={`w-3 h-3 ${m.read ? "text-primary-foreground/70" : "text-primary-foreground/30"}`} />}
                  </div>
                </div>
              )}
              {m.type === "voice" && (
                <div className="px-4 py-3 flex items-center gap-3">
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => setPlayingVoice(playingVoice === m.id ? null : m.id)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${m.from === "designer" ? "bg-primary-foreground/20" : "bg-secondary"}`}>
                    {playingVoice === m.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                  </motion.button>
                  <div className="flex-1">
                    <div className="flex gap-[2px] items-center h-5">
                      {Array.from({ length: 28 }, (_, i) => (
                        <motion.div key={i} className={`w-[2px] rounded-full ${m.from === "designer" ? "bg-primary-foreground/40" : "bg-muted-foreground/30"}`}
                          style={{ height: `${Math.random() * 16 + 4}px` }}
                          animate={playingVoice === m.id ? { opacity: [0.4, 1, 0.4] } : {}}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.03 }} />
                      ))}
                    </div>
                    <div className={`flex items-center justify-between mt-1 ${m.from === "designer" ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                      <span className="text-[9px]">{m.duration}</span>
                      <span className="text-[9px]">{m.time}</span>
                    </div>
                  </div>
                </div>
              )}
              {m.type === "image" && (
                <div className="p-1.5">
                  <div className="w-52 h-40 rounded-xl bg-secondary/50 flex items-center justify-center overflow-hidden">
                    <div className="text-center">
                      <Image className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                      <span className="text-[10px] text-muted-foreground/50 mt-1 block">Photo</span>
                    </div>
                  </div>
                  <div className={`flex items-center justify-end gap-1 px-2 py-1 ${m.from === "designer" ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                    <span className="text-[9px]">{m.time}</span>
                    {m.from === "designer" && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Menu */}
      <AnimatePresence>
        {showAttach && (
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="px-5 pb-2">
            <div className="card-glass p-4 flex gap-5 justify-center">
              {[
                { icon: Image, label: "Photo", action: sendImage, color: "from-primary/20 to-primary/5" },
                { icon: Paperclip, label: "File", action: () => setShowAttach(false), color: "from-status-completed/20 to-status-completed/5" },
              ].map((a) => (
                <motion.button key={a.label} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={a.action}
                  className="flex flex-col items-center gap-2">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center`}>
                    <a.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">{a.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Bar */}
      <div className="px-4 py-3 border-t border-border/30 safe-bottom bg-card/50 backdrop-blur-xl">
        {isRecording ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-2xl px-4 py-3">
              <motion.div className="w-3 h-3 rounded-full bg-destructive" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
              <span className="text-sm text-foreground font-semibold">{formatTime(recordingTime)}</span>
              <div className="flex-1 flex gap-[2px] items-center">
                {Array.from({ length: 35 }, (_, i) => (
                  <motion.div key={i} className="w-[2px] rounded-full bg-destructive/40"
                    animate={{ height: [`${Math.random() * 10 + 4}px`, `${Math.random() * 18 + 4}px`] }}
                    transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse", delay: i * 0.02 }} />
                ))}
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setIsRecording(false); if (timerRef.current) clearInterval(timerRef.current); setRecordingTime(0); }}>
              <X className="w-5 h-5 text-muted-foreground" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={stopRecording}
              className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Send className="w-4.5 h-4.5 text-primary-foreground" />
            </motion.button>
          </motion.div>
        ) : (
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => setShowAttach(!showAttach)}
              className="w-10 h-10 rounded-xl bg-card flex items-center justify-center flex-shrink-0">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </motion.button>
            <div className="flex-1 relative">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Type a message…"
                className="w-full bg-card border border-border/50 rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/40 transition-all" />
            </div>
            {input.trim() ? (
              <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileTap={{ scale: 0.9 }} onClick={sendMessage}
                className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
                <Send className="w-4.5 h-4.5 text-primary-foreground" />
              </motion.button>
            ) : (
              <motion.button whileTap={{ scale: 0.9 }} onPointerDown={startRecording}
                className="w-11 h-11 rounded-xl bg-card border border-border/50 flex items-center justify-center flex-shrink-0">
                <Mic className="w-5 h-5 text-foreground" />
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Client Profile Sheet */}
      <Sheet open={showProfile} onOpenChange={setShowProfile}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-background border-border p-0 overflow-y-auto">
          <div className="relative">
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent pt-12 pb-6 px-6 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/10">
                <span className="text-2xl font-bold text-primary">{activeConvo?.clientInitials}</span>
              </div>
              <h2 className="text-lg font-bold text-foreground">{activeConvo?.clientName}</h2>
              <p className="text-xs text-muted-foreground mt-1">{activeConvo?.online ? "🟢 Online now" : "Last seen recently"}</p>
            </div>

            {/* Quick Actions */}
            <div className="px-6 py-4 grid grid-cols-3 gap-3">
              {[
                { icon: Phone, label: "Call", action: () => {} },
                { icon: Video, label: "Video", action: () => {} },
                { icon: Mail, label: "Email", action: () => {} },
              ].map((a) => (
                <motion.button key={a.label} whileTap={{ scale: 0.95 }} onClick={a.action}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-card hover:bg-secondary transition-colors">
                  <a.icon className="w-5 h-5 text-primary" />
                  <span className="text-[10px] font-medium text-muted-foreground">{a.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Client Details */}
            <div className="px-6 space-y-3 pb-6">
              <p className="text-xs font-semibold text-foreground mb-2">Client Details</p>
              {[
                { icon: Phone, label: "Phone", value: activeConvo?.phone },
                { icon: Mail, label: "Email", value: activeConvo?.email || "Not provided" },
                { icon: MapPin, label: "Location", value: activeConvo?.location },
                { icon: ShoppingBag, label: "Total Orders", value: `${activeConvo?.totalOrders} orders` },
                { icon: Calendar, label: "Last Visit", value: activeConvo?.lastVisit },
                { icon: Ruler, label: "Measurements", value: activeConvo?.measurements },
              ].map((d) => (
                <div key={d.label} className="flex items-center gap-3 p-3 rounded-xl bg-card">
                  <d.icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground">{d.label}</p>
                    <p className="text-xs font-medium text-foreground truncate">{d.value}</p>
                  </div>
                </div>
              ))}

              <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setShowProfile(false); navigate("/clients"); }}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold mt-4 shadow-lg shadow-primary/20">
                View Full Profile
              </motion.button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DesignerMessages;
