import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../../features/auth/pages/LoginPage";
import SignupPage from "../../features/auth/pages/SignupPage";
import DashboardPage from "../../features/dashboard/pages/DashboardPage";




const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

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
              <Route path={ROUTES.TICKET_CREATE} element={<TicketCreatePage />} />
              <Route path={ROUTES.TICKET_DETAIL} element={<TicketDetailPage />} />
            </Route>

            <Route
              element={
                <RoleGuard
                  allowedRoles={[ROLES.ADMIN, ROLES.RECEPTION, ROLES.HOUSEKEEPING]}
                />
              }
            >
              <Route path={ROUTES.HOUSEKEEPING} element={<HousekeepingPage />} />
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
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;