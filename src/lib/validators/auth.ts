import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nhập tên từ 2 ký tự."),
  email: z.email("Email không hợp lệ."),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự."),
});

export const loginSchema = z.object({
  email: z.email("Email không hợp lệ."),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự."),
});
