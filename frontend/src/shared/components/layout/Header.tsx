import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import { useAuth } from "../../../features/auth/contexts/useAuth";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Tableau de bord
        </p>

        <h2 className="text-xl font-semibold text-[#13234b]">Bienvenue</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden text-right md:block">
          <p className="text-sm font-semibold text-[#13234b]">
            {user?.firstName} {user?.lastName}
          </p>

          <p className="text-xs text-slate-400">{user?.role?.name}</p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;