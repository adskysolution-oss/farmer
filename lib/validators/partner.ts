import { PartnerStatus } from "@prisma/client";
import { z } from "zod";

export const partnerSchema = z.object({
  name: z.string().min(2),
  mobile: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
  state: z.string().min(2),
  district: z.string().min(2),
  tehsil: z.string().min(2),
  status: z.nativeEnum(PartnerStatus).default(PartnerStatus.ACTIVE),
});
