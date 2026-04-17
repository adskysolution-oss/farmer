import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(5, "Enter your mobile number or email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(5, "Enter your mobile number or email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Invalid reset token"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
