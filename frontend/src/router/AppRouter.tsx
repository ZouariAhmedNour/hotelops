import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import PrivateRoute from "../components/PrivateRoute";
import LoginPage from "../pages/LoginPage";
import TicketListPage from "../pages/TicketListPage";

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
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
