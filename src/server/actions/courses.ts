"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  courseAttendance,
  courseEnrollments,
  courseLessons,
  courses,
} from "@/db/schema";
import { requireSession } from "@/lib/session";
import type { ActionResult } from "./auth";

const courseSchema = z.object({
  title: z.string().trim().min(2, "Título obrigatório"),
  kind: z.enum([
    "ebd",
    "curso_livre",
    "classe_integracao",
    "treinamento_lideranca",
  ]),
  startsAt: z.string().min(1),
  meetingTime: z.string().trim().optional().nullable(),
  roomText: z.string().trim().optional().nullable(),
  capacity: z.coerce.number().int().positive().optional().nullable(),
});

export async function createCourse(input: unknown): Promise<ActionResult> {
  await requireSession();
  const parsed = courseSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  await db.insert(courses).values({
    title: parsed.data.title,
    kind: parsed.data.kind,
    startsAt: parsed.data.startsAt,
    meetingTime: parsed.data.meetingTime || null,
    roomText: parsed.data.roomText || null,
    capacity: parsed.data.capacity ?? null,
  });

  revalidatePath("/cursos");
  return { ok: true, message: "Turma criada." };
}

export async function enrollStudent(
  courseId: string,
  memberId: string
): Promise<ActionResult> {
  await requireSession();
  try {
    await db.transaction(async (tx) => {
      const [course] = await tx
        .select({ capacity: courses.capacity })
        .from(courses)
        .where(eq(courses.id, courseId))
        .limit(1);

      const active = await tx
        .select({ id: courseEnrollments.id })
        .from(courseEnrollments)
        .where(
          and(
            eq(courseEnrollments.courseId, courseId),
            eq(courseEnrollments.status, "ativo")
          )
        );

      if (course?.capacity && active.length >= course.capacity) {
        throw new Error(
          `Turma lotada (capacidade: ${course.capacity} vagas).`
        );
      }

      await tx
        .insert(courseEnrollments)
        .values({ courseId, memberId, status: "ativo" })
        .onConflictDoNothing();
    });

    revalidatePath(`/cursos/${courseId}`);
    return { ok: true, message: "Aluno matriculado." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao matricular.",
    };
  }
}

export async function createCourseLesson(
  courseId: string,
  title: string,
  lessonDate: string
): Promise<ActionResult> {
  await requireSession();
  await db.insert(courseLessons).values({
    courseId,
    title: title.trim(),
    lessonDate,
  });
  revalidatePath(`/cursos/${courseId}`);
  return { ok: true, message: "Aula registrada." };
}

export async function markCourseAttendance(
  lessonId: string,
  memberId: string,
  status: "presente" | "ausente" | "justificado",
  courseId: string
): Promise<ActionResult> {
  await requireSession();
  await db
    .insert(courseAttendance)
    .values({ lessonId, memberId, status })
    .onConflictDoUpdate({
      target: [courseAttendance.lessonId, courseAttendance.memberId],
      set: { status },
    });
  revalidatePath(`/cursos/${courseId}`);
  return { ok: true, message: "Frequência salva." };
}

export async function completeCourseEnrollment(
  enrollmentId: string,
  courseId: string
): Promise<ActionResult> {
  await requireSession();
  await db
    .update(courseEnrollments)
    .set({ status: "concluido" })
    .where(eq(courseEnrollments.id, enrollmentId));
  revalidatePath(`/cursos/${courseId}`);
  return { ok: true, message: "Matrícula concluída." };
}
