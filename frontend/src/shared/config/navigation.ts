import type { ElementType } from "react";
import {
  LayoutGrid,
  BrushCleaning,
  Wrench,
  Boxes,
  Wallet,
  Users,
  BarChart3,
  UserCog,
  QrCode,
  MapPinned,
} from "lucide-react";

import { ROUTES } from "./routes";
import { ROLES, type RoleCode } from "./roles";

export type NavigationSection = "operations" | "administration";

export interface NavigationChildItem {
  label: string;
  path: string;
  allowedRoles: RoleCode[];
}

export interface NavigationItem {
  label: string;
  path: string;
  icon: ElementType;
  section: NavigationSection;
  allowedRoles: RoleCode[];
  children?: NavigationChildItem[];
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
    label: "Équipes & Agents",
    path: ROUTES.MAINTENANCE_STAFF,
    icon: UserCog,
    section: "administration",
    allowedRoles: [ROLES.ADMIN],
    children: [
      {
        label: "Statistiques",
        path: ROUTES.MAINTENANCE_STAFF_STATS,
        allowedRoles: [ROLES.ADMIN],
      },
      {
        label: "Équipes",
        path: ROUTES.MAINTENANCE_STAFF_TEAMS,
        allowedRoles: [ROLES.ADMIN],
      },
      {
        label: "Compétences",
        path: ROUTES.MAINTENANCE_STAFF_SKILLS,
        allowedRoles: [ROLES.ADMIN],
      },
      {
        label: "Créer agent",
        path: ROUTES.MAINTENANCE_STAFF_AGENT_CREATE,
        allowedRoles: [ROLES.ADMIN],
      },
      {
        label: "Liste agents",
        path: ROUTES.MAINTENANCE_STAFF_AGENTS,
        allowedRoles: [ROLES.ADMIN],
      },
    ],
  },
  {
    label: "Rapports",
    path: ROUTES.REPORTS,
    icon: BarChart3,
    section: "administration",
    allowedRoles: [ROLES.ADMIN, ROLES.CHEF_MAINT, ROLES.FINANCE],
  },

{
  label: "Endroits",
  path: ROUTES.LOCATIONS,
  icon: MapPinned,
  section: "administration",
  allowedRoles: [ROLES.ADMIN],
},
{
  label: "Codes QR",
  path: ROUTES.QR_CODES,
  icon: QrCode,
  section: "administration",
  allowedRoles: [ROLES.ADMIN],
},
];