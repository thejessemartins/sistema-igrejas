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

// --- Membros ---

export const MEMBER_STATUSES = [
  "ativo",
  "inativo",
  "afastado",
  "transferido",
  "falecido",
] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export const MARITAL_STATUSES = [
  "solteiro",
  "casado",
  "divorciado",
  "viuvo",
  "uniao_estavel",
] as const;

export const FAMILY_RELATIONS = [
  "conjuge",
  "filho",
  "filha",
  "pai",
  "mae",
  "dependente",
  "outro",
] as const;
export type FamilyRelation = (typeof FAMILY_RELATIONS)[number];

export function isValidCpf(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(digits[i]) * (10 - i);
  let check = (sum * 10) % 11;
  if (check === 10) check = 0;
  if (check !== Number(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(digits[i]) * (11 - i);
  check = (sum * 10) % 11;
  if (check === 10) check = 0;
  return check === Number(digits[10]);
}

function isNotFutureDate(val?: string | null): boolean {
  if (!val) return true;
  const parsed = new Date(val);
  if (Number.isNaN(parsed.getTime())) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return parsed <= today;
}

export const memberSchema = z
  .object({
    fullName: z.string().trim().min(2, "Nome completo é obrigatório"),
    birthDate: z
      .string()
      .optional()
      .nullable()
      .refine(isNotFutureDate, "Data de nascimento não pode ser futura"),
    cpf: z
      .string()
      .optional()
      .nullable()
      .transform((v) => (v ? v.replace(/\D/g, "") : null))
      .refine((v) => !v || isValidCpf(v), "CPF inválido"),
    phone: z.string().trim().optional().nullable(),
    email: z
      .string()
      .trim()
      .optional()
      .nullable()
      .refine(
        (v) => !v || z.string().email().safeParse(v).success,
        "E-mail inválido"
      ),
    addressStreet: z.string().trim().optional().nullable(),
    addressNumber: z.string().trim().optional().nullable(),
    addressComplement: z.string().trim().optional().nullable(),
    addressDistrict: z.string().trim().optional().nullable(),
    addressCity: z.string().trim().optional().nullable(),
    addressState: z.string().trim().max(2).optional().nullable(),
    addressZip: z.string().trim().optional().nullable(),
    maritalStatus: z.enum(MARITAL_STATUSES).optional().nullable(),
    baptismDate: z
      .string()
      .optional()
      .nullable()
      .refine(isNotFutureDate, "Data de batismo não pode ser futura"),
    joinedAt: z.string().optional().nullable(),
    status: z.enum(MEMBER_STATUSES).default("ativo"),
    notes: z.string().trim().optional().nullable(),
  })
  .refine((d) => Boolean(d.phone?.trim() || d.email?.trim()), {
    message: "Informe pelo menos um contato (telefone ou e-mail)",
    path: ["phone"],
  });

export const linkFamilySchema = z.object({
  memberId: z.string().uuid(),
  relatedMemberId: z.string().uuid(),
  relation: z.enum(FAMILY_RELATIONS),
});

// --- Visitantes ---

export const FOLLOW_UP_STATUSES = [
  "novo",
  "em_contato",
  "retornou",
  "virou_membro",
  "nao_retornou",
] as const;
export type FollowUpStatus = (typeof FOLLOW_UP_STATUSES)[number];

export const FOLLOW_UP_LABELS: Record<FollowUpStatus, string> = {
  novo: "Novo",
  em_contato: "Em contato",
  retornou: "Retornou",
  virou_membro: "Virou membro",
  nao_retornou: "Não retornou",
};

export const visitorSchema = z.object({
  fullName: z.string().trim().min(2, "Nome é obrigatório"),
  phone: z.string().trim().optional().nullable(),
  email: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (v) => !v || z.string().email().safeParse(v).success,
      "E-mail inválido"
    ),
  invitedByMemberId: z.string().uuid().optional().nullable(),
  invitedByText: z.string().trim().optional().nullable(),
  firstVisitAt: z.string().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

export const visitorVisitSchema = z.object({
  visitorId: z.string().uuid(),
  visitedAt: z.string().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

// --- Células ---

export const WEEKDAYS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
] as const;

export const ATTENDANCE_STATUSES = [
  "presente",
  "ausente",
  "justificado",
] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const cellSchema = z.object({
  name: z.string().trim().min(2, "Nome da célula é obrigatório"),
  leaderMemberId: z.string().uuid("Selecione o líder da célula"),
  coLeaderMemberId: z.string().uuid().optional().nullable(),
  weekday: z.coerce.number().int().min(0).max(6),
  meetingTime: z.string().min(4, "Informe o horário"),
  addressStreet: z.string().trim().optional().nullable(),
  addressDistrict: z.string().trim().optional().nullable(),
  addressCity: z.string().trim().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const cellMeetingSchema = z.object({
  cellId: z.string().uuid(),
  meetingDate: z.string().min(1, "Data da reunião é obrigatória"),
  topic: z.string().trim().min(2, "Tema é obrigatório"),
  notes: z.string().trim().optional().nullable(),
});

// --- Cultos e Eventos ---

export const EVENT_TYPES = [
  "culto_domingo",
  "culto_oracao",
  "vigilia",
  "batismo",
  "santa_ceia",
  "ensaio",
  "reuniao",
  "evento_especial",
  "outro",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  culto_domingo: "Culto de Domingo",
  culto_oracao: "Culto de Oração",
  vigilia: "Vigília",
  batismo: "Batismo",
  santa_ceia: "Santa Ceia",
  ensaio: "Ensaio",
  reuniao: "Reunião",
  evento_especial: "Evento Especial",
  outro: "Outro",
};

export const EVENT_STATUSES = ["agendado", "realizado", "cancelado"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const eventSchema = z
  .object({
    title: z.string().trim().min(2, "Título é obrigatório"),
    eventType: z.enum(EVENT_TYPES),
    startsAt: z.string().min(1, "Data/hora de início é obrigatória"),
    endsAt: z.string().optional().nullable(),
    location: z.string().trim().optional().nullable(),
    theme: z.string().trim().optional().nullable(),
    preacherText: z.string().trim().optional().nullable(),
    preacherMemberId: z.string().uuid().optional().nullable(),
    description: z.string().trim().optional().nullable(),
    repeatWeeks: z.coerce.number().int().min(1).max(52).default(1),
  })
  .refine(
    (d) => !d.endsAt || new Date(d.endsAt) > new Date(d.startsAt),
    {
      message: "Data/hora de término deve ser maior que a de início",
      path: ["endsAt"],
    }
  );

// --- Ministérios e Escalas ---

export const ministrySchema = z.object({
  name: z.string().trim().min(2, "Nome do ministério é obrigatório"),
  description: z.string().trim().optional().nullable(),
  leaderMemberId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const scheduleSchema = z.object({
  eventId: z.string().uuid("Selecione o culto/evento"),
  ministryId: z.string().uuid("Selecione o ministério"),
  title: z.string().trim().min(2, "Título da escala é obrigatório"),
  notes: z.string().trim().optional().nullable(),
});

// --- Financeiro ---

export const PAYMENT_METHODS = [
  "dinheiro",
  "transferencia_manual",
  "cheque",
  "cartao_manual",
  "outro",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const transactionSchema = z.object({
  kind: z.enum(["receita", "despesa"]),
  categoryId: z.string().uuid("Selecione a categoria"),
  memberId: z.string().uuid().optional().nullable(),
  isAnonymous: z.boolean().default(false),
  visitorNameText: z.string().trim().optional().nullable(),
  description: z.string().trim().min(2, "Descrição é obrigatória"),
  amountCents: z.coerce
    .number()
    .int("Valor deve ser inteiro em centavos")
    .positive("Valor deve ser maior que zero"),
  transactionDate: z.string().min(1, "Data é obrigatória"),
  paymentMethod: z.enum(PAYMENT_METHODS),
  supplierText: z.string().trim().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  paidAt: z.string().optional().nullable(),
});

// --- Avisos ---

export const NOTICE_AUDIENCES = [
  "todos",
  "ministerio",
  "celula",
  "papeis",
] as const;

export const NOTICE_PRIORITIES = ["normal", "importante", "urgente"] as const;

export const noticeSchema = z
  .object({
    title: z.string().trim().min(2, "Título é obrigatório"),
    body: z.string().trim().min(2, "Conteúdo é obrigatório"),
    audienceType: z.enum(NOTICE_AUDIENCES).default("todos"),
    ministryId: z.string().uuid().optional().nullable(),
    cellId: z.string().uuid().optional().nullable(),
    priority: z.enum(NOTICE_PRIORITIES).default("normal"),
    publishAt: z.string().optional().nullable(),
    expiresAt: z.string().optional().nullable(),
    isPinned: z.boolean().default(false),
  })
  .refine(
    (d) =>
      !d.expiresAt ||
      !d.publishAt ||
      new Date(d.expiresAt) > new Date(d.publishAt),
    {
      message: "Data de expiração deve ser posterior à publicação",
      path: ["expiresAt"],
    }
  );

// --- Patrimônio ---

export const ASSET_CATEGORIES = [
  "som",
  "instrumento",
  "moveis",
  "informatica",
  "veiculo",
  "cozinha",
  "outro",
] as const;

export const ASSET_CONDITIONS = [
  "novo",
  "bom",
  "regular",
  "ruim",
  "baixado",
] as const;

export const assetSchema = z.object({
  name: z.string().trim().min(2, "Nome do bem é obrigatório"),
  category: z.enum(ASSET_CATEGORIES),
  patrimonyCode: z.string().trim().min(2, "Código de patrimônio é obrigatório"),
  description: z.string().trim().optional().nullable(),
  locationText: z.string().trim().optional().nullable(),
  responsibleMemberId: z.string().uuid().optional().nullable(),
  acquiredAt: z.string().optional().nullable(),
  acquisitionValueCents: z.coerce.number().int().nonnegative().optional().nullable(),
  condition: z.enum(ASSET_CONDITIONS).default("bom"),
});
