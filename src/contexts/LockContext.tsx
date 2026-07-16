import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from "react";

const PASSCODE_KEY = "fashionos-passcode";
const BIO_KEY = "fashionos-biometric";
const LAST_ACTIVE_KEY = "fashionos-last-active";
const INACTIVITY_MS = 2 * 60 * 1000;
const REFOCUS_RELOCK_MS = 30 * 1000;

async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface LockCtx {
  hasPasscode: boolean;
  isLocked: boolean;
  biometricEnabled: boolean;
  setBiometricEnabled: (v: boolean) => void;
  unlockWithPasscode: (code: string) => Promise<boolean>;
  unlockWithBiometric: () => Promise<boolean>;
  setPasscode: (code: string) => Promise<void>;
  clearPasscode: () => void;
  lockNow: () => void;
  ping: () => void;
}

const LockContext = createContext<LockCtx | null>(null);

export const LockProvider = ({ children }: { children: ReactNode }) => {
  const [hash, setHash] = useState<string | null>(() => localStorage.getItem(PASSCODE_KEY));
  const [biometricEnabled, setBiometricEnabledState] = useState<boolean>(
    () => localStorage.getItem(BIO_KEY) === "1"
  );
  const [isLocked, setIsLocked] = useState<boolean>(() => !!localStorage.getItem(PASSCODE_KEY));
  const timerRef = useRef<number | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (!hash) return;
    timerRef.current = window.setTimeout(() => setIsLocked(true), INACTIVITY_MS);
    localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
  }, [hash]);

  // Activity listeners
  useEffect(() => {
    if (!hash || isLocked) return;
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    const handler = () => resetTimer();
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    resetTimer();
    return () => events.forEach((e) => window.removeEventListener(e, handler));
  }, [hash, isLocked, resetTimer]);

  // Re-lock on tab refocus after threshold
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible" && hash) {
        const last = Number(localStorage.getItem(LAST_ACTIVE_KEY) || 0);
        if (Date.now() - last > REFOCUS_RELOCK_MS) setIsLocked(true);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [hash]);

  const setPasscode = async (code: string) => {
    const h = await sha256(code);
    localStorage.setItem(PASSCODE_KEY, h);
    setHash(h);
    setIsLocked(false);
    resetTimer();
  };

  const clearPasscode = () => {
    localStorage.removeItem(PASSCODE_KEY);
    setHash(null);
    setIsLocked(false);
  };

  const unlockWithPasscode = async (code: string) => {
    if (!hash) return true;
    const h = await sha256(code);
    if (h === hash) {
      setIsLocked(false);
      resetTimer();
      return true;
    }
    return false;
  };

  const unlockWithBiometric = async () => {
    if (!biometricEnabled) return false;
    // Mocked biometric: simulate a quick auth handshake
    await new Promise((r) => setTimeout(r, 600));
    setIsLocked(false);
    resetTimer();
    return true;
  };

  const setBiometricEnabled = (v: boolean) => {
    setBiometricEnabledState(v);
    localStorage.setItem(BIO_KEY, v ? "1" : "0");
  };

  const lockNow = () => {
    if (hash) setIsLocked(true);
  };

  const ping = () => resetTimer();

  return (
    <LockContext.Provider
      value={{
        hasPasscode: !!hash,
        isLocked: !!hash && isLocked,
        biometricEnabled,
        setBiometricEnabled,
        unlockWithPasscode,
        unlockWithBiometric,
        setPasscode,
        clearPasscode,
        lockNow,
        ping,
      }}
    >
      {children}
    </LockContext.Provider>
  );
};

export const useLock = () => {
  const ctx = useContext(LockContext);
  if (!ctx) throw new Error("useLock must be used within LockProvider");
  return ctx;
};

export const isApplePlatform = () =>
  /iPhone|iPad|iPod|Mac/i.test(typeof navigator !== "undefined" ? navigator.userAgent : "");