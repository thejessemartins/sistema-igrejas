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
