import { Navigate, Outlet } from "react-router-dom";
import Spinner from "../../shared/components/ui/Spinner";
import { useAuth } from "../../features/auth/contexts/useAuth";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;