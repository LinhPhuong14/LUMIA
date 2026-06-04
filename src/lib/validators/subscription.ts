import { z } from "zod";

export const activationCodeSchema = z.object({
  code: z.string().min(6).max(32),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(80),
  bio: z.string().max(240).optional().or(z.literal("")),
  sleepGoal: z.string().max(20).optional().or(z.literal("")),
  wakeGoal: z.string().max(20).optional().or(z.literal("")),
});
