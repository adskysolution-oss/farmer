import { UserRole } from "@prisma/client";
import {
  Activity,
  Banknote,
  BriefcaseBusiness,
  CreditCard,
  FileStack,
  LayoutDashboard,
  Megaphone,
  Settings,
  UserRoundSearch,
  Users2,
  WalletCards,
  Waypoints,
} from "lucide-react";

export const DEFAULT_PAGE_SIZE = 10;

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  PARTNER: "Partner",
  EMPLOYEE: "Employee",
  CALLER: "Caller",
};

export const APP_NAME = "Kesari Loan CRM";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: ["ADMIN", "PARTNER", "EMPLOYEE", "CALLER"] as UserRole[] },
  { href: "/dashboard/partners", label: "Partners", icon: BriefcaseBusiness, roles: ["ADMIN"] as UserRole[] },
  { href: "/dashboard/employees", label: "Employees", icon: Users2, roles: ["ADMIN", "PARTNER"] as UserRole[] },
  { href: "/dashboard/farmers", label: "Farmers", icon: UserRoundSearch, roles: ["ADMIN", "PARTNER", "EMPLOYEE", "CALLER"] as UserRole[] },
  { href: "/dashboard/calling", label: "Calling Ops", icon: FileStack, roles: ["ADMIN", "CALLER", "PARTNER"] as UserRole[] },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard, roles: ["ADMIN", "PARTNER"] as UserRole[] },
  { href: "/dashboard/wallets", label: "Wallets", icon: WalletCards, roles: ["ADMIN", "PARTNER", "EMPLOYEE", "CALLER"] as UserRole[] },
  { href: "/dashboard/withdrawals", label: "Withdrawals", icon: Banknote, roles: ["ADMIN", "PARTNER", "EMPLOYEE", "CALLER"] as UserRole[] },
  { href: "/dashboard/marketing", label: "Marketing", icon: Megaphone, roles: ["ADMIN"] as UserRole[] },
  { href: "/dashboard/form-builder", label: "Form Builder", icon: Waypoints, roles: ["ADMIN"] as UserRole[] },
  { href: "/dashboard/tracking", label: "Live Tracking", icon: Activity, roles: ["ADMIN", "PARTNER"] as UserRole[] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["ADMIN"] as UserRole[] },
];

export const LOAN_STATUS_OPTIONS = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "DOCUMENT_PENDING",
  "APPROVED",
  "REJECTED",
  "DISBURSED",
] as const;

export const PAYMENT_GATEWAYS = ["RAZORPAY", "PHONEPE", "KESARI"] as const;
