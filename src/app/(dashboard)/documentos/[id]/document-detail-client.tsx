"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload } from "lucide-react";
import {
  DOCUMENT_VISIBILITIES,
  VISIBILITY_LABELS,
  type DocumentVisibility,
} from "@/lib/document-access";
import {
  updateDocumentVisibility,
  uploadDocumentVersion,
} from "@/server/actions/documents";

interface Props {
  doc: {
    id: string;
    title: string;
    category: string;
    description: string | null;
    visibility: string;
    currentVersion: number;
  };
  versions: Array<{
    id: string;
    versionNumber: number;
    fileSizeBytes: number;
    changeNotes: string | null;
    createdAt: Date;
  }>;
  canManage: boolean;
}

export function DocumentDetailClient({ doc, versions, canManage }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  function handleUploadVersion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    const formData = new FormData(e.currentTarget);
    const formEl = e.currentTarget;

    startTransition(async () => {
      const res = await uploadDocumentVersion(doc.id, formData);
      if (!res.ok) {
        setFeedback({ type: "error", text: res.error });
        return;
      }
      setFeedback({ type: "ok", text: res.message ?? "Versão enviada." });
      formEl.reset();
      router.refresh();
    });
  }

  function handleVisibilityChange(newVisibility: DocumentVisibility) {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateDocumentVisibility(doc.id, newVisibility);
      if (!res.ok) {
        setFeedback({ type: "error", text: res.error });
        return;
      }
      setFeedback({ type: "ok", text: res.message ?? "Atualizado." });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`rounded-[2px] border px-4 py-2 text-sm ${
            feedback.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 space-y-3">
        {doc.description && (
          <p className="text-sm text-neutral-700">{doc.description}</p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-neutral-700">Visibilidade:</span>
            {canManage ? (
              <select
                value={doc.visibility}
                disabled={isPending}
                onChange={(e) =>
                  handleVisibilityChange(e.target.value as DocumentVisibility)
                }
                className="h-8 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-xs"
              >
                {DOCUMENT_VISIBILITIES.map((v) => (
                  <option key={v} value={v}>
                    {VISIBILITY_LABELS[v]}
                  </option>
                ))}
              </select>
            ) : (
              <span>
                {VISIBILITY_LABELS[doc.visibility as DocumentVisibility] ??
                  doc.visibility}
              </span>
            )}
          </div>

          <a
            href={`/api/documentos/${doc.id}/download`}
            className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-neutral-900 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-neutral-800"
          >
            <Download className="h-3.5 w-3.5" />
            Baixar versão atual (v{doc.currentVersion})
          </a>
        </div>
      </div>

      {canManage && (
        <form
          onSubmit={handleUploadVersion}
          className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 space-y-3"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
            Enviar Nova Versão
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="file"
              name="file"
              accept=".pdf,.docx,.odt"
              required
              className="text-sm text-neutral-700"
            />
            <input
              type="text"
              name="changeNotes"
              placeholder="Nota de alteração (ex: Correção do art. 4º)"
              required
              className="h-9 rounded-[2px] border border-neutral-300 px-3 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-neutral-900 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-neutral-800 disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            {isPending ? "Enviando..." : "Enviar Nova Versão"}
          </button>
        </form>
      )}

      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
          Histórico de Versões
        </h3>
        <div className="overflow-x-auto rounded-[2px] border border-neutral-200 bg-neutral-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-2">Versão</th>
                <th className="px-4 py-2">Nota de alteração</th>
                <th className="px-4 py-2">Tamanho</th>
                <th className="px-4 py-2 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {versions.map((v) => (
                <tr key={v.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-2 font-mono text-xs">
                    v{v.versionNumber}
                  </td>
                  <td className="px-4 py-2 text-neutral-700">
                    {v.changeNotes || "—"}
                  </td>
                  <td className="px-4 py-2 text-xs text-neutral-500">
                    {Math.max(1, Math.round(v.fileSizeBytes / 1024))} KB
                  </td>
                  <td className="px-4 py-2 text-right">
                    <a
                      href={`/api/documentos/${doc.id}/download?version=${v.versionNumber}`}
                      className="inline-flex h-7 items-center gap-1 rounded-[2px] border border-neutral-200 px-2.5 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-100"
                    >
                      <Download className="h-3 w-3" />
                      Baixar v{v.versionNumber}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
