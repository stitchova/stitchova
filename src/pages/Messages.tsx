import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Image, Mic, CheckCheck, Paperclip } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import designerAvatar1 from "@/assets/designer-avatar-1.jpg";
import designerAvatar2 from "@/assets/designer-avatar-2.jpg";
import designerAvatar3 from "@/assets/designer-avatar-3.jpg";

const ease = [0.16, 1, 0.3, 1];

const designerAvatars: Record<string, string> = {
  "nana-ama": designerAvatar1,
  "kwame-styles": designerAvatar2,
  "efya-designs": designerAvatar3,
};

const Messages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const designerId = searchParams.get("designer") || "nana-ama";
  const designerName = searchParams.get("name") || "Nana Ama Couture";
  const avatar = designerAvatars[designerId] || designerAvatar1;
  const prefill = searchParams.get("prefill") || "";
  const postThumb = searchParams.get("postThumb") || "";

  const initialMessages = [
    { id: 1, from: "designer", text: "Hello! Thank you for your interest. How can I help you today?", time: "10:30 AM", read: true },
    { id: 2, from: "client", text: "Hi! I'm looking for a custom wedding gown. Do you have availability in April?", time: "10:32 AM", read: true },
    { id: 3, from: "designer", text: "Yes, I have a slot opening April 2nd. Would you like to book a consultation to discuss your vision?", time: "10:33 AM", read: true },
  ];

  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  useEffect(() => { if (prefill) setInput(prefill); }, [prefill]);
  const [showTyping, setShowTyping] = useState(false);
  const [showAttach, setShowAttach] = useState(false);

  const send = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now(),
      from: "client",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    // Simulate typing + reply
    setShowTyping(true);
    setTimeout(() => {
      setShowTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "designer",
          text: "Thank you for your message! I'll get back to you shortly with more details. 😊",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          read: true,
        },
      ]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease }}
        className="px-5 pt-5 pb-3 flex items-center gap-3 glass-card rounded-none border-t-0 border-x-0"
      >
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/designer/${designerId}`)}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <img src={avatar} alt="Designer" className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 ring-2 ring-background" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-foreground">{designerName}</p>
            <p className="text-[10px] text-green-400 font-medium">Online</p>
          </div>
        </motion.button>
      </motion.div>

      {postThumb && (
        <div className="mx-5 mt-3 card-glass p-3 flex items-center gap-3">
          <img src={postThumb} alt="" className="w-12 h-12 rounded-lg object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground">Replying about a Showcase post by</p>
            <p className="text-xs font-semibold text-foreground truncate">{designerName}</p>
          </div>
        </div>
      )}

      {/* Date Divider */}
      <div className="flex items-center justify-center py-4">
        <div className="text-[10px] text-muted-foreground glass-card px-4 py-1.5 rounded-full font-medium">Today</div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3">
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease }}
              className={`flex ${m.from === "client" ? "justify-end" : "justify-start"}`}
            >
              {m.from === "designer" && (
                <img src={avatar} alt="" className="w-7 h-7 rounded-full object-cover mr-2 mt-auto flex-shrink-0" />
              )}
              <div
                className={`max-w-[75%] px-4 py-3 ${
                  m.from === "client"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md shadow-lg shadow-primary/10"
                    : "glass-card rounded-2xl rounded-bl-md"
                }`}
              >
                <p className="text-[12px] leading-relaxed">{m.text}</p>
                <div className={`flex items-center justify-end gap-1 mt-1`}>
                  <p className={`text-[8px] ${m.from === "client" ? "text-primary-foreground/50" : "text-muted-foreground"}`}>{m.time}</p>
                  {m.from === "client" && (
                    <CheckCheck className={`w-3 h-3 ${m.read ? "text-primary-foreground/70" : "text-primary-foreground/30"}`} />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {showTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-2"
            >
              <img src={avatar} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
              <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Attachment Menu */}
      <AnimatePresence>
        {showAttach && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease }}
            className="overflow-hidden border-t border-border/20"
          >
            <div className="px-5 py-3 flex gap-4">
              {[
                { icon: Image, label: "Photo", color: "text-green-400" },
                { icon: Mic, label: "Voice", color: "text-primary" },
              ].map((a) => (
                <button key={a.label} className="flex flex-col items-center gap-1.5">
                  <div className="w-11 h-11 rounded-full glass-card flex items-center justify-center">
                    <a.icon className={`w-5 h-5 ${a.color}`} />
                  </div>
                  <span className="text-[9px] text-muted-foreground font-medium">{a.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="px-5 py-3 glass-card rounded-none border-b-0 border-x-0 safe-bottom">
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAttach(!showAttach)}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center flex-shrink-0"
          >
            <Paperclip className="w-4 h-4 text-muted-foreground" />
          </motion.button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message…"
            className="flex-1 bg-transparent glass-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            onClick={send}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Messages;
