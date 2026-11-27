export type SupportedLocale = "pt-BR" | "es" | "en";

export const MESSAGES: Record<
  SupportedLocale,
  {
    dashboard: string;
    members: string;
    notices: string;
    accessibility: string;
  }
> = {
  "pt-BR": {
    dashboard: "Painel",
    members: "Membros",
    notices: "Avisos",
    accessibility: "Acessibilidade",
  },
  es: {
    dashboard: "Panel",
    members: "Miembros",
    notices: "Avisos",
    accessibility: "Accesibilidad",
  },
  en: {
    dashboard: "Dashboard",
    members: "Members",
    notices: "Notices",
    accessibility: "Accessibility",
  },
};
