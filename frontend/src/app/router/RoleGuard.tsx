import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/contexts/useAuth";


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