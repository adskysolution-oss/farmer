import { EmployeeStatus } from "@prisma/client";
import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().min(2),
  mobile: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
  partnerId: z.string().optional().nullable(),
  state: z.string().min(2),
  district: z.string().min(2),
  tehsil: z.string().optional().or(z.literal("")),
  designation: z.string().min(2),
  isCaller: z.boolean().default(false),
  fixedSalaryPaise: z.number().int().min(0).default(0),
  commissionRate: z.number().min(0).max(100).default(0),
  status: z.nativeEnum(EmployeeStatus).default(EmployeeStatus.ACTIVE),
});
