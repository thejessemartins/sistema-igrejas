"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveUserPreferences } from "@/server/actions/preferences";

export function AcessibilidadeClient({
  initial,
}: {
  initial: {
    fontSizeScale: string;
    reduceMotion: boolean;
    highContrastText: boolean;
    simplifiedLists: boolean;
    locale: string;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fontSizeScale, setFontSizeScale] = useState(initial.fontSizeScale);
  const [reduceMotion, setReduceMotion] = useState(initial.reduceMotion);
  const [highContrastText, setHighContrastText] = useState(
    initial.highContrastText
  );
  const [simplifiedLists, setSimplifiedLists] = useState(
    initial.simplifiedLists
  );
  const [locale, setLocale] = useState(initial.locale);
  const [msg, setMsg] = useState<string | null>(null);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveUserPreferences({
        fontSizeScale,
        reduceMotion,
        highContrastText,
        simplifiedLists,
        locale,
      });
      setMsg(res.ok ? (res.message ?? "Salvo") : res.error);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {msg && (
        <div className="rounded-[2px] border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          {msg}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-6 space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-600">
              Tamanho da fonte
            </label>
            <select
              value={fontSizeScale}
              onChange={(e) => setFontSizeScale(e.target.value)}
              className="mt-1 h-9 w-full rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
            >
              <option value="padrao">Padrão</option>
              <option value="maior">Maior</option>
              <option value="muito_maior">Muito maior</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-600">
              Idioma
            </label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="mt-1 h-9 w-full rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={(e) => setReduceMotion(e.target.checked)}
            />
            Reduzir animações
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={highContrastText}
              onChange={(e) => setHighContrastText(e.target.checked)}
            />
            Alto contraste no texto
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={simplifiedLists}
              onChange={(e) => setSimplifiedLists(e.target.checked)}
            />
            Leitura simplificada de listas (linhas mais espaçadas)
          </label>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="h-9 rounded-[2px] bg-neutral-900 px-5 text-xs font-bold uppercase text-neutral-0"
        >
          {isPending ? "Salvando..." : "Salvar Preferências"}
        </button>
      </form>

      <div className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-6 space-y-2 text-sm text-neutral-700">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
          Atalhos de Teclado e Suporte
        </h3>
        <p>
          Use <kbd className="rounded border px-1.5 py-0.5 text-xs">Tab</kbd> e{" "}
          <kbd className="rounded border px-1.5 py-0.5 text-xs">Shift+Tab</kbd>{" "}
          para navegar entre campos e botões. Para suporte, procure a secretaria
          da igreja.
        </p>
      </div>
    </div>
  );
}
