import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, CheckCircle2, Clock, Award, Wrench, Phone, Mail, Calendar, Pencil, Save, X, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAtelier } from "@/contexts/AtelierContext";
import { CURRENT_WORKER } from "@/lib/workers";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } };

interface WorkerProfileData {
  name: string;
  role: string;
  studio: string;
  phone: string;
  email: string;
  joined: string;
  status: string;
  specializations: string[];
  experienceYears: string;
  portfolio: string[]; // base64 data URLs
}

const STORAGE_KEY = `stitchova.workerProfile.${CURRENT_WORKER.id}.v1`;

const defaultProfile: WorkerProfileData = {
  name: "Tunde Afolabi",
  role: "Tailor",
  studio: "Ade Designs Studio",
  phone: "+234 801 234 5678",
  email: "tunde@example.com",
  joined: "Jan 2024",
  status: "Active",
  specializations: ["Men's Wear", "Traditional", "Bridal"],
  experienceYears: "5",
  portfolio: [],
};

const WorkerProfile = () => {
  const navigate = useNavigate();
  const { tasksByWorker } = useAtelier();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<WorkerProfileData>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...defaultProfile, ...JSON.parse(raw) } : defaultProfile;
    } catch { return defaultProfile; }
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<WorkerProfileData>(profile);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch {}
  }, [profile]);

  // Derived stats from real task data.
  const myTasks = tasksByWorker(CURRENT_WORKER.id);
  const derivedStats = useMemo(() => {
    const done = myTasks.filter((t) => t.status === "completed").length;
    const total = myTasks.length || 1;
    const onTime = Math.min(100, Math.round((done / total) * 100));
    return { done, onTime };
  }, [myTasks]);

  const stats = [
    { label: "Tasks Done", value: derivedStats.done, icon: CheckCircle2 },
    { label: "On-Time", value: `${derivedStats.onTime}%`, icon: Clock },
    { label: "Rating", value: "4.8", icon: Star },
    { label: "Experience", value: `${profile.experienceYears} yrs`, icon: Award },
  ];

  const contactItems = [
    { icon: Phone, label: "Phone", value: profile.phone, tint: "bg-green-400/10 text-green-400" },
    { icon: Mail, label: "Email", value: profile.email, tint: "bg-blue-400/10 text-blue-400" },
    { icon: Calendar, label: "Joined", value: profile.joined, tint: "bg-primary/10 text-primary" },
  ];

  const startEdit = () => { setDraft(profile); setEditing(true); };
  const cancelEdit = () => { setEditing(false); };
  const saveEdit = () => {
    setProfile(draft);
    setEditing(false);
    toast.success("Profile updated");
  };

  const onPortfolioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.slice(0, 6).forEach((f) => {
      if (f.size > 4 * 1024 * 1024) { toast.error(`${f.name} exceeds 4MB`); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result);
        setProfile((p) => ({ ...p, portfolio: [dataUrl, ...p.portfolio].slice(0, 12) }));
        toast.success("Portfolio photo added");
      };
      reader.readAsDataURL(f);
    });
    e.target.value = "";
  };

  const removePortfolio = (idx: number) => {
    setProfile((p) => ({ ...p, portfolio: p.portfolio.filter((_, i) => i !== idx) }));
  };

  const inputCls = "w-full bg-secondary/60 border border-border rounded-xl py-2 px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary";

  return (
    <div className="min-h-screen bg-background pb-24">
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onPortfolioUpload} />
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border px-5 pt-14 pb-4">
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">My Profile</h1>
          </div>
          {!editing ? (
            <button onClick={startEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          ) : (
            <div className="flex gap-1.5">
              <button onClick={cancelEdit} className="w-9 h-9 rounded-full bg-secondary text-muted-foreground flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
              <button onClick={saveEdit} className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Save className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pt-6">
        {/* Avatar & Info */}
        <motion.div {...fadeUp} className="flex flex-col items-center mb-6">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full p-[3px]" style={{ background: "var(--gold-gradient)" }}>
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                <Wrench className="w-10 h-10 text-primary" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-400 border-4 border-background flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-background" />
            </div>
          </div>
          {editing ? (
            <div className="w-full max-w-xs space-y-2">
              <input className={inputCls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Full name" />
              <input className={inputCls} value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="Role" />
              <input className={inputCls} value={draft.studio} onChange={(e) => setDraft({ ...draft, studio: e.target.value })} placeholder="Studio" />
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-foreground">{profile.name}</h2>
              <p className="text-xs text-primary font-medium">{profile.role}</p>
              <p className="text-[10px] text-muted-foreground">{profile.studio}</p>
            </>
          )}
          <div className="mt-2 px-3 py-1 rounded-full bg-green-400/10 pulse-glow">
            <span className="text-[10px] text-green-400 font-medium">{profile.status}</span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp} transition={{ delay: 0.05 }} className="grid grid-cols-4 gap-2 mb-6">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 300 }}
              className="card-glass p-3 text-center">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1">
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-bold text-foreground">{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="card-glass p-4 mb-4">
          <h3 className="text-xs font-bold text-foreground mb-3">Contact</h3>
          {editing ? (
            <div className="space-y-2">
              <input className={inputCls} value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="Phone" />
              <input className={inputCls} value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="Email" />
              <input className={inputCls} value={draft.experienceYears} onChange={(e) => setDraft({ ...draft, experienceYears: e.target.value })} placeholder="Years of experience" />
            </div>
          ) : (
            <div className="space-y-3">
              {contactItems.map(c => (
                <div key={c.label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.tint}`}>
                    <c.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{c.label}</p>
                    <p className="text-xs text-foreground">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Specializations */}
        <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="card-glass p-4 mb-4">
          <h3 className="text-xs font-bold text-foreground mb-3">Specializations</h3>
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {["Men's Wear", "Women's Wear", "Bridal", "Traditional", "Kids Wear", "Suits"].map((s) => {
                const on = draft.specializations.includes(s);
                return (
                  <button key={s} onClick={() => setDraft({ ...draft, specializations: on ? draft.specializations.filter(x => x !== s) : [...draft.specializations, s] })}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-medium border transition-colors ${on ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"}`}>
                    {s}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.specializations.map(s => (
                <motion.span key={s} whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 rounded-full bg-primary/10 text-[10px] text-primary font-medium glow-primary">
                  {s}
                </motion.span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Portfolio */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">My Portfolio</h3>
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1 text-xs text-primary font-medium">
              <ImagePlus className="w-3.5 h-3.5" /> Add Photo
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {profile.portfolio.map((img, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="relative aspect-square rounded-2xl overflow-hidden border border-border/20 group">
                <img src={img} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
                <button onClick={() => removePortfolio(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center">
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </motion.div>
            ))}
            <button onClick={() => fileRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center gap-1 bg-card/30">
              <ImagePlus className="w-5 h-5 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">Upload</span>
            </button>
          </div>
          {profile.portfolio.length === 0 && (
            <p className="text-[10px] text-muted-foreground text-center mt-3">
              Upload finished-work photos to showcase your craft.
            </p>
          )}
        </motion.div>

        {/* Logout */}
        <motion.button {...fadeUp} transition={{ delay: 0.25 }} onClick={() => navigate("/auth")}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3.5 rounded-2xl bg-red-500/10 text-red-400 font-bold text-sm mb-4 active:bg-red-500/20 transition-colors">
          Sign Out
        </motion.button>
      </div>
    </div>
  );
};

export default WorkerProfile;
