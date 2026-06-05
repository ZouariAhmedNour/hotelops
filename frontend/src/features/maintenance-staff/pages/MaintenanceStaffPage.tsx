import { Navigate } from "react-router-dom";
import { ROUTES } from "../../../shared/config/routes";

const MaintenanceStaffPage = () => {
  return <Navigate to={ROUTES.MAINTENANCE_STAFF_STATS} replace />;
};

export default MaintenanceStaffPage;