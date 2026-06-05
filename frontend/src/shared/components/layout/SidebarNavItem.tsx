import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import type { NavigationItem } from "../../config/navigation";
import { hasRole } from "../../utils/permissions";

interface SidebarNavItemProps {
  item: NavigationItem;
  roleCode?: string;
}

const SidebarNavItem = ({ item, roleCode }: SidebarNavItemProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const Icon = item.icon;
  const hasChildren = Boolean(item.children?.length);

  const childIsActive = item.children?.some((child) =>
    location.pathname.startsWith(child.path)
  );

  const [open, setOpen] = useState(Boolean(childIsActive));

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium transition",
      isActive || childIsActive
        ? "bg-slate-100 text-[#13234b]"
        : "text-slate-500 hover:bg-slate-50 hover:text-[#13234b]",
    ].join(" ");

  if (!hasChildren) {
    return (
      <NavLink to={item.path} className={linkClass}>
        <Icon size={20} />
        <span>{item.label}</span>
      </NavLink>
    );
  }

  const visibleChildren =
    item.children?.filter((child) => hasRole(roleCode, child.allowedRoles)) ?? [];

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);

          if (!open && item.path) {
            navigate(item.path);
          }
        }}
        className={[
          "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-[15px] font-medium transition",
          childIsActive
            ? "bg-slate-100 text-[#13234b]"
            : "text-slate-500 hover:bg-slate-50 hover:text-[#13234b]",
        ].join(" ")}
      >
        <span className="flex items-center gap-3">
          <Icon size={20} />
          <span>{item.label}</span>
        </span>

        <ChevronDown
          size={16}
          className={`transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-2 space-y-1 pl-8">
          {visibleChildren.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              className={({ isActive }) =>
                [
                  "block rounded-xl px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-[#13234b] text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#13234b]",
                ].join(" ")
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarNavItem;