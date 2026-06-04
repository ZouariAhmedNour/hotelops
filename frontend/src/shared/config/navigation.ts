import type { ElementType } from "react";
import {
  LayoutGrid,
  BrushCleaning,
  Wrench,
  Boxes,
  Wallet,
  Users,
  BarChart3,
} from "lucide-react";

import { ROUTES } from "./routes";
import { ROLES, type RoleCode } from "./roles";

export type NavigationSection = "operations" | "administration";

export interface NavigationItem {
  label: string;
  path: string;
  icon: ElementType;
  section: NavigationSection;
  allowedRoles: RoleCode[];
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: "Accueil",
    path: ROUTES.DASHBOARD,
    icon: LayoutGrid,
    section: "operations",
    allowedRoles: [
      ROLES.ADMIN,
      ROLES.RECEPTION,
      ROLES.CHEF_MAINT,
      ROLES.MAINTENANCE_AGENT,
      ROLES.HOUSEKEEPING,
      ROLES.FINANCE,
    ],
  },
  {
    label: "Housekeeping",
    path: ROUTES.HOUSEKEEPING,
    icon: BrushCleaning,
    section: "operations",
    allowedRoles: [ROLES.ADMIN, ROLES.RECEPTION, ROLES.HOUSEKEEPING],
  },
  {
    label: "Maintenance",
    path: ROUTES.TICKETS,
    icon: Wrench,
    section: "operations",
    allowedRoles: [
      ROLES.ADMIN,
      ROLES.RECEPTION,
      ROLES.CHEF_MAINT,
      ROLES.MAINTENANCE_AGENT,
    ],
  },
  {
    label: "Stock & Achats",
    path: ROUTES.STOCKS,
    icon: Boxes,
    section: "operations",
    allowedRoles: [ROLES.ADMIN, ROLES.CHEF_MAINT],
  },
  {
    label: "Finance",
    path: ROUTES.FINANCE,
    icon: Wallet,
    section: "administration",
    allowedRoles: [ROLES.ADMIN, ROLES.FINANCE],
  },
  {
    label: "Ressources Humaines",
    path: ROUTES.USERS,
    icon: Users,
    section: "administration",
    allowedRoles: [ROLES.ADMIN],
  },
  {
    label: "Rapports",
    path: ROUTES.REPORTS,
    icon: BarChart3,
    section: "administration",
    allowedRoles: [ROLES.ADMIN, ROLES.CHEF_MAINT, ROLES.FINANCE],
  },
];