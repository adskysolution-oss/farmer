import { LoanStatus, PaymentStatus } from "@prisma/client";
import { z } from "zod";

export const farmerSchema = z.object({
  name: z.string().min(2),
  mobile: z.string().min(10),
  state: z.string().min(2),
  district: z.string().min(2),
  tehsil: z.string().optional().or(z.literal("")),
  village: z.string().min(2),
  loanType: z.string().min(2),
  requestedAmountPaise: z.number().int().min(0).optional(),
  status: z.nativeEnum(LoanStatus).default(LoanStatus.SUBMITTED),
  paymentStatus: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  paymentAmountPaise: z.number().int().min(0).default(24900),
  partnerId: z.string().optional().nullable(),
  employeeId: z.string().optional().nullable(),
  callerId: z.string().optional().nullable(),
});
