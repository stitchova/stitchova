import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Delete, Fingerprint, ScanFace, Lock } from "lucide-react";
import { useLock, isApplePlatform } from "@/contexts/LockContext";
import { useRole } from "@/contexts/RoleContext";
import Logo from "@/components/Logo";
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
    <div className="fixed inset-0 z-[100] lock-backdrop bg-background/95 backdrop-blur-xl flex flex-col items-center px-6 py-10 overflow-y-auto">
      <div className="w-full max-w-[320px] mx-auto flex-1 flex flex-col items-center justify-center gap-10 py-4">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-5"
        >
          <Logo size={56} />
          <div className="text-center space-y-1.5">
            <h1 className="text-[22px] leading-tight font-semibold text-foreground tracking-tight">
              {greeting}
            </h1>
            <p className="text-[13px] text-muted-foreground">
              Enter your passcode to continue
            </p>
          </div>

          <div className={`flex items-center gap-5 pt-2 ${shake ? "shake-x" : ""}`}>
            {Array.from({ length: LENGTH }).map((_, i) => {
              const filled = i < code.length;
              return (
                <motion.div
                  key={i}
                  animate={{ scale: code.length === i + 1 ? [1, 1.35, 1] : 1 }}
                  transition={{ duration: 0.2 }}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    filled
                      ? "bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.6)]"
                      : "bg-foreground/15"
                  }`}
                />
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full grid grid-cols-3 gap-x-6 gap-y-4"
        >
        {keys.map((k) => {
          if (k === "bio") {
            return (
              <button
                key="bio"
                onClick={tryBio}
                disabled={busy}
                className="h-16 w-16 mx-auto rounded-full flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40 text-primary"
                aria-label="Biometric unlock"
              >
                {apple ? (
                  <ScanFace className="w-7 h-7" />
                ) : (
                  <Fingerprint className="w-7 h-7" />
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
                className="h-16 w-16 mx-auto rounded-full flex items-center justify-center active:scale-95 transition-transform disabled:opacity-30 text-foreground/80"
                aria-label="Backspace"
              >
                <Delete className="w-6 h-6" />
              </button>
            );
          }
          return (
            <motion.button
              key={k}
              whileTap={{ scale: 0.92 }}
              onClick={() => press(k)}
              disabled={busy}
              className="h-16 w-16 mx-auto rounded-full glass flex items-center justify-center text-[28px] font-light text-foreground active:bg-primary/15 border border-foreground/5"
            >
              {k}
            </motion.button>
          );
        })}
        </motion.div>

        <button
          onClick={() => toast("Recovery link sent to your email")}
          className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Forgot passcode?
        </button>
      </div>
    </div>
  );
};

export default Lockscreen;