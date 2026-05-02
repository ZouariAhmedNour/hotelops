import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";

const Sidebar = () => {
  const { user } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium transition",
      isActive
        ? "bg-slate-100 text-[#13234b]"
        : "text-slate-500 hover:bg-slate-50 hover:text-[#13234b]",
    ].join(" ");

  return (
    <aside className="flex h-screen w-[290px] shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#13234b] text-white">
            ⌂
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#13234b]">Le Concierge</h1>
            <p className="text-xs text-slate-400">
              {user?.role?.name ?? "Espace de gestion"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pt-10 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        Opérations
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-4">
        <NavLink to="/dashboard" className={linkClass}>
          <span>Accueil</span>
        </NavLink>

        <NavLink to="/tickets" className={linkClass}>
          <span>Tickets</span>
        </NavLink>

        <NavLink to="/users" className={linkClass}>
          <span>Utilisateurs</span>
        </NavLink>
      </nav>

      <div className="p-4">
        <div className="rounded-[28px] bg-[#13234b] p-5 text-white shadow-[0_20px_40px_rgba(19,35,75,0.25)]">
          <p className="text-base font-semibold">Support 24/7</p>
          <p className="mt-2 text-sm leading-6 text-white/70">
            Besoin d’aide avec un module ? Contactez la conciergerie technique.
          </p>
          <button className="mt-5 w-full rounded-full bg-white/10 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
            Aide rapide
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;