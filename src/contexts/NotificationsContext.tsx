import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type NotifChannel = "email" | "sms" | "whatsapp";
export type NotifStatus = "sent" | "scheduled" | "failed";
export type NotifTriggerKey =
  | "stage_cutting"
  | "stage_sewing"
  | "stage_beading"
  | "stage_finishing"
  | "stage_quality"
  | "completed"
  | "received"
  | "appointment_reminder"
  | "payment_reminder"
  | "materials_reminder"
  | "materials_dropped"
  | "custom";

export interface NotifTemplate {
  key: NotifTriggerKey;
  label: string;
  channels: NotifChannel[];
  enabled: boolean;
  subject: string;   // used for email
  body: string;      // supports {client} {brand} {garment} {stage} {balance} {date}
  autoSchedule?: string; // e.g. "immediate", "1h_before", "24h_before"
}

export interface NotifRecord {
  id: string;
  key: NotifTriggerKey;
  channel: NotifChannel;
  status: NotifStatus;
  clientName: string;
  clientContact: string; // email or phone
  brandName: string;
  subject: string;
  body: string;
  sentAt: number;
  scheduledFor?: number;
  orderRef?: string;
}

const DEFAULT_TEMPLATES: NotifTemplate[] = [
  { key: "stage_cutting",  label: "Cutting started",   channels: ["sms", "email"], enabled: true,
    subject: "{brand}: Your {garment} is now in cutting",
    body: "Hi {client}, great news — your {garment} has just entered the CUTTING stage at {brand}. We'll keep you posted at every step. — {brand}",
    autoSchedule: "immediate" },
  { key: "stage_sewing",   label: "Sewing started",    channels: ["sms", "email"], enabled: true,
    subject: "{brand}: Sewing has begun on your {garment}",
    body: "Hi {client}, your {garment} is now being SEWN. Every stitch made with care. — {brand}",
    autoSchedule: "immediate" },
  { key: "stage_beading",  label: "Beading / detailing", channels: ["sms"], enabled: true,
    subject: "{brand}: Detailing your {garment}",
    body: "Hi {client}, the beading and detailing on your {garment} has started. — {brand}",
    autoSchedule: "immediate" },
  { key: "stage_finishing",label: "Finishing stage",   channels: ["sms", "email"], enabled: true,
    subject: "{brand}: Almost done — final touches",
    body: "Hi {client}, your {garment} is in the FINISHING stage. Nearly ready! — {brand}",
    autoSchedule: "immediate" },
  { key: "stage_quality",  label: "Quality check",     channels: ["email"],       enabled: true,
    subject: "{brand}: Quality check in progress",
    body: "Hi {client}, we're doing a final quality check on your {garment} before it's ready for pickup. — {brand}",
    autoSchedule: "immediate" },
  { key: "completed",      label: "Outfit completed",  channels: ["sms", "email"], enabled: true,
    subject: "{brand}: Your {garment} is ready!",
    body: "Hi {client}, exciting news — your {garment} is COMPLETE and ready for pickup at {brand}. Please arrange a time to collect. Balance due: {balance}. — {brand}",
    autoSchedule: "immediate" },
  { key: "received",       label: "Outfit received",   channels: ["sms", "email"], enabled: true,
    subject: "{brand}: Thank you for collecting your {garment}",
    body: "Hi {client}, thank you for picking up your {garment}. We hope you love it! We'd truly appreciate a quick review. — {brand}",
    autoSchedule: "immediate" },
  { key: "appointment_reminder", label: "Appointment reminder", channels: ["sms", "whatsapp"], enabled: true,
    subject: "{brand}: Reminder for your appointment",
    body: "Hi {client}, this is a reminder of your appointment with {brand} on {date}. See you soon!",
    autoSchedule: "24h_before" },
  { key: "payment_reminder", label: "Payment reminder", channels: ["sms", "email"], enabled: true,
    subject: "{brand}: Friendly balance reminder",
    body: "Hi {client}, this is a gentle reminder that a balance of {balance} is due on your order at {brand}. — {brand}",
    autoSchedule: "immediate" },
  { key: "materials_reminder", label: "Materials drop-off reminder", channels: ["whatsapp"], enabled: true,
    subject: "{brand}: Materials needed for your {garment}",
    body: "Hi {client}, a quick reminder to drop off: {materials}. Needed by {date} so we can start work on your {garment}. — {brand}",
    autoSchedule: "immediate" },
  { key: "materials_dropped", label: "Client dropped off materials", channels: ["whatsapp"], enabled: true,
    subject: "{brand}: Materials drop-off logged",
    body: "Hi {client}, thanks — we've logged that you dropped off {materials}. We'll confirm receipt shortly. — {brand}",
    autoSchedule: "immediate" },
];

