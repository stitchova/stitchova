import { formatMoney } from "@/lib/currency";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Share2, Gift, Users, Check } from "lucide-react";
import { toast } from "sonner";

interface ReferralEntry {
  name: string;
  email?: string;
  code: string;
  joinedAt: string;
}

const DESIGNER_NAME = "Justice Ansah";

const generateCode = (name: string) => {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return `${initials}-STITCH${Math.floor(1000 + Math.random() * 9000)}`;
};

const Referrals = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => {
    const existing = localStorage.getItem("fashionos-designer-referral-code");
    if (existing) return existing;
    const fresh = generateCode(DESIGNER_NAME);
    localStorage.setItem("fashionos-designer-referral-code", fresh);
    return fresh;
  }, []);

  const [referrals, setReferrals] = useState<ReferralEntry[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("fashionos-referrals");
    const all: ReferralEntry[] = raw ? JSON.parse(raw) : [];
    setReferrals(all.filter((r) => r.code === code));
  }, [code]);

  const inviteLink = `${window.location.origin}/auth?ref=${code}`;
  const shareMessage = `Join me on Stitchova as my client. Use my referral code ${code} when signing up: ${inviteLink}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Referral code copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on Stitchova",
          text: shareMessage,
          url: inviteLink,
        });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    await navigator.clipboard.writeText(shareMessage);
    toast.success("Invite message copied", { description: "Paste it into WhatsApp, SMS or email." });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate(-1)} className="w-10 h-10 rounded-full frost-card flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Referrals</h1>
          <p className="text-xs text-muted-foreground">Invite your clients to Stitchova</p>
        </div>
      </div>

      <div className="px-5 space-y-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-6 text-center space-y-3"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.18), hsl(var(--accent) / 0.10))" }}>
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center">
            <Gift className="w-7 h-7 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Your referral code</p>
          <p className="text-3xl font-extrabold text-gradient-gold tracking-wider">{code}</p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleCopy}
              className="py-3 rounded-xl bg-card border border-border flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
              {copied ? <Check className="w-4 h-4 text-status-completed" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleShare}
              className="py-3 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 text-sm font-bold">
              <Share2 className="w-4 h-4" /> Share
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          <div className="frost-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Users className="w-3.5 h-3.5" /> Referred
            </div>
            <p className="text-2xl font-bold text-foreground">{referrals.length}</p>
          </div>
          <div className="frost-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Gift className="w-3.5 h-3.5" /> Rewards
            </div>
            <p className="text-2xl font-bold text-gradient-gold">{formatMoney(referrals.length * 25)}</p>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Recent referrals</h2>
          {referrals.length === 0 ? (
            <div className="frost-card p-6 text-center">
              <p className="text-sm text-muted-foreground">No referrals yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Share your code with clients to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {referrals.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="card-surface p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-foreground">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{r.email || "Joined as client"}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{new Date(r.joinedAt).toLocaleDateString()}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Referrals;