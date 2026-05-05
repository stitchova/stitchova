import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Globe, Moon, Lock, Smartphone, Palette, Shield, KeyRound, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLock } from "@/contexts/LockContext";

const Settings = () => {
  const navigate = useNavigate();
  const { hasPasscode, biometricEnabled, setBiometricEnabled, lockNow } = useLock();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => { onChange(!value); toast.success(value ? "Disabled" : "Enabled"); }}
      className={`w-10 h-6 rounded-full p-0.5 transition-colors ${value ? "bg-primary" : "bg-secondary"}`}
    >
      <motion.div
        animate={{ x: value ? 16 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-5 h-5 rounded-full bg-foreground"
      />
    </button>
  );

  const sections = [
    {
      title: "Preferences",
      items: [
        { icon: Bell, label: "Push Notifications", desc: "Order updates & messages", toggle: { value: notifications, onChange: setNotifications } },
        { icon: Moon, label: "Dark Mode", desc: "Reduce eye strain at night", toggle: { value: darkMode, onChange: setDarkMode } },
        { icon: Palette, label: "Themes", desc: "Choose your color palette", action: () => navigate("/themes") },
        { icon: Globe, label: "Language", desc: "English (US)", action: () => toast("Coming soon") },
      ],
    },
    {
      title: "Security",
      items: [
        { icon: KeyRound, label: hasPasscode ? "Change Passcode" : "Set Passcode", desc: "4-digit app lock", action: () => navigate("/set-passcode") },
        { icon: Smartphone, label: "Biometric Login", desc: "Use Face ID / fingerprint", toggle: { value: biometricEnabled, onChange: (v: boolean) => { setBiometricEnabled(v); toast.success(v ? "Biometric enabled" : "Biometric disabled"); } } },
        { icon: LockKeyhole, label: "Lock Now", desc: hasPasscode ? "Lock the app immediately" : "Set a passcode first", action: () => { if (!hasPasscode) { toast("Set a passcode first"); navigate("/set-passcode"); return; } lockNow(); } },
        { icon: Lock, label: "Change Password", desc: "Update your credentials", action: () => toast("Password reset link sent") },
        { icon: Shield, label: "Privacy Policy", desc: "How we protect your data", action: () => toast("Opening privacy policy…") },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
      </div>

      <div className="px-5 space-y-6">
        {sections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.1 }}
          >
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {section.title}
            </p>
            <div className="card-surface divide-y divide-border/50">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => "action" in item && item.action?.()}
                  className="w-full p-4 flex items-center gap-3 text-left active:bg-secondary/30 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                  {"toggle" in item && item.toggle && (
                    <Toggle value={item.toggle.value} onChange={item.toggle.onChange} />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Settings;