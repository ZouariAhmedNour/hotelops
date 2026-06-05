import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/contexts/useAuth";
import type { RoleCode } from "../../shared/config/roles";
import { ROUTES } from "../../shared/config/routes";
import { hasRole } from "../../shared/utils/permissions";


interface RoleGuardProps {
  allowedRoles: RoleCode[];
}

const RoleGuard = ({ allowedRoles }: RoleGuardProps) => {
  const { user } = useAuth();

  const roleCode = user?.role?.code;

  if (!hasRole(roleCode, allowedRoles)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};

export default RoleGuard;