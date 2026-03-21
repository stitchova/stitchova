import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import designerAvatar1 from "@/assets/designer-avatar-1.jpg";
import designerAvatar2 from "@/assets/designer-avatar-2.jpg";
import designerAvatar3 from "@/assets/designer-avatar-3.jpg";

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

  const initialMessages = [
    { id: 1, from: "designer", text: "Hello! Thank you for your interest. How can I help you today?", time: "10:30 AM" },
    { id: 2, from: "client", text: "Hi! I'm looking for a custom wedding gown. Do you have availability in April?", time: "10:32 AM" },
    { id: 3, from: "designer", text: "Yes, I have a slot opening April 2nd. Would you like to book a consultation to discuss your vision?", time: "10:33 AM" },
  ];

  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: "client", text: input, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-3 flex items-center gap-3 border-b border-border">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <img src={avatar} alt="Designer" className="w-9 h-9 rounded-full object-cover" />
        <div>
          <p className="text-sm font-semibold text-foreground">{designerName}</p>
          <p className="text-[10px] text-muted-foreground">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.from === "client" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
              m.from === "client"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-secondary text-foreground rounded-bl-md"
            }`}>
              <p className="text-[12px] leading-relaxed">{m.text}</p>
              <p className={`text-[8px] mt-1 ${m.from === "client" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{m.time}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-border safe-bottom">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message…"
            className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={send}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Messages;
