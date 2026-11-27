"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createSurvey, updateSurveyStatus } from "@/server/actions/surveys";

interface SurveyRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  isAnonymous: boolean;
}

export function PesquisasClient({
  surveys,
  canManage,
}: {
  surveys: SurveyRow[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [qText, setQText] = useState("");
  const [qKind, setQKind] = useState<
    | "texto_curto"
    | "texto_longo"
    | "unica_escolha"
    | "multipla_escolha"
    | "nota_1_5"
    | "sim_nao"
  >("unica_escolha");
  const [qOptions, setQOptions] = useState("Sim, Não, Talvez");
  const [questions, setQuestions] = useState<
    Array<{
      questionText: string;
      kind: typeof qKind;
      options: string[] | null;
      isRequired: boolean;
    }>
  >([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  function addQuestion() {
    if (!qText.trim()) return;
    const needsOpts = qKind === "unica_escolha" || qKind === "multipla_escolha";
    const opts = needsOpts
      ? qOptions
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : null;
    setQuestions((prev) => [
      ...prev,
      { questionText: qText.trim(), kind: qKind, options: opts, isRequired: true },
    ]);
    setQText("");
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const res = await createSurvey({
        title,
        description: description || null,
        isAnonymous,
        questions,
      });
      if (!res.ok) {
        setFeedback(res.error);
        return;
      }
      setTitle("");
      setDescription("");
      setQuestions([]);
      setShowForm(false);
      router.refresh();
    });
  }

  function handleStatus(id: string, status: "publicada" | "encerrada") {
    startTransition(async () => {
      await updateSurveyStatus(id, status);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="rounded-[2px] border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {feedback}
        </div>
      )}

      {canManage && (
        <div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex h-9 items-center gap-2 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase tracking-wider text-neutral-0 hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            Nova Pesquisa
          </button>

          {showForm && (
            <form
              onSubmit={handleCreate}
              className="mt-4 space-y-4 rounded-[2px] border border-neutral-200 bg-neutral-0 p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título da pesquisa"
                  required
                  className="h-9 rounded-[2px] border border-neutral-300 px-3 text-sm"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  Respostas anônimas
                </label>
              </div>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição (opcional)"
                className="h-9 w-full rounded-[2px] border border-neutral-300 px-3 text-sm"
              />

              <div className="rounded-[2px] border border-neutral-200 bg-neutral-50 p-3 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Adicionar Pergunta ({questions.length})
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <input
                    type="text"
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    placeholder="Texto da pergunta"
                    className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
                  />
                  <select
                    value={qKind}
                    onChange={(e) => setQKind(e.target.value as typeof qKind)}
                    className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
                  >
                    <option value="unica_escolha">Única escolha</option>
                    <option value="multipla_escolha">Múltipla escolha</option>
                    <option value="texto_curto">Texto curto</option>
                    <option value="texto_longo">Texto longo</option>
                    <option value="nota_1_5">Nota 1 a 5</option>
                    <option value="sim_nao">Sim / Não</option>
                  </select>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-3 text-xs font-bold uppercase"
                  >
                    + Adicionar
                  </button>
                </div>
                {(qKind === "unica_escolha" ||
                  qKind === "multipla_escolha") && (
                  <input
                    type="text"
                    value={qOptions}
                    onChange={(e) => setQOptions(e.target.value)}
                    placeholder="Opções separadas por vírgula"
                    className="h-9 w-full rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
                  />
                )}
                {questions.length > 0 && (
                  <ul className="list-disc pl-5 text-xs text-neutral-700">
                    {questions.map((q, i) => (
                      <li key={i}>
                        {q.questionText} ({q.kind})
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending || questions.length === 0}
                className="h-9 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase tracking-wider text-neutral-0 disabled:opacity-50"
              >
                {isPending ? "Salvando..." : "Salvar Rascunho"}
              </button>
            </form>
          )}
        </div>
      )}

      <div className="divide-y divide-neutral-200 rounded-[2px] border border-neutral-200 bg-neutral-0">
        {surveys.length === 0 ? (
          <p className="p-6 text-center text-sm text-neutral-500">
            Nenhuma pesquisa cadastrada.
          </p>
        ) : (
          surveys.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-4 p-4"
            >
              <div>
                <p className="font-semibold text-neutral-900">{s.title}</p>
                <p className="text-xs text-neutral-500">
                  Status: {s.status} · {s.isAnonymous ? "Anônima" : "Identificada"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {s.status === "publicada" && (
                  <Link
                    href={`/pesquisas/${s.id}/responder`}
                    className="inline-flex h-8 items-center rounded-[2px] bg-neutral-900 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0"
                  >
                    Responder
                  </Link>
                )}
                {canManage && (
                  <>
                    <Link
                      href={`/pesquisas/${s.id}/resultados`}
                      className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
                    >
                      Resultados
                    </Link>
                    {s.status === "rascunho" && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleStatus(s.id, "publicada")}
                        className="h-8 rounded-[2px] border border-emerald-200 px-3 text-[11px] font-bold uppercase text-emerald-700"
                      >
                        Publicar
                      </button>
                    )}
                    {s.status === "publicada" && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleStatus(s.id, "encerrada")}
                        className="h-8 rounded-[2px] border border-red-200 px-3 text-[11px] font-bold uppercase text-red-700"
                      >
                        Encerrar
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
