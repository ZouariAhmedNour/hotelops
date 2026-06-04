import { NavLink } from "react-router-dom";
import type { NavigationItem } from "../../config/navigation";

interface SidebarNavItemProps {
  item: NavigationItem;
}

const SidebarNavItem = ({ item }: SidebarNavItemProps) => {
  const Icon = item.icon;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium transition",
      isActive
        ? "bg-slate-100 text-[#13234b]"
        : "text-slate-500 hover:bg-slate-50 hover:text-[#13234b]",
    ].join(" ");

  return (
    <NavLink to={item.path} className={linkClass}>
      <Icon size={20} />
      <span>{item.label}</span>
    </NavLink>
  );
};

export default SidebarNavItem;