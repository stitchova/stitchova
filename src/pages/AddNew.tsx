import { motion } from "framer-motion";
import { UserPlus, Ruler, ClipboardList, CalendarDays, Shirt, Package, ArrowLeft, Boxes, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";

const actions = [
  { icon: UserPlus, label: "New Client", desc: "Add a new client to your list", color: "text-primary", path: "/clients?new=1" },
  { icon: ClipboardList, label: "New Order", desc: "Create a fashion order", color: "text-primary", path: "/orders?new=1" },
  { icon: Ruler, label: "Record Measurement", desc: "Take client measurements", color: "text-primary", path: "/measurements" },
  { icon: CalendarDays, label: "Schedule Appointment", desc: "Schedule a fitting session for a client", color: "text-primary", path: "/appointments" },
  { icon: Shirt, label: "Add Fabric", desc: "Add to your fabric collection", color: "text-primary", path: "/fabrics" },
  { icon: Boxes, label: "Add Material", desc: "Add threads, beads, buttons & more", color: "text-primary", path: "/materials" },
  { icon: Package, label: "Add Worker", desc: "Register a new team member", color: "text-primary", path: "/workers" },
  { icon: Image, label: "Style Library", desc: "Browse style inspirations", color: "text-primary", path: "/style-library" },
];

const AddNew = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Create New</h1>
          <p className="text-xs text-muted-foreground mt-0.5">What would you like to add?</p>
        </div>
      </div>

      <div className="px-5 space-y-3">
        {actions.map((a, i) => (
          <motion.button
            key={a.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(a.path)}
            className="card-surface p-4 flex items-center gap-4 w-full text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <a.icon className={`w-5 h-5 ${a.color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{a.label}</p>
              <p className="text-[11px] text-muted-foreground">{a.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default AddNew;
