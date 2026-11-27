"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_VISIBILITIES,
  VISIBILITY_LABELS,
} from "@/lib/document-access";
import { createDocument } from "@/server/actions/documents";

export default function NovoDocumentoPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createDocument(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/documentos");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Documento"
        description="Envie um arquivo oficial (PDF, DOCX ou ODT até 10 MB)."
        actions={
          <Link
            href="/documentos"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Voltar
          </Link>
        }
      />

      {error && (
        <div className="rounded-[2px] border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-4 rounded-[2px] border border-neutral-200 bg-neutral-0 p-6"
      >
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
            Título
          </label>
          <input
            type="text"
            name="title"
            required
            className="mt-1 h-9 w-full rounded-[2px] border border-neutral-300 px-3 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
              Categoria
            </label>
            <select
              name="category"
              defaultValue="ata"
              className="mt-1 h-9 w-full rounded-[2px] border border-neutral-300 bg-neutral-0 px-3 text-sm"
            >
              {DOCUMENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
              Visibilidade
            </label>
            <select
              name="visibility"
              defaultValue="todos_logados"
              className="mt-1 h-9 w-full rounded-[2px] border border-neutral-300 bg-neutral-0 px-3 text-sm"
            >
              {DOCUMENT_VISIBILITIES.map((v) => (
                <option key={v} value={v}>
                  {VISIBILITY_LABELS[v]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
            Descrição (opcional)
          </label>
          <textarea
            name="description"
            rows={3}
            className="mt-1 w-full rounded-[2px] border border-neutral-300 p-3 text-sm"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
            Arquivo (PDF, DOCX, ODT — máx. 10 MB)
          </label>
          <input
            type="file"
            name="file"
            accept=".pdf,.docx,.odt"
            required
            className="mt-1 block w-full text-sm text-neutral-700"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
            Nota da versão
          </label>
          <input
            type="text"
            name="changeNotes"
            defaultValue="Versão inicial"
            className="mt-1 h-9 w-full rounded-[2px] border border-neutral-300 px-3 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="h-9 rounded-[2px] bg-neutral-900 px-5 text-xs font-bold uppercase tracking-wider text-neutral-0 hover:bg-neutral-800 disabled:opacity-50"
        >
          {isPending ? "Enviando..." : "Enviar Documento"}
        </button>
      </form>
    </div>
  );
}
