import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { requireSession } from "@/lib/session";
import { getCourseDetail } from "@/server/queries/courses";
import { CursoDetailClient } from "./curso-detail-client";

export default async function CursoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;
  const data = await getCourseDetail(id);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.course.title}
        description={`Tipo: ${data.course.kind} · ${data.enrollments.length}${data.course.capacity ? `/${data.course.capacity}` : ""} aluno(s)`}
        actions={
          <Link
            href="/cursos"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase text-neutral-700"
          >
            Voltar
          </Link>
        }
      />

      <CursoDetailClient
        courseId={data.course.id}
        enrollments={data.enrollments}
        lessons={data.lessons}
        allMembers={data.allMembers}
      />
    </div>
  );
}
