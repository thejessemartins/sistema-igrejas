"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { exportBackupJson } from "@/server/actions/settings";

export default function BackupPage() {
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDownloadBackup() {
    setErr(null);
    setLoading(true);
    const res = await exportBackupJson();
    setLoading(false);
    if (!res.ok) return setErr(res.error);

    if (res.data?.json) {
      const blob = new Blob([res.data.json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-sistema-igrejas-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Backup Local"
        description="Exporte os dados das tabelas de negócio em JSON estruturado."
      />

      <SeraCard
        title="Gerar Backup JSON"
        description="Para backup completo do banco PostgreSQL local, utilize o comando pg_dump."
      >
        {err ? (
          <div className="mb-3 rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600">
            {err}
          </div>
        ) : null}
        <button
          type="button"
          disabled={loading}
          onClick={handleDownloadBackup}
          className="inline-flex h-9 items-center gap-1.5 rounded-[2px] bg-blue-600 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700 disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          {loading ? "Gerando..." : "Baixar Backup JSON"}
        </button>
      </SeraCard>
    </div>
  );
}
