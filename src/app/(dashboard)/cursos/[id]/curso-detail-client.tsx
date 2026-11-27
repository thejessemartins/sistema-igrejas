"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  completeCourseEnrollment,
  createCourseLesson,
  enrollStudent,
} from "@/server/actions/courses";

interface Props {
  courseId: string;
  enrollments: Array<{
    id: string;
    memberId: string;
    memberName: string;
    status: string;
  }>;
  lessons: Array<{ id: string; title: string; lessonDate: string }>;
  allMembers: Array<{ id: string; fullName: string }>;
}

export function CursoDetailClient({
  courseId,
  enrollments,
  lessons,
  allMembers,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [memberId, setMemberId] = useState(allMembers[0]?.id ?? "");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDate, setLessonDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [msg, setMsg] = useState<string | null>(null);

  function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await enrollStudent(courseId, memberId);
      setMsg(res.ok ? (res.message ?? "Matriculado") : res.error);
      router.refresh();
    });
  }

  function handleLesson(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createCourseLesson(courseId, lessonTitle, lessonDate);
      setMsg(res.ok ? (res.message ?? "Aula criada") : res.error);
      setLessonTitle("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {msg && (
        <div className="rounded-[2px] border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm">
          {msg}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <form
          onSubmit={handleEnroll}
          className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 space-y-3"
        >
          <h3 className="text-xs font-bold uppercase text-neutral-600">
            Matricular Aluno
          </h3>
          <div className="flex gap-2">
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="h-9 flex-1 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
            >
              {allMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={isPending}
              className="h-9 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase text-neutral-0"
            >
              Matricular
            </button>
          </div>
        </form>

        <form
          onSubmit={handleLesson}
          className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 space-y-3"
        >
          <h3 className="text-xs font-bold uppercase text-neutral-600">
            Nova Aula
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="Título da aula"
              required
              className="h-9 flex-1 rounded-[2px] border border-neutral-300 px-2 text-sm"
            />
            <input
              type="date"
              value={lessonDate}
              onChange={(e) => setLessonDate(e.target.value)}
              required
              className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm"
            />
            <button
              type="submit"
              disabled={isPending}
              className="h-9 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase text-neutral-0"
            >
              Criar
            </button>
          </div>
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 space-y-2">
          <h3 className="text-xs font-bold uppercase text-neutral-600">
            Alunos ({enrollments.length})
          </h3>
          <ul className="divide-y divide-neutral-100 text-sm">
            {enrollments.map((en) => (
              <li
                key={en.id}
                className="flex items-center justify-between py-2"
              >
                <span>
                  {en.memberName}{" "}
                  <span className="text-xs text-neutral-500">({en.status})</span>
                </span>
                {en.status === "ativo" && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        await completeCourseEnrollment(en.id, courseId);
                        router.refresh();
                      })
                    }
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Concluir
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 space-y-2">
          <h3 className="text-xs font-bold uppercase text-neutral-600">
            Aulas ({lessons.length})
          </h3>
          <ul className="divide-y divide-neutral-100 text-sm">
            {lessons.map((l) => (
              <li key={l.id} className="flex justify-between py-2">
                <span>{l.title}</span>
                <span className="font-mono text-xs text-neutral-500">
                  {l.lessonDate}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
