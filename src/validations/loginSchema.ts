import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password must be at least 6 characters"),
  crmLink: z.string().url("Enter a valid CRM URL"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
