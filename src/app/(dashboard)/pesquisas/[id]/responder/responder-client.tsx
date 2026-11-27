"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitSurveyResponse } from "@/server/actions/surveys";

interface Question {
  id: string;
  questionText: string;
  kind: string;
  optionsJson: string[] | null;
  isRequired: boolean;
}

export function ResponderClient({
  surveyId,
  questions,
}: {
  surveyId: string;
  questions: Question[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [feedback, setFeedback] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const res = await submitSurveyResponse(surveyId, answers);
      if (!res.ok) {
        setFeedback({ type: "error", text: res.error });
        return;
      }
      setFeedback({ type: "ok", text: res.message ?? "Enviado!" });
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-5 rounded-[2px] border border-neutral-200 bg-neutral-0 p-6"
    >
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

      {questions.map((q, idx) => (
        <div key={q.id} className="space-y-2">
          <label className="block text-sm font-semibold text-neutral-900">
            {idx + 1}. {q.questionText}
            {q.isRequired && <span className="text-red-600"> *</span>}
          </label>

          {q.kind === "texto_curto" && (
            <input
              type="text"
              required={q.isRequired}
              onChange={(e) =>
                setAnswers((p) => ({ ...p, [q.id]: e.target.value }))
              }
              className="h-9 w-full rounded-[2px] border border-neutral-300 px-3 text-sm"
            />
          )}

          {q.kind === "texto_longo" && (
            <textarea
              rows={3}
              required={q.isRequired}
              onChange={(e) =>
                setAnswers((p) => ({ ...p, [q.id]: e.target.value }))
              }
              className="w-full rounded-[2px] border border-neutral-300 p-3 text-sm"
            />
          )}

          {q.kind === "sim_nao" && (
            <div className="flex gap-4 text-sm">
              {["Sim", "Não"].map((opt) => (
                <label key={opt} className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    onChange={(e) =>
                      setAnswers((p) => ({ ...p, [q.id]: e.target.value }))
                    }
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}

          {q.kind === "nota_1_5" && (
            <div className="flex gap-3 text-sm">
              {["1", "2", "3", "4", "5"].map((n) => (
                <label key={n} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name={q.id}
                    value={n}
                    onChange={(e) =>
                      setAnswers((p) => ({ ...p, [q.id]: e.target.value }))
                    }
                  />
                  {n}
                </label>
              ))}
            </div>
          )}

          {q.kind === "unica_escolha" && q.optionsJson && (
            <div className="space-y-1 text-sm">
              {q.optionsJson.map((opt) => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    onChange={(e) =>
                      setAnswers((p) => ({ ...p, [q.id]: e.target.value }))
                    }
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}

          {q.kind === "multipla_escolha" && q.optionsJson && (
            <div className="space-y-1 text-sm">
              {q.optionsJson.map((opt) => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const prev = Array.isArray(answers[q.id])
                        ? (answers[q.id] as string[])
                        : [];
                      const next = e.target.checked
                        ? [...prev, opt]
                        : prev.filter((x) => x !== opt);
                      setAnswers((p) => ({ ...p, [q.id]: next }));
                    }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={isPending}
        className="h-9 rounded-[2px] bg-neutral-900 px-5 text-xs font-bold uppercase tracking-wider text-neutral-0 disabled:opacity-50"
      >
        {isPending ? "Enviando..." : "Enviar Respostas"}
      </button>
    </form>
  );
}
