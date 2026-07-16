import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Scissors, ArrowRight, Wrench, Phone, Loader2, Gift } from "lucide-react";
import { useRole, UserRole } from "@/contexts/RoleContext";
import { useLock } from "@/contexts/LockContext";
import Logo from "@/components/Logo";
import { toast } from "sonner";

type AuthMode = "signin" | "signup";
type Step = "role" | "form";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setRole } = useRole();
  const { hasPasscode, markAuthenticated } = useLock();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [step, setStep] = useState<Step>("role");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", otp: "", referral: "" });
  const [submitting, setSubmitting] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<"forgot" | "google" | "apple" | null>(null);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setForm((f) => ({ ...f, referral: ref }));
      setMode("signup");
      setSelectedRole("client");
    }
  }, [searchParams]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (step === "role" && selectedRole) {
      setStep("form");
    }
  };

  const handleSubmit = async () => {
    if (!selectedRole || submitting) return;
    setSubmitting(true);
    // Mockup only — simulate a brief network delay, no real backend.
    await new Promise((r) => setTimeout(r, 400));

    if (mode === "signup" && selectedRole === "client" && form.referral.trim()) {
      const raw = localStorage.getItem("fashionos-referrals");
      const list = raw ? JSON.parse(raw) : [];
      list.push({
        name: form.name || "New Client",
        email: form.email,
        code: form.referral.trim().toUpperCase(),
        joinedAt: new Date().toISOString(),
      });
      localStorage.setItem("fashionos-referrals", JSON.stringify(list));
      toast.success("Referral applied", { description: `You joined via ${form.referral.trim().toUpperCase()}` });
    }

    setRole(selectedRole);

    // Honor OAuth consent redirect if present.
    const nextParam = searchParams.get("next");
    const safeNext = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : null;
    const home = safeNext
      ? safeNext
      : selectedRole === "designer"
      ? "/"
      : selectedRole === "client"
      ? "/client-home"
      : "/worker-dashboard";
    if (!hasPasscode) {
      navigate("/set-passcode", { state: { next: home }, replace: true });
    } else {
      markAuthenticated();
      navigate(home, { replace: true });
    }
    setSubmitting(false);
  };

  const triggerProvider = async (provider: "forgot" | "google" | "apple") => {
    if (pendingProvider) return;
    setPendingProvider(provider);
    await new Promise((r) => setTimeout(r, 500));
    if (provider === "forgot") toast.success("Reset link sent", { description: "Check your email for instructions." });
    if (provider === "google") toast("Google sign-in coming soon");
    if (provider === "apple") toast("Apple sign-in coming soon");
    setPendingProvider(null);
  };

  const roleCards = [
    { role: "client" as UserRole, icon: User, label: "Client", desc: "Browse & book designers" },
    { role: "designer" as UserRole, icon: Scissors, label: "Designer", desc: "Manage your business" },
    { role: "worker" as UserRole, icon: Wrench, label: "Worker", desc: "View tasks & orders" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-12 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-2 mb-8">
        <Logo size={64} />
        <span className="text-base font-bold tracking-[0.18em] text-foreground">STITCHOVA</span>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === "role" ? (
          <motion.div key="role" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex-1 flex flex-col">
            <h1 className="text-2xl font-bold text-foreground text-center mb-1">
              {mode === "signin" ? "Welcome Back" : "Join Stitchova"}
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-8">
              {mode === "signin" ? "Sign in to continue" : "Create your account"}
            </p>

            <p className="text-sm font-semibold text-foreground mb-4">I am a…</p>

            <div className="grid grid-cols-3 gap-2 mb-8">
              {roleCards.map((rc) => (
                <motion.button
                  key={rc.role}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleRoleSelect(rc.role)}
                  className={`relative rounded-2xl p-4 flex flex-col items-center gap-2 border-2 transition-all duration-200 ${
                    selectedRole === rc.role ? "border-primary bg-primary/10" : "border-border bg-card"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    selectedRole === rc.role ? "bg-primary/20" : "bg-secondary"
                  }`}>
                    <rc.icon className={`w-6 h-6 ${selectedRole === rc.role ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-foreground">{rc.label}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{rc.desc}</p>
                  </div>
                  {selectedRole === rc.role && (
                    <motion.div layoutId="check" className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-[8px] font-bold">✓</span>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            {selectedRole === "worker" && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground text-center mb-4 bg-secondary/50 rounded-xl p-3">
                Workers are invited by designers. Use the credentials sent to you to sign in.
              </motion.p>
            )}

            <div className="mt-auto space-y-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleContinue}
                disabled={!selectedRole || (selectedRole === "worker" && mode === "signup")}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </motion.button>

              {selectedRole !== "worker" && (
                <p className="text-center text-xs text-muted-foreground">
                  {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary font-semibold">
                    {mode === "signin" ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="flex-1 flex flex-col">
            <button onClick={() => setStep("role")} className="text-sm text-muted-foreground mb-4 self-start">← Back</button>

            <h1 className="text-2xl font-bold text-foreground mb-1">
              {selectedRole === "worker" ? "Worker Sign In" : mode === "signin" ? "Sign In" : "Create Account"}
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              {selectedRole === "worker"
                ? "Enter the credentials provided by your designer"
                : `${mode === "signin" ? "Enter your credentials" : "Fill in your details"} as a `}
              <span className="text-primary font-semibold capitalize">{selectedRole}</span>
            </p>

            <div className="space-y-4 mb-6">
              {mode === "signup" && selectedRole !== "worker" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-card border border-border rounded-xl py-3.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </motion.div>
              )}

              {selectedRole === "worker" ? (
                <>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="tel" placeholder="Phone number or Email" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-card border border-border rounded-xl py-3.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type={showPassword ? "text" : "password"} placeholder="OTP / Password" value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })}
                      className="w-full bg-card border border-border rounded-xl py-3.5 pl-11 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                      {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-card border border-border rounded-xl py-3.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type={showPassword ? "text" : "password"} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full bg-card border border-border rounded-xl py-3.5 pl-11 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                      {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </div>
                  {mode === "signin" && (
                    <button
                      onClick={() => triggerProvider("forgot")}
                      disabled={pendingProvider === "forgot"}
                      className="text-xs text-primary font-medium self-end ml-auto inline-flex items-center gap-1 disabled:opacity-60"
                    >
                      {pendingProvider === "forgot" && <Loader2 className="w-3 h-3 animate-spin" />}
                      {pendingProvider === "forgot" ? "Sending..." : "Forgot password?"}
                    </button>
                  )}
                  {mode === "signup" && selectedRole === "client" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="relative">
                      <Gift className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                      <input
                        type="text"
                        placeholder="Referral code (optional)"
                        value={form.referral}
                        onChange={(e) => setForm({ ...form, referral: e.target.value.toUpperCase() })}
                        className="w-full bg-card border border-border rounded-xl py-3.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all uppercase tracking-wider"
                      />
                    </motion.div>
                  )}
                </>
              )}
            </div>

            <div className="mt-auto space-y-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={submitting}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Please wait..." : selectedRole === "worker" ? "Sign In" : mode === "signin" ? "Sign In" : "Create Account"}
              </motion.button>

              {selectedRole !== "worker" && (
                <>
                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">or continue with</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => triggerProvider("google")}
                      disabled={pendingProvider === "google"}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-card border border-border text-sm text-foreground font-medium disabled:opacity-60"
                    >
                      {pendingProvider === "google" ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                      )}
                      Google
                    </button>
                    <button
                      onClick={() => triggerProvider("apple")}
                      disabled={pendingProvider === "apple"}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-card border border-border text-sm text-foreground font-medium disabled:opacity-60"
                    >
                      {pendingProvider === "apple" ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                      )}
                      Apple
                    </button>
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-2">
                    {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary font-semibold">
                      {mode === "signin" ? "Sign Up" : "Sign In"}
                    </button>
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;
