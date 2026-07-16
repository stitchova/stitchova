import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useLock } from "@/contexts/LockContext";
import Lockscreen from "./Lockscreen";

const BYPASS = ["/auth", "/onboarding", "/set-passcode", "/.lovable/oauth/consent"];

const LockGate = ({ children }: { children: ReactNode }) => {
  const { isLocked } = useLock();
  const { pathname } = useLocation();
  const bypass = BYPASS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  return (
    <>
      {children}
      {isLocked && !bypass && <Lockscreen />}
    </>
  );
};

export default LockGate;