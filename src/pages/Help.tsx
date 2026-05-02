import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Mail, Phone, FileQuestion, BookOpen, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const faqs = [
  { q: "How do I add a new client?", a: "Tap the + tab on the bottom navigation, then choose 'Add Client'." },
  { q: "How do I upgrade my plan?", a: "Open More → Subscription and select Pro or Premium." },
  { q: "Can workers see prices?", a: "No — financial details stay hidden from workers, only tasks are shared." },
  { q: "How do I change my theme?", a: "Open More → Themes and pick from 7 curated palettes." },
  { q: "Where are my measurements saved?", a: "Open any client profile — measurements live under the Measurements tab with full history." },
];

const Help = () => {
  const navigate = useNavigate();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const contact = [
    { icon: MessageCircle, label: "Live Chat", desc: "Reply within 5 minutes", tint: "bg-primary/10 text-primary", action: () => toast.success("Connecting to support…") },
    { icon: Mail, label: "Email Support", desc: "support@fashionos.app", tint: "bg-blue-400/10 text-blue-400", action: () => toast("Opening mail client…") },
    { icon: Phone, label: "Call Us", desc: "+233 (0) 30 222 0000", tint: "bg-green-400/10 text-green-400", action: () => toast("Calling support…") },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <h1 className="text-xl font-bold text-foreground">Help & Support</h1>
      </div>

      <div className="px-5 space-y-6">
        {/* Contact channels */}
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Get in touch
          </p>
          <div className="space-y-2">
            {contact.map((c, i) => (
              <motion.button
                key={c.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={c.action}
                className="w-full card-surface p-4 flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.tint}`}>
                  <c.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-foreground">{c.label}</p>
                  <p className="text-[10px] text-muted-foreground">{c.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
            <FileQuestion className="w-3 h-3" /> Frequently asked
          </p>
          <div className="card-surface divide-y divide-border/50">
            {faqs.map((f, i) => (
              <button
                key={i}
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full p-4 text-left active:bg-secondary/30 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-foreground">{f.q}</p>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${openIdx === i ? "rotate-90" : ""}`} />
                </div>
                {openIdx === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-[11px] text-muted-foreground mt-2 leading-relaxed"
                  >
                    {f.a}
                  </motion.p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Docs */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => toast("Opening user guide…")}
          className="w-full card-surface p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">User Guide</p>
            <p className="text-[10px] text-muted-foreground">Step-by-step tutorials</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      </div>
    </div>
  );
};

export default Help;