import type { RoleCode } from "../config/roles";

export const hasRole = (
  roleCode: string | undefined,
  allowedRoles: RoleCode[]
): boolean => {
  if (!roleCode) return false;

  return allowedRoles.includes(roleCode.toUpperCase() as RoleCode);
};