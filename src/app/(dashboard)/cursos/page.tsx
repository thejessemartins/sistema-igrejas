import { PageHeader } from "@/components/shared/page-header";
import { requireSession } from "@/lib/session";
import { getCoursesList } from "@/server/queries/courses";
import { CursosClient } from "./cursos-client";

export default async function CursosPage() {
  await requireSession();
  const list = await getCoursesList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cursos e Escola Bíblica (EBD)"
        description="Turmas, matrículas, aulas e frequência própria."
      />
      <CursosClient courses={list} />
    </div>
  );
}
