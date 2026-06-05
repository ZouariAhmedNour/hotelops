import { BedDouble } from "lucide-react";
import { NAVIGATION_ITEMS } from "../../config/navigation";
import SidebarNavItem from "./SidebarNavItem";
import { useAuth } from "../../../features/auth/contexts/useAuth";
import { hasRole } from "../../utils/permissions";

const Sidebar = () => {
  const { user } = useAuth();

  const roleCode = user?.role?.code;

  const visibleItems = NAVIGATION_ITEMS.filter((item) =>
    hasRole(roleCode, item.allowedRoles)
  );

  const operationItems = visibleItems.filter(
    (item) => item.section === "operations"
  );

  const administrationItems = visibleItems.filter(
    (item) => item.section === "administration"
  );

  return (
    <aside className="flex h-screen w-[290px] shrink-0 flex-col border-r border-slate-200 bg-white">
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

      {operationItems.length > 0 && (
        <>
          <div className="px-6 pt-12">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Opérations
            </p>
          </div>

          <nav className="mt-4 space-y-2 px-4">
            {operationItems.map((item) => (
              <SidebarNavItem key={item.path} item={item} />
            ))}
          </nav>
        </>
      )}

      {administrationItems.length > 0 && (
        <>
          <div className="px-6 pt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Administration
            </p>
          </div>

          <nav className="mt-4 flex-1 space-y-2 px-4">
            {administrationItems.map((item) => (
              <SidebarNavItem key={item.path} item={item} />
            ))}
          </nav>
        </>
      )}

      <div className="mt-auto p-5">
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