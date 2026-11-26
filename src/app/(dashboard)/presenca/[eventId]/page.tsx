import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { formatDate } from "@/lib/format";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";
import type { AttendanceStatus } from "@/lib/validations";
import { getEventAttendanceSheet } from "@/server/queries/attendance";
import { AttendanceSheetClient } from "./attendance-sheet-client";

export default async function ChamadaEventoPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const session = await requirePermission("presenca", "ver");
  const { eventId } = await params;

  const data = await getEventAttendanceSheet(eventId);
  if (!data) notFound();

  const savedMap: Record<string, AttendanceStatus> = {};
  for (const s of data.saved) {
    if (s.memberId) savedMap[s.memberId] = s.status as AttendanceStatus;
  }

  const canEdit =
    hasPermission(session, "presenca", "editar") &&
    data.event.status !== "cancelado";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Chamada: ${data.event.title}`}
        description={formatDate(data.event.startsAt, "dd/MM/yyyy HH:mm")}
        actions={
          <Link
            href="/presenca"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Voltar
          </Link>
        }
      />

      <AttendanceSheetClient
        eventId={data.event.id}
        membersList={data.activeMembers}
        savedMap={savedMap}
        canEdit={canEdit}
      />
    </div>
  );
}
