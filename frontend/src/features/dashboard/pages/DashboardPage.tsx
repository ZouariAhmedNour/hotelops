import { ROLES } from "../../../shared/config/roles";
import { useAuth } from "../../auth/contexts/useAuth";
import AdminDashboardPage from "./AdminDashboardPage";
import AgentDashboardPage from "./AgentDashboardPage";
import MaintenanceDashboardPage from "./MaintenanceDashboardPage";
import ReceptionDashboardPage from "./ReceptionDashboardPage";


const DashboardPage = () => {
  const { user } = useAuth();

  const roleCode = user?.role?.code?.toUpperCase();

  switch (roleCode) {
    case ROLES.ADMIN:
      return <AdminDashboardPage />;

    case ROLES.RECEPTION:
      return <ReceptionDashboardPage />;

    case ROLES.CHEF_MAINT:
      return <MaintenanceDashboardPage />;

    case ROLES.MAINTENANCE_AGENT:
      return <AgentDashboardPage />;

    case ROLES.HOUSEKEEPING:
      return <ReceptionDashboardPage />;

    case ROLES.FINANCE:
      return <AdminDashboardPage />;

    default:
      return <ReceptionDashboardPage />;
  }
};

export default DashboardPage;