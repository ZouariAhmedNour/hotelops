import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";

import {
  LayoutGrid,
  BrushCleaning,
  Wrench,
  Boxes,
  Wallet,
  Users,
  BarChart3,
  BedDouble,
} from "lucide-react";


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
      {/* LOGO */}
      <div className="px-6 pt-7">
        <div className="flex items-center gap-3">
          <BedDouble className="h-7 w-7 text-[#13234b]" />

          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-[#13234b]">
              Le Concierge
            </h1>

            <p className="text-sm text-slate-400">
              {user?.role?.name ?? "Espace de gestion"}
            </p>
          </div>
        </div>
      </div>

      {/* OPERATIONS */}
      <div className="px-6 pt-12">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Opérations
        </p>
      </div>

      <nav className="mt-4 space-y-2 px-4">
        <NavLink to="/dashboard" className={linkClass}>
          <LayoutGrid size={20} />
          <span>Accueil</span>
        </NavLink>

        <NavLink to="/housekeeping" className={linkClass}>
          <BrushCleaning size={20} />
          <span>Housekeeping</span>
        </NavLink>

        <NavLink to="/tickets" className={linkClass}>
          <Wrench size={20} />
          <span>Maintenance</span>
        </NavLink>

        <NavLink to="/stocks" className={linkClass}>
          <Boxes size={20} />
          <span>Stock & Achats</span>
        </NavLink>
      </nav>

      {/* ADMINISTRATION */}
      <div className="px-6 pt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Administration
        </p>
      </div>

      <nav className="mt-4 flex-1 space-y-2 px-4">
        <NavLink to="/finance" className={linkClass}>
          <Wallet size={20} />
          <span>Finance</span>
        </NavLink>

        <NavLink to="/users" className={linkClass}>
          <Users size={20} />
          <span>Ressources Humaines</span>
        </NavLink>

        <NavLink to="/reports" className={linkClass}>
          <BarChart3 size={20} />
          <span>Rapports</span>
        </NavLink>
      </nav>

      {/* SUPPORT CARD */}
      <div className="p-5">
        <div className="rounded-[30px] bg-[#13234b] p-6 text-white shadow-[0_20px_50px_rgba(19,35,75,0.22)]">
          <p className="text-lg font-semibold">Support 24/7</p>

          <p className="mt-3 text-sm leading-6 text-white/70">
            Besoin d’aide avec un module ? Contactez la conciergerie technique.
          </p>

          <button className="mt-6 w-full rounded-full bg-white/10 py-3 text-sm font-semibold transition hover:bg-white/15">
            AIDE RAPIDE
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;