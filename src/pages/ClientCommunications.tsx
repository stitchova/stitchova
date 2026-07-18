import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, MessageSquare, Download, Clock, CheckCircle2, Bell, Sparkles, Edit3, Send, X } from "lucide-react";
import { useNotifications, downloadMessagePreview, NotifTriggerKey, NotifChannel } from "@/contexts/NotificationsContext";
import { useBrandInvoice } from "@/contexts/BrandInvoiceContext";
import FeatureGate from "@/components/FeatureGate";
import { toast } from "sonner";

const tabs = ["Automation", "Sent Log", "Compose"] as const;
type Tab = typeof tabs[number];

const tokenHelp = "{client} {brand} {garment} {stage} {balance} {date}";

const ClientCommunications = () => {
  const navigate = useNavigate();
  const { templates, log, updateTemplate, send } = useNotifications();
  const { brand } = useBrandInvoice();
  const [tab, setTab] = useState<Tab>("Automation");
  const [editing, setEditing] = useState<NotifTriggerKey | null>(null);

  const editingTpl = useMemo(() => templates.find(t => t.key === editing), [editing, templates]);

  // compose form
  const [composeKey, setComposeKey] = useState<NotifTriggerKey>("custom");
  const [composeClient, setComposeClient] = useState("");
  const [composeContact, setComposeContact] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeChannels, setComposeChannels] = useState<NotifChannel[]>(["sms", "email"]);
  const [scheduleAt, setScheduleAt] = useState("");

  const handleSendCompose = () => {
    if (!composeClient.trim() || !composeBody.trim()) {
      toast.error("Client name and message required"); return;
    }
    // temp inject text into the "custom" template
    updateTemplate("custom", { enabled: true, channels: composeChannels, subject: composeSubject || "{brand}", body: composeBody });
    const scheduledFor = scheduleAt ? new Date(scheduleAt).getTime() : undefined;
    const recs = send({
      key: "custom",
      clientName: composeClient.trim(),
      clientContact: composeContact.trim() || "—",
      brandName: brand.businessName,
      channels: composeChannels,
      scheduledFor,
    });
    if (recs.length) {
      toast.success(scheduledFor ? `Scheduled ${recs.length} message(s)` : `Sent ${recs.length} message(s) as ${brand.businessName}`);
      setComposeClient(""); setComposeContact(""); setComposeSubject(""); setComposeBody(""); setScheduleAt("");
      setTab("Sent Log");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">Client Communications</h1>
          <p className="text-[11px] text-muted-foreground">Automated & scheduled SMS + email — sent as <span className="text-primary font-semibold">{brand.businessName}</span></p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[9px] font-bold text-primary uppercase">Premium+</span>
        </div>
      </div>

      <FeatureGate requiredPlan="premium_plus" feature="Automated client SMS & email">
        <div className="px-5">
          {/* Tabs */}
          <div className="flex gap-1 glass-card p-1.5 relative mb-5">
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl relative z-10 transition-colors"
                style={{ color: tab === t ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))" }}>
                {t}
                {tab === t && (
                  <motion.div layoutId="comms-tab" className="absolute inset-0 bg-primary rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === "Automation" && (
              <motion.div key="a" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                <p className="text-[11px] text-muted-foreground px-1">Toggle events to auto-notify clients in your brand name.</p>
                {templates.filter(t => t.key !== "custom").map((t) => (
                  <div key={t.key} className="card-surface p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{t.label}</p>
                        <div className="flex gap-1.5 mt-1">
                          {t.channels.includes("sms") && <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1"><MessageSquare className="w-2.5 h-2.5" />SMS</span>}
                          {t.channels.includes("whatsapp") && <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center gap-1"><MessageSquare className="w-2.5 h-2.5" />WhatsApp</span>}
                          {t.channels.includes("email") && <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary text-foreground flex items-center gap-1"><Mail className="w-2.5 h-2.5" />Email</span>}
                          {t.autoSchedule && t.autoSchedule !== "immediate" && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{t.autoSchedule.replace("_", " ")}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => updateTemplate(t.key, { enabled: !t.enabled })}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors ${t.enabled ? "bg-primary" : "bg-secondary"}`}>
                        <motion.div animate={{ x: t.enabled ? 20 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="w-5 h-5 rounded-full bg-foreground" />
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2 italic">"{t.body}"</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => setEditing(t.key)}
                        className="flex-1 text-[11px] font-semibold py-2 rounded-lg bg-secondary text-foreground flex items-center justify-center gap-1">
                        <Edit3 className="w-3 h-3" /> Edit template
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {tab === "Sent Log" && (
              <motion.div key="l" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                {log.length === 0 && (
                  <div className="card-surface p-8 text-center">
                    <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-semibold text-foreground">No messages yet</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Trigger a stage update or send from Compose.</p>
                  </div>
                )}
                {log.map((r) => (
                  <div key={r.id} className="card-surface p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {r.channel === "email" ? <Mail className="w-3.5 h-3.5 text-primary" /> : <MessageSquare className={`w-3.5 h-3.5 ${r.channel === "whatsapp" ? "text-emerald-500" : "text-primary"}`} />}
                        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">{r.channel}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full ${r.status === "sent" ? "bg-status-completed/10 text-status-completed" : r.status === "scheduled" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                          {r.status === "sent" && <CheckCircle2 className="inline w-2.5 h-2.5 mr-0.5" />}
                          {r.status === "scheduled" && <Clock className="inline w-2.5 h-2.5 mr-0.5" />}
                          {r.status}
                        </span>
                      </div>
                      <span className="text-[9px] text-muted-foreground">{new Date(r.sentAt).toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">From <span className="text-primary font-semibold">{r.brandName}</span> · To <span className="text-foreground">{r.clientName}</span> ({r.clientContact})</p>
                    {r.channel === "email" && <p className="text-xs font-semibold text-foreground mt-2">{r.subject}</p>}
                    <p className="text-[11px] text-foreground mt-1 leading-relaxed">{r.body}</p>
                    <button onClick={() => downloadMessagePreview(r)}
                      className="mt-3 text-[10px] font-semibold text-primary flex items-center gap-1">
                      <Download className="w-3 h-3" /> Download preview (.txt)
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            {tab === "Compose" && (
              <motion.div key="c" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                <div className="card-surface p-4 space-y-3">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Client name</label>
                    <input value={composeClient} onChange={e => setComposeClient(e.target.value)} placeholder="e.g. Ama Serwaa"
                      className="w-full mt-1 bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Phone or email</label>
                    <input value={composeContact} onChange={e => setComposeContact(e.target.value)} placeholder="053 000 0000 / name@mail.com"
                      className="w-full mt-1 bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground outline-none" />
                  </div>
                  <div className="flex gap-2">
                    {(["sms", "whatsapp", "email"] as NotifChannel[]).map(ch => {
                      const active = composeChannels.includes(ch);
                      return (
                        <button key={ch} onClick={() => setComposeChannels(c => active ? c.filter(x => x !== ch) : [...c, ch])}
                          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                          {ch === "email" ? <Mail className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />} {ch.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                  {composeChannels.includes("email") && (
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">Email subject</label>
                      <input value={composeSubject} onChange={e => setComposeSubject(e.target.value)} placeholder="{brand}: update on your outfit"
                        className="w-full mt-1 bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground outline-none" />
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Message</label>
                    <textarea rows={5} value={composeBody} onChange={e => setComposeBody(e.target.value)}
                      placeholder={`Hi {client}, your outfit at ${brand.businessName} is progressing well...`}
                      className="w-full mt-1 bg-secondary rounded-xl px-4 py-3 text-sm text-foreground outline-none resize-none" />
                    <p className="text-[9px] text-muted-foreground mt-1">Tokens: {tokenHelp}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Schedule for (optional)</label>
                    <input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)}
                      className="w-full mt-1 bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground outline-none" />
                  </div>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleSendCompose}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> {scheduleAt ? "Schedule" : "Send now"}
                  </motion.button>
                  <p className="text-[10px] text-muted-foreground text-center">Delivered under <span className="text-primary font-semibold">{brand.businessName}</span>, not the platform.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Edit template sheet */}
        <AnimatePresence>
          {editingTpl && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end justify-center"
              onClick={() => setEditing(null)}>
              <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-card rounded-t-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">{editingTpl.label}</h3>
                  <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <X className="w-4 h-4 text-foreground" />
                  </button>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Email subject</label>
                  <input value={editingTpl.subject}
                    onChange={e => updateTemplate(editingTpl.key, { subject: e.target.value })}
                    className="w-full mt-1 bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Message body</label>
                  <textarea rows={5} value={editingTpl.body}
                    onChange={e => updateTemplate(editingTpl.key, { body: e.target.value })}
                    className="w-full mt-1 bg-secondary rounded-xl px-4 py-3 text-sm text-foreground outline-none resize-none" />
                  <p className="text-[9px] text-muted-foreground mt-1">Tokens: {tokenHelp}</p>
                </div>
                <div className="flex gap-2">
                  {(["sms", "whatsapp", "email"] as NotifChannel[]).map(ch => {
                    const active = editingTpl.channels.includes(ch);
                    return (
                      <button key={ch}
                        onClick={() => updateTemplate(editingTpl.key, {
                          channels: active ? editingTpl.channels.filter(c => c !== ch) : [...editingTpl.channels, ch],
                        })}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                        {ch.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => { setEditing(null); toast.success("Template saved"); }}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold">Done</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </FeatureGate>
    </div>
  );
};

export default ClientCommunications;