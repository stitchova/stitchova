import { motion } from "framer-motion";
import { Check, Copy, Gift, Share2, Users } from "lucide-react";
import { formatMoney } from "@/lib/currency";
import { DesktopOnly, WorkspaceHeader } from "./DesktopKit";

export interface ReferralRow {
  name: string;
  email?: string;
  code: string;
  joinedAt: string;
}

interface Props {
  code: string;
  inviteLink: string;
  referrals: ReferralRow[];
  copied: boolean;
  onCopy: () => void;
  onShare: () => void;
}

/** Tablet/desktop workspace for the designer Referrals page. */
const ReferralsWorkspace = ({ code, inviteLink, referrals, copied, onCopy, onShare }: Props) => (
  <DesktopOnly>
    <div className="mx-auto max-w-[1100px]">
      <WorkspaceHeader title="Referrals" subtitle="Invite your clients to Stitchova" />

      <div className="grid grid-cols-[minmax(360px,440px)_1fr] gap-6 mt-6 items-start">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-8 text-center space-y-4"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.18), hsl(var(--accent) / 0.10))" }}
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Your referral code</p>
          <p className="text-4xl font-extrabold text-gradient-gold tracking-wider">{code}</p>
          <p className="text-[11px] text-muted-foreground break-all">{inviteLink}</p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onCopy}
              className="py-3 rounded-xl bg-card border border-border flex items-center justify-center gap-2 text-sm font-semibold text-foreground"
            >
              {copied ? <Check className="w-4 h-4 text-status-completed" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onShare}
              className="py-3 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 text-sm font-bold"
            >
              <Share2 className="w-4 h-4" /> Share
            </motion.button>
          </div>
        </motion.div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="solid-panel p-5">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Users className="w-3.5 h-3.5" /> Referred
              </div>
              <p className="text-3xl font-bold text-foreground">{referrals.length}</p>
            </div>
            <div className="solid-panel p-5">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Gift className="w-3.5 h-3.5" /> Rewards
              </div>
              <p className="text-3xl font-bold text-gradient-gold">{formatMoney(referrals.length * 25)}</p>
            </div>
          </div>

          <div className="solid-panel p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">Recent referrals</h2>
            {referrals.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No referrals yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Share your code with clients to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {referrals.map((r, i) => (
                  <motion.div
                    key={`${r.name}-${i}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-foreground">
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{r.email || "Joined as client"}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(r.joinedAt).toLocaleDateString()}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </DesktopOnly>
);

export default ReferralsWorkspace;
