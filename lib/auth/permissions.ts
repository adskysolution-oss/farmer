import "server-only";

import { UserRole } from "@prisma/client";

export const roleHierarchy: Record<UserRole, number> = {
  ADMIN: 4,
  PARTNER: 3,
  EMPLOYEE: 2,
  CALLER: 1,
};

export function hasRole(userRole: UserRole, allowed: UserRole[]) {
  return allowed.includes(userRole);
}

export function canManagePartners(role: UserRole) {
  return hasRole(role, ["ADMIN"]);
}

export function canManageEmployees(role: UserRole) {
  return hasRole(role, ["ADMIN", "PARTNER"]);
}

export function canManageFarmers(role: UserRole) {
  return hasRole(role, ["ADMIN", "PARTNER", "EMPLOYEE", "CALLER"]);
}

export function canApproveWithdrawals(role: UserRole) {
  return hasRole(role, ["ADMIN"]);
}
