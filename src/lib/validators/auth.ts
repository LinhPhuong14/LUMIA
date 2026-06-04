import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nhap ten tu 2 ky tu."),
  email: z.email("Email khong hop le."),
  password: z.string().min(8, "Mat khau toi thieu 8 ky tu."),
});

export const loginSchema = z.object({
  email: z.email("Email khong hop le."),
  password: z.string().min(8, "Mat khau toi thieu 8 ky tu."),
});
