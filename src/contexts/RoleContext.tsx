import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// One-shot cleanup of stale auth artifacts from earlier real-auth experiments.
const CLEANUP_FLAG = "stitchova-cleanup-v1";
function runStaleStateCleanup() {
  try {
    if (localStorage.getItem(CLEANUP_FLAG)) return;
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-")) toRemove.push(key);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
    localStorage.setItem(CLEANUP_FLAG, "1");
  } catch {
    // ignore storage errors
  }
}

export type UserRole = "client" | "designer" | "worker";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    runStaleStateCleanup();
  }, []);

  const [role, setRole] = useState<UserRole>(
    () => (localStorage.getItem("fashionos-role") as UserRole) || "designer"
  );

  const handleSetRole = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem("fashionos-role", newRole);
  };

  const toggleRole = () => {
    handleSetRole(role === "designer" ? "client" : "designer");
  };

  return (
    <RoleContext.Provider value={{ role, setRole: handleSetRole, toggleRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
};
