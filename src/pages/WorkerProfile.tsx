import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, CheckCircle2, Clock, Award, Wrench, Phone, Mail, Calendar } from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } };

const portfolioImages = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=300&h=300&fit=crop",
];

const WorkerProfile = () => {
  const navigate = useNavigate();

  const profile = {
    name: "Tunde Afolabi",
    role: "Tailor",
    studio: "Ade Designs Studio",
    phone: "+234 801 234 5678",
    email: "tunde@example.com",
    joined: "Jan 2024",
    status: "Active",
  };

  const stats = [
    { label: "Tasks Done", value: 47, icon: CheckCircle2 },
    { label: "On-Time", value: "92%", icon: Clock },
    { label: "Rating", value: "4.8", icon: Star },
    { label: "Experience", value: "5 yrs", icon: Award },
  ];

  const specializations = ["Men's Wear", "Traditional", "Bridal"];

  const contactItems = [
    { icon: Phone, label: "Phone", value: profile.phone, tint: "bg-green-400/10 text-green-400" },
    { icon: Mail, label: "Email", value: profile.email, tint: "bg-blue-400/10 text-blue-400" },
    { icon: Calendar, label: "Joined", value: profile.joined, tint: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border px-5 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">My Profile</h1>
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
          <h2 className="text-lg font-bold text-foreground">{profile.name}</h2>
          <p className="text-xs text-primary font-medium">{profile.role}</p>
          <p className="text-[10px] text-muted-foreground">{profile.studio}</p>
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
        </motion.div>

        {/* Specializations */}
        <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="card-glass p-4 mb-4">
          <h3 className="text-xs font-bold text-foreground mb-3">Specializations</h3>
          <div className="flex flex-wrap gap-2">
            {specializations.map(s => (
              <motion.span key={s} whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 rounded-full bg-primary/10 text-[10px] text-primary font-medium glow-primary">
                {s}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Portfolio */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="mb-6">
          <h3 className="text-sm font-bold text-foreground mb-3">My Portfolio</h3>
          <div className="grid grid-cols-3 gap-2">
            {portfolioImages.map((img, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="aspect-square rounded-2xl overflow-hidden border border-border/20">
                <img src={img} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
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
