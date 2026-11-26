"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { importMembersCsv } from "@/server/actions/settings";

export default function ImportarMembrosPage() {
  const [csvText, setCsvText] = useState(
    "nome;telefone;email;status\nMaria Teste;(11) 99999-0001;maria@exemplo.local;ativo"
  );
  const [result, setResult] = useState<{
    imported: number;
    ignored: number;
    errors: string[];
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setResult(null);
    const res = await importMembersCsv(csvText);
    if (!res.ok) return setErr(res.error);
    if (res.data) setResult(res.data);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Importar Membros (CSV)"
        description="Formato: nome;telefone;email;status"
      />

      <SeraCard title="Importação em Lote">
        <form onSubmit={handleImport} className="space-y-4">
          {err ? (
            <div className="rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600">
              {err}
            </div>
          ) : null}

          <textarea
            rows={8}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full rounded-[2px] border border-neutral-300 bg-transparent p-2 font-mono text-xs"
          />

          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-[2px] bg-blue-600 px-5 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
          >
            Importar CSV
          </button>
        </form>

        {result ? (
          <div className="mt-4 space-y-2 rounded-[2px] border border-neutral-200 bg-neutral-25 p-3 text-xs">
            <p>
              Importados: <strong>{result.imported}</strong> · Ignorados:{" "}
              <strong>{result.ignored}</strong>
            </p>
            {result.errors.map((e, i) => (
              <p key={i} className="text-red-600">
                {e}
              </p>
            ))}
          </div>
        ) : null}
      </SeraCard>
    </div>
  );
}
