import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import LoginPage from "../pages/LoginPage";
import TicketListPage from "../pages/TicketListPage";
import Layout from "../components/layout/Layout";
import DashboardPage from "../pages/DashboardPage";
import TicketCreatePage from "../pages/TicketCreatePage";
import TicketDetailPage from "../pages/TicketDetailPage";
import UsersPage from "../pages/UsersPage";
import { AuthProvider } from "../contexts/AuthProvider";
import SignupPage from "../pages/SignupPage";

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tickets" element={<TicketListPage />} />
            <Route path="/tickets/new" element={<TicketCreatePage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
export default AppRouter;
