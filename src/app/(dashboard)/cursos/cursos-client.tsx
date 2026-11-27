"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createCourse } from "@/server/actions/courses";

export function CursosClient({
  courses,
}: {
  courses: Array<{
    id: string;
    title: string;
    kind: string;
    meetingTime: string | null;
    roomText: string | null;
    capacity: number | null;
  }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<
    "ebd" | "curso_livre" | "classe_integracao" | "treinamento_lideranca"
  >("ebd");
  const [capacity, setCapacity] = useState("30");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await createCourse({
        title,
        kind,
        startsAt: new Date().toISOString().slice(0, 10),
        capacity: Number(capacity) || null,
      });
      setTitle("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="flex flex-wrap gap-2 rounded-[2px] border border-neutral-200 bg-neutral-0 p-4"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nome da turma"
          required
          className="h-9 flex-1 min-w-[200px] rounded-[2px] border border-neutral-300 px-2 text-sm"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as typeof kind)}
          className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
        >
          <option value="ebd">EBD</option>
          <option value="classe_integracao">Classe de Integração</option>
          <option value="curso_livre">Curso Livre</option>
          <option value="treinamento_lideranca">Treinamento Liderança</option>
        </select>
        <input
          type="number"
          min={1}
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder="Vagas"
          className="h-9 w-24 rounded-[2px] border border-neutral-300 px-2 text-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-9 items-center gap-1 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase text-neutral-0"
        >
          <Plus className="h-3.5 w-3.5" /> Criar Turma
        </button>
      </form>

      <div className="divide-y divide-neutral-200 rounded-[2px] border border-neutral-200 bg-neutral-0">
        {courses.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between p-4"
          >
            <div>
              <p className="font-semibold text-neutral-900">{c.title}</p>
              <p className="text-xs text-neutral-500 uppercase">
                {c.kind} · {c.capacity ? `${c.capacity} vagas` : "Sem limite"}
              </p>
            </div>
            <Link
              href={`/cursos/${c.id}`}
              className="inline-flex h-8 items-center rounded-[2px] bg-neutral-900 px-3 text-[11px] font-bold uppercase text-neutral-0"
            >
              Abrir Turma
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
