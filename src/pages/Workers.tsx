import { motion } from "framer-motion";
import { ArrowLeft, Plus, Phone, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const workers = [
  { name: "Kwame Asante", role: "Head Tailor", phone: "024 555 1234", rating: 4.8, jobs: 156 },
  { name: "Esi Darkwa", role: "Seamstress", phone: "020 333 5678", rating: 4.6, jobs: 98 },
  { name: "Yaw Mensah", role: "Cutter", phone: "055 777 9012", rating: 4.9, jobs: 210 },
  { name: "Abena Osei", role: "Embroiderer", phone: "027 888 3456", rating: 4.7, jobs: 75 },
];

const Workers = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/50">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <h1 className="text-lg font-semibold text-foreground flex-1">Workers</h1>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/add")} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
          <Plus className="w-4 h-4 text-primary-foreground" />
        </motion.button>
      </div>

      <div className="px-5 pt-4 space-y-3">
        {workers.map((w, i) => (
          <motion.div
            key={w.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-surface p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-foreground">{w.name.split(" ").map(n => n[0]).join("")}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{w.name}</p>
              <p className="text-[11px] text-muted-foreground">{w.role}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Phone className="w-3 h-3" /> {w.phone}
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="text-sm font-semibold text-foreground">{w.rating}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{w.jobs} jobs</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Workers;
