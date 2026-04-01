import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, CheckCircle2, Clock, AlertTriangle, Award, Wrench } from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

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
    { label: "Tasks Done", value: "47", icon: CheckCircle2 },
    { label: "On-Time", value: "92%", icon: Clock },
    { label: "Rating", value: "4.8", icon: Star },
    { label: "Experience", value: "5 yrs", icon: Award },
  ];

  const specializations = ["Men's Wear", "Traditional", "Bridal"];

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
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-3">
            <Wrench className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">{profile.name}</h2>
          <p className="text-xs text-primary font-medium">{profile.role}</p>
          <p className="text-[10px] text-muted-foreground">{profile.studio}</p>
          <div className="mt-2 px-3 py-1 rounded-full bg-green-400/10">
            <span className="text-[10px] text-green-400 font-medium">{profile.status}</span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp} transition={{ delay: 0.05 }} className="grid grid-cols-4 gap-2 mb-6">
          {stats.map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
              <s.icon className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-sm font-bold text-foreground">{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Info Cards */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="space-y-3">
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="text-xs font-bold text-foreground mb-3">Contact</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-xs text-muted-foreground">Phone</span><span className="text-xs text-foreground">{profile.phone}</span></div>
              <div className="flex justify-between"><span className="text-xs text-muted-foreground">Email</span><span className="text-xs text-foreground">{profile.email}</span></div>
              <div className="flex justify-between"><span className="text-xs text-muted-foreground">Joined</span><span className="text-xs text-foreground">{profile.joined}</span></div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="text-xs font-bold text-foreground mb-3">Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {specializations.map(s => (
                <span key={s} className="px-3 py-1.5 rounded-full bg-primary/10 text-[10px] text-primary font-medium">{s}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Logout */}
        <motion.button {...fadeUp} transition={{ delay: 0.15 }} onClick={() => navigate("/auth")}
          className="w-full py-3.5 rounded-2xl bg-red-500/10 text-red-400 font-bold text-sm mt-6">
          Sign Out
        </motion.button>
      </div>
    </div>
  );
};

export default WorkerProfile;
