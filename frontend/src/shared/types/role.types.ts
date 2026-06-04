import type { RoleCode } from "../config/roles";

export interface RolePermission {
  role: RoleCode;
  permissions: string[];
}