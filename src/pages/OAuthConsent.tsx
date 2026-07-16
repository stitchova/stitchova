import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Logo from "@/components/Logo";

// Minimal typed shim for the beta supabase.auth.oauth namespace.
type OAuthAPI = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthAPI }).oauth;

function isSafeRelative(next: string | null): next is string {
  return !!next && next.startsWith("/") && !next.startsWith("//");
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      try {
        const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
        if (!active) return;
        if (error) {
          setError(error.message ?? "Could not load authorization request");
          return;
        }
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) {
          window.location.href = immediate;
          return;
        }
        setDetails(data);
      } catch (e: any) {
        setError(e?.message ?? "Unexpected error");
      }
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    try {
      const { data, error } = approve
        ? await oauth.approveAuthorization(authorizationId)
        : await oauth.denyAuthorization(authorizationId);
      if (error) {
        setBusy(false);
        setError(error.message ?? "Authorization failed");
        return;
      }
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) {
        setBusy(false);
        setError("No redirect returned by the authorization server.");
        return;
      }
      window.location.href = target;
    } catch (e: any) {
      setBusy(false);
      setError(e?.message ?? "Unexpected error");
    }
  }

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "an app";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md card-surface p-6 space-y-5"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo size={56} />
          <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground">STITCHOVA</span>
        </div>

        {error ? (
          <div className="text-center space-y-3">
            <h1 className="text-lg font-bold text-foreground">Authorization error</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : !details ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading authorization…</p>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1">
              <h1 className="text-lg font-bold text-foreground">
                Connect <span className="text-primary">{clientName}</span> to Stitchova
              </h1>
              <p className="text-xs text-muted-foreground">
                {clientName} will be able to call Stitchova's enabled tools while you are signed in.
              </p>
            </div>

            <div className="rounded-2xl bg-secondary/40 p-4 space-y-2 text-xs text-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="font-semibold">This lets {clientName} act as you.</span>
              </div>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Read your Stitchova notes</li>
                <li>Create and delete your notes</li>
                <li>See your basic account info (id, email)</li>
              </ul>
              <p className="text-[10px] text-muted-foreground pt-1">
                This does not bypass Stitchova's permissions or backend policies.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={busy}
                onClick={() => decide(false)}
                className="py-3 rounded-xl bg-card border border-border text-sm font-semibold text-foreground disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                disabled={busy}
                onClick={() => decide(true)}
                className="py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />} Approve
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}