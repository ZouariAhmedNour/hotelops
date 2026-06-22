import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../../features/auth/pages/LoginPage";
import SignupPage from "../../features/auth/pages/SignupPage";

import DashboardPage from "../../features/dashboard/pages/DashboardPage";

import TicketListPage from "../../features/maintenance/pages/TicketListPage";
import TicketCreatePage from "../../features/maintenance/pages/TicketCreatePage";
import TicketDetailPage from "../../features/maintenance/pages/TicketDetailPage";

import HousekeepingPage from "../../features/housekeeping/pages/HousekeepingPage";
import StockPage from "../../features/stock/pages/StockPage";
import FinancePage from "../../features/finance/pages/FinancePage";
import ReportsPage from "../../features/reports/pages/ReportsPage";
import UsersPage from "../../features/users/pages/UsersPage";

import MaintenanceStaffPage from "../../features/maintenance-staff/pages/MaintenanceStaffPage";
import MaintenanceStaffStatsPage from "../../features/maintenance-staff/pages/MaintenanceStaffStatsPage";
import MaintenanceTeamsPage from "../../features/maintenance-staff/pages/MaintenanceTeamsPage";
import MaintenanceSkillsPage from "../../features/maintenance-staff/pages/MaintenanceSkillsPage";
import AgentCreatePage from "../../features/maintenance-staff/pages/AgentCreatePage";
import AgentListPage from "../../features/maintenance-staff/pages/AgentListPage";
import AgentDetailPage from "../../features/maintenance-staff/pages/AgentDetailPage";

import QrCodeManagementPage from "../../features/qr-codes/pages/QrCodeManagementPage";

import { ROUTES } from "../../shared/config/routes";
import { ROLES } from "../../shared/config/roles";

import ProtectedRoute from "./ProtectedRoute";
import RoleGuard from "./RoleGuard";
import AppLayout from "../../shared/components/layout/AppLayout";
import LocationManagementPage from "../../features/locations/pages/LocationManagementPage";
import MaintenanceCertificationsPage from "../../features/maintenance-staff/pages/MaintenanceCertificationsPage";
import AssetManagementPage from "../../features/assets/pages/AssetManagementPage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              path="/"
              element={<Navigate to={ROUTES.DASHBOARD} replace />}
            />

            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

            <Route
              element={
                <RoleGuard
                  allowedRoles={[
                    ROLES.ADMIN,
                    ROLES.RECEPTION,
                    ROLES.CHEF_MAINT,
                    ROLES.MAINTENANCE_AGENT,
                  ]}
                />
              }
            >
              <Route path={ROUTES.TICKETS} element={<TicketListPage />} />
              <Route
                path={ROUTES.TICKET_CREATE}
                element={<TicketCreatePage />}
              />
              <Route
                path={ROUTES.TICKET_DETAIL}
                element={<TicketDetailPage />}
              />
            </Route>

            <Route
              element={
                <RoleGuard
                  allowedRoles={[
                    ROLES.ADMIN,
                    ROLES.RECEPTION,
                    ROLES.HOUSEKEEPING,
                  ]}
                />
              }
            >
              <Route
                path={ROUTES.HOUSEKEEPING}
                element={<HousekeepingPage />}
              />
            </Route>

            <Route
              element={
                <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.CHEF_MAINT]} />
              }
            >
              <Route path={ROUTES.STOCKS} element={<StockPage />} />
            </Route>

            <Route
              element={
                <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.FINANCE]} />
              }
            >
              <Route path={ROUTES.FINANCE} element={<FinancePage />} />
            </Route>

            <Route
              element={
                <RoleGuard
                  allowedRoles={[ROLES.ADMIN, ROLES.CHEF_MAINT, ROLES.FINANCE]}
                />
              }
            >
              <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
            </Route>

            <Route element={<RoleGuard allowedRoles={[ROLES.ADMIN]} />}>
              <Route path={ROUTES.USERS} element={<UsersPage />} />

              <Route
                path={ROUTES.LOCATIONS}
                element={<LocationManagementPage />}
              />

               <Route
                path={ROUTES.ASSETS}
                element={<AssetManagementPage />}
              />

              <Route
                path={ROUTES.QR_CODES}
                element={<QrCodeManagementPage />}
              />

              <Route
                path={ROUTES.QR_CODES}
                element={<QrCodeManagementPage />}
              />

              <Route
                path={ROUTES.MAINTENANCE_STAFF}
                element={<MaintenanceStaffPage />}
              />

              <Route
                path={ROUTES.MAINTENANCE_STAFF_STATS}
                element={<MaintenanceStaffStatsPage />}
              />

              <Route
                path={ROUTES.MAINTENANCE_STAFF_TEAMS}
                element={<MaintenanceTeamsPage />}
              />

              <Route
                path={ROUTES.MAINTENANCE_STAFF_SKILLS}
                element={<MaintenanceSkillsPage />}
              />

              <Route
                path={ROUTES.MAINTENANCE_STAFF_CERTIFICATIONS}
                element={<MaintenanceCertificationsPage />}
              />

              <Route
                path={ROUTES.MAINTENANCE_STAFF_AGENT_CREATE}
                element={<AgentCreatePage />}
              />

              <Route
                path={ROUTES.MAINTENANCE_STAFF_AGENTS}
                element={<AgentListPage />}
              />

              <Route
                path={ROUTES.MAINTENANCE_STAFF_AGENT_DETAIL}
                element={<AgentDetailPage />}
              />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
