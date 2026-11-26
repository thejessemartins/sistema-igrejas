import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sistema para Igrejas",
    short_name: "Igrejas",
    description: "Gestão local para igrejas — Padrão Sera",
    start_url: "/painel",
    display: "standalone",
    background_color: "#F5F5F5",
    theme_color: "#1447E6",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
