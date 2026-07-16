import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useRole, UserRole } from "@/contexts/RoleContext";

const HOME: Record<UserRole, string> = {
  designer: "/",
  client: "/client-home",
  worker: "/worker-dashboard",
};

interface Props {
  allow: UserRole | UserRole[];
  children: ReactNode;
}

const RequireRole = ({ allow, children }: Props) => {
  const { role } = useRole();
  const allowed = Array.isArray(allow) ? allow : [allow];
  if (!allowed.includes(role)) {
    return <Navigate to={HOME[role]} replace />;
  }
  return <>{children}</>;
};

export default RequireRole;