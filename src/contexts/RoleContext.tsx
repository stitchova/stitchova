import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "client" | "designer";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
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
