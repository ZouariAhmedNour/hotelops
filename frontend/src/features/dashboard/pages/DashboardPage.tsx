import { ROLES } from "../../../shared/config/roles";
import { useAuth } from "../../auth/contexts/useAuth";
import AgentDashboardPage from "./AgentDashboardPage";
import MaintenanceDashboardPage from "./MaintenanceDashboardPage";
import ReceptionDashboardPage from "./ReceptionDashboardPage";

const DashboardPage = () => {
  const { user } = useAuth();

  const roleCode = user?.role?.code?.toUpperCase();

  switch (roleCode) {
    case ROLES.ADMIN:
      return <MaintenanceDashboardPage />;

    case ROLES.CHEF_MAINT:
      return <MaintenanceDashboardPage />;

    case ROLES.RECEPTION:
      return <ReceptionDashboardPage />;

    case ROLES.MAINTENANCE_AGENT:
      return <AgentDashboardPage />;

    case ROLES.HOUSEKEEPING:
      return <ReceptionDashboardPage />;

    case ROLES.FINANCE:
      return <ReceptionDashboardPage />;

    default:
      return <ReceptionDashboardPage />;
  }
};

export default DashboardPage;