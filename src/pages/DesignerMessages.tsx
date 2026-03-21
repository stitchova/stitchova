import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Mic, Image, Paperclip, X, Play, Pause, Plus, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import designerAvatar1 from "@/assets/designer-avatar-1.jpg";

interface Message {
  id: number;
  from: "designer" | "client";
  text?: string;
  type: "text" | "voice" | "image";
  duration?: string;
  imageUrl?: string;
  time: string;
}

interface Conversation {
  id: string;
  clientName: string;
  clientInitials: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

const conversations: Conversation[] = [
  { id: "1", clientName: "Akua Mensah", clientInitials: "AM", lastMessage: "When will my dress be ready?", time: "10:30 AM", unread: 2, online: true },
  { id: "2", clientName: "Kofi Boateng", clientInitials: "KB", lastMessage: "Thank you! The agbada looks amazing", time: "Yesterday", unread: 0, online: false },
  { id: "3", clientName: "Esi Thompson", clientInitials: "ET", lastMessage: "Can I see fabric options?", time: "Yesterday", unread: 1, online: true },
  { id: "4", clientName: "Yaw Asante", clientInitials: "YA", lastMessage: "I'd like to book a fitting session", time: "Mon", unread: 0, online: false },
];

const chatMessages: Message[] = [
  { id: 1, from: "client", type: "text", text: "Hi! I wanted to check on my wedding gown order.", time: "10:28 AM" },
  { id: 2, from: "designer", type: "text", text: "Hello Akua! Your gown is progressing beautifully. We're currently in the beading phase.", time: "10:30 AM" },
  { id: 3, from: "client", type: "text", text: "That sounds wonderful! Can I see a progress photo?", time: "10:31 AM" },
  { id: 4, from: "designer", type: "image", imageUrl: "", time: "10:33 AM" },
  { id: 5, from: "designer", type: "voice", duration: "0:34", time: "10:34 AM" },
  { id: 6, from: "client", type: "text", text: "When will my dress be ready?", time: "10:35 AM" },
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeConvo = conversations.find((c) => c.id === activeChat);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: "designer", type: "text", text: input, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
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
      { id: Date.now(), from: "designer", type: "voice", duration: `${mins}:${secs.toString().padStart(2, "0")}`, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setRecordingTime(0);
  };

  const sendImage = () => {
    setShowAttach(false);
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: "designer", type: "image", imageUrl: "", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ]);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // Conversations List
  if (!activeChat) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-5 pt-6 pb-4 flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <h1 className="text-xl font-bold text-foreground">Messages</h1>
        </div>

        <div className="px-5 space-y-2">
          {conversations.map((c, i) => (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveChat(c.id)}
              className="w-full card-surface p-4 flex items-center gap-3"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-sm font-semibold text-foreground">{c.clientInitials}</span>
                </div>
                {c.online && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-status-completed ring-2 ring-card" />}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{c.clientName}</p>
                  <span className="text-[10px] text-muted-foreground">{c.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastMessage}</p>
              </div>
              {c.unread > 0 && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-[9px] font-bold text-primary-foreground">{c.unread}</span>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Chat View
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-3 flex items-center gap-3 border-b border-border">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setActiveChat(null)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-xs font-semibold text-foreground">{activeConvo?.clientInitials}</span>
          </div>
          {activeConvo?.online && <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-status-completed ring-2 ring-background" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{activeConvo?.clientName}</p>
          <p className="text-[10px] text-muted-foreground">{activeConvo?.online ? "Online" : "Offline"}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.from === "designer" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[75%] rounded-2xl ${
              m.from === "designer"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-secondary text-foreground rounded-bl-md"
            }`}>
              {m.type === "text" && (
                <div className="px-4 py-2.5">
                  <p className="text-[12px] leading-relaxed">{m.text}</p>
                  <p className={`text-[8px] mt-1 ${m.from === "designer" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{m.time}</p>
                </div>
              )}

              {m.type === "voice" && (
                <div className="px-4 py-2.5 flex items-center gap-3">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setPlayingVoice(playingVoice === m.id ? null : m.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      m.from === "designer" ? "bg-primary-foreground/20" : "bg-card"
                    }`}
                  >
                    {playingVoice === m.id ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5 ml-0.5" />
                    )}
                  </motion.button>
                  <div className="flex-1">
                    <div className="flex gap-0.5 items-center h-4">
                      {Array.from({ length: 20 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full ${m.from === "designer" ? "bg-primary-foreground/40" : "bg-muted-foreground/40"}`}
                          style={{ height: `${Math.random() * 14 + 4}px` }}
                        />
                      ))}
                    </div>
                    <p className={`text-[9px] mt-1 ${m.from === "designer" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {m.duration} · {m.time}
                    </p>
                  </div>
                </div>
              )}

              {m.type === "image" && (
                <div className="p-1.5">
                  <div className="w-48 h-36 rounded-xl bg-secondary/50 flex items-center justify-center">
                    <Image className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <p className={`text-[8px] mt-1 px-2 pb-1 ${m.from === "designer" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{m.time}</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Attachment Menu */}
      <AnimatePresence>
        {showAttach && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-5 pb-2"
          >
            <div className="card-surface p-3 flex gap-4 justify-center">
              {[
                { icon: Image, label: "Photo", action: sendImage },
                { icon: Paperclip, label: "File", action: () => setShowAttach(false) },
              ].map((a) => (
                <motion.button
                  key={a.label}
                  whileTap={{ scale: 0.9 }}
                  onClick={a.action}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <a.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-[9px] text-muted-foreground">{a.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="px-5 py-3 border-t border-border safe-bottom">
        {isRecording ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 bg-destructive/10 rounded-xl px-4 py-2.5">
              <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
              <span className="text-sm text-foreground font-medium">{formatTime(recordingTime)}</span>
              <div className="flex-1 flex gap-0.5 items-center">
                {Array.from({ length: 30 }, (_, i) => (
                  <div key={i} className="w-0.5 rounded-full bg-destructive/40" style={{ height: `${Math.random() * 16 + 4}px` }} />
                ))}
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setIsRecording(false); if (timerRef.current) clearInterval(timerRef.current); setRecordingTime(0); }}>
              <X className="w-5 h-5 text-muted-foreground" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={stopRecording}
              className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"
            >
              <Send className="w-4 h-4 text-primary-foreground" />
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowAttach(!showAttach)}>
              <Plus className="w-5 h-5 text-muted-foreground" />
            </motion.button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message…"
              className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            {input.trim() ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={sendMessage}
                className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"
              >
                <Send className="w-4 h-4 text-primary-foreground" />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onPointerDown={startRecording}
                className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
              >
                <Mic className="w-4 h-4 text-foreground" />
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignerMessages;
