import { z } from "zod";
import { ROLES } from "./permissions";

const passwordSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .regex(/[a-zA-Z]/, "A senha deve conter pelo menos uma letra")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número");

export const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe a senha"),
});

export const recoverPasswordSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token de redefinição obrigatório"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().trim().email("Informe um e-mail válido"),
  role: z.enum(ROLES, { message: "Papel inválido" }),
  password: passwordSchema,
  active: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  userId: z.string().min(1),
  name: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres"),
  role: z.enum(ROLES, { message: "Papel inválido" }),
  active: z.boolean(),
});
