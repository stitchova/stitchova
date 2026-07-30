import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Lock, Delete } from "lucide-react";
import { useLock } from "@/contexts/LockContext";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";

const LENGTH = 4;
type Step = "enter" | "confirm";

const SetPasscode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useRole();
  const { setPasscode, hasPasscode, clearPasscode } = useLock();
  const [step, setStep] = useState<Step>("enter");
  const [first, setFirst] = useState("");
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("fashionos-authenticated") !== "1") {
      navigate("/auth", { replace: true });
    }
  }, [navigate]);

  const home = role === "designer" ? "/" : role === "client" ? "/client-home" : "/worker-dashboard";

  const onComplete = async (value: string) => {
    if (step === "enter") {
      setFirst(value);
      setCode("");
      setStep("confirm");
      return;
    }
    if (value === first) {
      await setPasscode(value);
      toast.success("Passcode set");
      const next = (location.state as { next?: string } | null)?.next;
      navigate(next || home, { replace: true });
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 450);
      setTimeout(() => {
        setCode("");
        setStep("enter");
        setFirst("");
      }, 350);
      toast.error("Codes don't match");
    }
  };

  const press = (d: string) => {
    if (code.length >= LENGTH) return;
    const next = code + d;
    setCode(next);
    if (next.length === LENGTH) setTimeout(() => onComplete(next), 150);
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "skip", "0", "back"];

  return (
    <div className="min-h-screen lock-backdrop flex flex-col px-6 pt-6 pb-10">
      <div className="flex items-center gap-3 mb-8">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <h1 className="text-lg font-bold text-foreground">
          {hasPasscode ? "Change Passcode" : "Set Passcode"}
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="w-14 h-14 rounded-2xl glass-strong flex items-center justify-center">
          <Lock className="w-6 h-6 text-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            {step === "enter" ? "Enter a 4-digit passcode" : "Re-enter to confirm"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            You'll use this to unlock the app
          </p>
        </div>

        <div className={`flex items-center gap-4 ${shake ? "shake-x" : ""}`}>
          {Array.from({ length: LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border ${
                i < code.length ? "bg-primary border-primary" : "border-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-xs mx-auto grid grid-cols-3 gap-3">
        {keys.map((k) => {
          if (k === "skip") {
            return (
              <button
                key="skip"
                onClick={() => {
                  if (hasPasscode) {
                    clearPasscode();
                    toast.success("Passcode removed");
                  }
                  navigate(-1);
                }}
                className="aspect-square rounded-2xl flex items-center justify-center text-[11px] font-semibold text-muted-foreground"
              >
                {hasPasscode ? "Remove" : "Skip"}
              </button>
            );
          }
          if (k === "back") {
            return (
              <button
                key="back"
                onClick={() => setCode((c) => c.slice(0, -1))}
                className="aspect-square rounded-2xl flex items-center justify-center"
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
              className="aspect-square rounded-2xl glass flex items-center justify-center text-2xl font-semibold text-foreground"
            >
              {k}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default SetPasscode;