const TEMPLATES_KEY = "stitchova.notif.templates.v1";
const LOG_KEY = "stitchova.notif.log.v1";

interface Ctx {
  templates: NotifTemplate[];
  log: NotifRecord[];
  updateTemplate: (key: NotifTriggerKey, patch: Partial<NotifTemplate>) => void;
  send: (opts: {
    key: NotifTriggerKey;
    clientName: string;
    clientContact?: string;
    brandName: string;
    channels?: NotifChannel[];
    tokens?: Record<string, string>;
    orderRef?: string;
    scheduledFor?: number;
  }) => NotifRecord[];
  clearLog: () => void;
}

const NotificationsContext = createContext<Ctx | null>(null);

const applyTokens = (s: string, tokens: Record<string, string>) => {
  return Object.entries(tokens).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, "g"), v),
    s
  );
};

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [templates, setTemplates] = useState<NotifTemplate[]>(() => {
    try {
      const raw = localStorage.getItem(TEMPLATES_KEY);
      if (!raw) return DEFAULT_TEMPLATES;
      const parsed: NotifTemplate[] = JSON.parse(raw);
      // merge with defaults so newly added keys are present
      const map = new Map(parsed.map(t => [t.key, t]));
      return DEFAULT_TEMPLATES.map(d => map.get(d.key) ?? d);
    } catch { return DEFAULT_TEMPLATES; }
  });
  const [log, setLog] = useState<NotifRecord[]>(() => {
    try {
      const raw = localStorage.getItem(LOG_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates)); }, [templates]);
  useEffect(() => { localStorage.setItem(LOG_KEY, JSON.stringify(log)); }, [log]);

  const value = useMemo<Ctx>(() => ({
    templates,
    log,
    updateTemplate: (key, patch) =>
      setTemplates(prev => prev.map(t => (t.key === key ? { ...t, ...patch } : t))),
    send: ({ key, clientName, clientContact, brandName, channels, tokens = {}, orderRef, scheduledFor }) => {
      const tpl = templates.find(t => t.key === key);
      if (!tpl || !tpl.enabled) return [];
      const useChannels = channels ?? tpl.channels;
      const merged: Record<string, string> = {
        client: clientName,
        brand: brandName,
        garment: "outfit",
        stage: "",
        balance: "",
        date: "",
        ...tokens,
      };
      const subject = applyTokens(tpl.subject, merged);
      const body = applyTokens(tpl.body, merged);
      const now = Date.now();
      const recs: NotifRecord[] = useChannels.map(ch => ({
        id: `n_${now.toString(36)}_${Math.random().toString(36).slice(2, 6)}_${ch}`,
        key,
        channel: ch,
        status: scheduledFor && scheduledFor > now ? "scheduled" : "sent",
        clientName,
        clientContact: clientContact || "—",
        brandName,
        subject,
        body,
        sentAt: now,
        scheduledFor,
        orderRef,
      }));
      setLog(prev => [...recs, ...prev].slice(0, 200));
      return recs;
    },
    clearLog: () => setLog([]),
  }), [templates, log]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
};

export const STAGE_TRIGGER_KEYS: NotifTriggerKey[] = [
  "stage_cutting", "stage_sewing", "stage_beading", "stage_finishing", "stage_quality",
];

export const downloadMessagePreview = (rec: NotifRecord) => {
  const header =
    rec.channel === "email"
      ? `From: ${rec.brandName} <notify@${rec.brandName.toLowerCase().replace(/[^a-z0-9]/g, "")}.co>\nTo: ${rec.clientName} <${rec.clientContact}>\nSubject: ${rec.subject}\n\n`
      : rec.channel === "whatsapp"
        ? `${rec.brandName} WhatsApp\nTo: ${rec.clientContact}\n\n`
        : `${rec.brandName} SMS\nTo: ${rec.clientContact}\n\n`;
  const blob = new Blob([header + rec.body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${rec.brandName.replace(/\s+/g, "_")}_${rec.channel}_${rec.id}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};