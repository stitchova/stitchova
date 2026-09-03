import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, PhoneOff, Video, VideoOff, Volume2, VolumeX, Users, Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type CallMode = "audio" | "video";

export interface CallTarget {
  name: string;
  initials?: string;
  avatar?: string;
  subtitle?: string;
  isGroup?: boolean;
}

interface CallState {
  mode: CallMode;
  target: CallTarget;
}

/** Simulated call session state shared by every messaging surface. */
export const useCallSession = () => {
  const [call, setCall] = useState<CallState | null>(null);
  const startCall = useCallback((mode: CallMode, target: CallTarget) => setCall({ mode, target }), []);
  const endCall = useCallback(() => setCall(null), []);
  return { call, startCall, endCall };
};

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/** Compact audio + video call buttons for chat headers. */
export const CallButtons = ({
  onAudio, onVideo, size = "md", className,
}: {
  onAudio: () => void;
  onVideo: () => void;
  size?: "sm" | "md";
  className?: string;
}) => {
  const box = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  const icon = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <motion.button
        whileTap={{ scale: 0.9 }} onClick={onAudio} aria-label="Start audio call"
        className={cn(box, "rounded-xl flex items-center justify-center backdrop-blur-xl bg-secondary/60 border border-border/60 hover:border-primary/40 transition-colors")}
      >
        <Phone className={cn(icon, "text-foreground")} />
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }} onClick={onVideo} aria-label="Start video call"
        className={cn(box, "rounded-xl flex items-center justify-center backdrop-blur-xl bg-primary/15 border border-primary/30 hover:border-primary/60 transition-colors")}
      >
        <Video className={cn(icon, "text-primary")} />
      </motion.button>
    </div>
  );
};

const Control = ({
  active, onClick, label, children,
}: { active?: boolean; onClick: () => void; label: string; children: React.ReactNode }) => (
  <motion.button
    whileTap={{ scale: 0.92 }} onClick={onClick} aria-label={label}
    className={cn(
      "w-14 h-14 rounded-full flex items-center justify-center border backdrop-blur-xl transition-colors",
      active ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/50 text-foreground border-border/60",
    )}
  >
    {children}
  </motion.button>
);

interface OverlayProps {
  call: { mode: CallMode; target: CallTarget } | null;
  onEnd: () => void;
}

/** Full-screen glassmorphic simulated call UI (prototype — no real media). */
const CallOverlay = ({ call, onEnd }: OverlayProps) => {
  const [connected, setConnected] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    if (!call) return;
    setConnected(false); setSeconds(0); setMuted(false); setSpeaker(true);
    setCamOn(call.mode === "video");
    const t = setTimeout(() => setConnected(true), 2200);
    return () => clearTimeout(t);
  }, [call]);

  useEffect(() => {
    if (!connected) return;
    const i = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [connected]);

  const target = call?.target;
  const isVideo = call?.mode === "video";

  return (
    <AnimatePresence>
      {call && target && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-2xl" />

          <motion.div
            initial={{ scale: 0.94, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="relative w-full max-w-md rounded-[32px] overflow-hidden border border-border/60 bg-card/60 backdrop-blur-2xl shadow-2xl"
          >
            {/* ambient glow */}
            <div className="pointer-events-none absolute -top-24 -right-16 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative px-7 pt-8 pb-7 flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                {isVideo ? "Video call" : "Voice call"}
              </span>

              {/* Stage */}
              {isVideo ? (
                <div className="mt-5 w-full aspect-[4/5] rounded-3xl overflow-hidden relative border border-border/60 bg-secondary/40">
                  {target.avatar ? (
                    <img
                      src={target.avatar} alt={target.name}
                      className={cn("w-full h-full object-cover transition-all duration-500", connected ? "blur-0 scale-100" : "blur-md scale-105")}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-transparent">
                      <span className="text-5xl font-bold text-primary">
                        {target.isGroup ? <Users className="w-12 h-12" /> : target.initials ?? target.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/80 to-transparent" />
                  {/* self view */}
                  <div className="absolute bottom-3 right-3 w-20 h-28 rounded-2xl border border-border/70 bg-background/70 backdrop-blur-xl flex items-center justify-center">
                    {camOn ? (
                      <span className="text-[10px] text-muted-foreground font-medium">You</span>
                    ) : (
                      <VideoOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-6 relative">
                  <motion.span
                    animate={{ scale: connected ? 1 : [1, 1.25, 1], opacity: connected ? 0 : [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: connected ? 0 : Infinity }}
                    className="absolute inset-0 rounded-full bg-primary/30"
                  />
                  {target.avatar ? (
                    <img src={target.avatar} alt={target.name} className="relative w-28 h-28 rounded-full object-cover ring-2 ring-primary/30" />
                  ) : (
                    <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 ring-2 ring-primary/30 flex items-center justify-center">
                      {target.isGroup
                        ? <Users className="w-10 h-10 text-primary" />
                        : <span className="text-3xl font-bold text-primary">{target.initials ?? target.name.slice(0, 2).toUpperCase()}</span>}
                    </div>
                  )}
                </div>
              )}

              <p className="mt-5 text-lg font-bold text-foreground text-center">{target.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {connected ? fmt(seconds) : "Ringing…"}
                {target.subtitle && !connected ? ` · ${target.subtitle}` : ""}
              </p>

              {/* Controls */}
              <div className="mt-7 flex items-center justify-center gap-4">
                <Control active={muted} onClick={() => setMuted((m) => !m)} label="Toggle microphone">
                  {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Control>
                {isVideo ? (
                  <Control active={!camOn} onClick={() => setCamOn((c) => !c)} label="Toggle camera">
                    {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </Control>
                ) : (
                  <Control active={!speaker} onClick={() => setSpeaker((s) => !s)} label="Toggle speaker">
                    {speaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </Control>
                )}
                <motion.button
                  whileTap={{ scale: 0.92 }} onClick={onEnd} aria-label="End call"
                  className="w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg"
                >
                  <PhoneOff className="w-5 h-5" />
                </motion.button>
              </div>

              <p className="mt-5 text-[10px] text-muted-foreground text-center">
                Calls are simulated in this preview.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CallOverlay;
