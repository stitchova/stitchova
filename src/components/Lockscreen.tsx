import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Delete, Fingerprint, ScanFace, Lock } from "lucide-react";
import { useLock, isApplePlatform } from "@/contexts/LockContext";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";

const LENGTH = 4;

const Lockscreen = () => {
  const { unlockWithPasscode, unlockWithBiometric, biometricEnabled } = useLock();
  const { role } = useRole();
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(false);
  const [busy, setBusy] = useState(false);

  const apple = isApplePlatform();
  const greeting =
    role === "designer" ? "Welcome back, Designer" : role === "client" ? "Welcome back" : "Welcome, Worker";

  useEffect(() => {
    if (code.length !== LENGTH) return;
    (async () => {
      setBusy(true);
      const ok = await unlockWithPasscode(code);
      if (!ok) {
        setShake(true);
        setTimeout(() => setShake(false), 450);
        setTimeout(() => setCode(""), 250);
        toast.error("Incorrect passcode");
      }
      setBusy(false);
    })();
  }, [code, unlockWithPasscode]);

  const press = (d: string) => {
    if (busy || code.length >= LENGTH) return;
    setCode((c) => c + d);
  };
  const back = () => setCode((c) => c.slice(0, -1));

  const tryBio = async () => {
    if (!biometricEnabled) {
      toast("Enable biometric login in Settings");
      return;
    }
    setBusy(true);
    const ok = await unlockWithBiometric();
    setBusy(false);
    if (ok) toast.success(apple ? "Authenticated with Face ID" : "Authenticated with fingerprint");
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "bio", "0", "back"];

  return (
    <div className="fixed inset-0 z-[100] lock-backdrop flex flex-col items-center justify-between px-6 pt-16 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="w-16 h-16 rounded-2xl glass-strong flex items-center justify-center">
          <Lock className="w-7 h-7 text-foreground" />
        </div>
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">FashionOS</p>
          <h1 className="text-xl font-bold text-foreground mt-1">{greeting}</h1>
          <p className="text-xs text-muted-foreground mt-1">Enter your passcode to continue</p>
        </div>

        <div className={`flex items-center gap-4 mt-4 ${shake ? "shake-x" : ""}`}>
          {Array.from({ length: LENGTH }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ scale: code.length === i + 1 ? [1, 1.4, 1] : 1 }}
              transition={{ duration: 0.2 }}
              className={`w-3.5 h-3.5 rounded-full border ${
                i < code.length
                  ? "bg-primary border-primary"
                  : "bg-transparent border-foreground/30"
              }`}
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-xs grid grid-cols-3 gap-3"
      >
        {keys.map((k) => {
          if (k === "bio") {
            return (
              <button
                key="bio"
                onClick={tryBio}
                disabled={busy}
                className="aspect-square rounded-2xl glass flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
                aria-label="Biometric unlock"
              >
                {apple ? (
                  <ScanFace className="w-7 h-7 text-primary" />
                ) : (
                  <Fingerprint className="w-7 h-7 text-primary" />
                )}
              </button>
            );
          }
          if (k === "back") {
            return (
              <button
                key="back"
                onClick={back}
                disabled={busy || code.length === 0}
                className="aspect-square rounded-2xl flex items-center justify-center active:scale-95 transition-transform disabled:opacity-30"
                aria-label="Backspace"
              >
                <Delete className="w-6 h-6 text-foreground" />
              </button>
            );
          }
          return (
            <motion.button
              key={k}
              whileTap={{ scale: 0.92 }}
              onClick={() => press(k)}
              disabled={busy}
              className="aspect-square rounded-2xl glass flex items-center justify-center text-2xl font-semibold text-foreground active:bg-primary/10"
            >
              {k}
            </motion.button>
          );
        })}
      </motion.div>

      <button
        onClick={() => toast("Recovery link sent to your email")}
        className="text-xs text-muted-foreground"
      >
        Forgot passcode?
      </button>
    </div>
  );
};

export default Lockscreen;