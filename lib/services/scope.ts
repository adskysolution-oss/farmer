import { Prisma, UserRole } from "@prisma/client";

type ScopedUser = {
  role: UserRole;
  partner?: { id: string } | null;
  employee?: { id: string; partnerId: string | null } | null;
};

export function getApplicationScope(user: ScopedUser): Prisma.LoanApplicationWhereInput {
  if (user.role === "ADMIN") {
    return {};
  }

  if (user.role === "PARTNER" && user.partner?.id) {
    return { partnerId: user.partner.id };
  }

  if (user.role === "CALLER" && user.employee?.id) {
    return { callerId: user.employee.id };
  }

  if (user.role === "EMPLOYEE" && user.employee?.id) {
    return { employeeId: user.employee.id };
  }

  return { id: "__none__" };
}

export function getEmployeeScope(user: ScopedUser): Prisma.EmployeeWhereInput {
  if (user.role === "ADMIN") {
    return {};
  }

  if (user.role === "PARTNER" && user.partner?.id) {
    return { partnerId: user.partner.id };
  }

  if (user.employee?.id) {
    return { id: user.employee.id };
  }

  return { id: "__none__" };
}

export function getPartnerScope(user: ScopedUser): Prisma.PartnerWhereInput {
  if (user.role === "ADMIN") {
    return {};
  }

  if (user.role === "PARTNER" && user.partner?.id) {
    return { id: user.partner.id };
  }

  if (user.employee?.partnerId) {
    return { id: user.employee.partnerId };
  }

  return { id: "__none__" };
}

export function getWalletScope(user: ScopedUser): Prisma.WalletWhereInput {
  if (user.role === "ADMIN") {
    return {};
  }

  if (user.role === "PARTNER" && user.partner?.id) {
    return { partnerId: user.partner.id };
  }

  if (user.employee?.id) {
    return { employeeId: user.employee.id };
  }

  return { id: "__none__" };
}
