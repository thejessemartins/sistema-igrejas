import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";
import {
  getMemberById,
  searchMembersForSelect,
} from "@/server/queries/members";
import { MemberDetailActions } from "./member-detail-actions";

export default async function MembroFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePermission("membros", "ver");
  const { id } = await params;

  const [data, candidates] = await Promise.all([
    getMemberById(id),
    searchMembersForSelect("", id),
  ]);

  if (!data) notFound();

  const { member, familyLinks, history } = data;
  const canEdit = hasPermission(session, "membros", "editar");
  const canDelete = hasPermission(session, "membros", "excluir");

  return (
    <div className="space-y-6">
      <PageHeader
        title={member.fullName}
        description={`Cadastro atualizado em ${formatDate(member.updatedAt)}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge label={member.status} variant="info" />
            {canEdit ? (
              <Link
                href={`/membros/${id}/editar`}
                className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
              >
                <Edit className="h-3.5 w-3.5" />
                Editar
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <SeraCard title="Dados Principais" className="lg:col-span-2">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Telefone
              </dt>
              <dd className="mt-0.5 text-neutral-900">{member.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                E-mail
              </dt>
              <dd className="mt-0.5 text-neutral-900">{member.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Nascimento
              </dt>
              <dd className="mt-0.5 text-neutral-900">
                {member.birthDate ? formatDate(member.birthDate) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Estado Civil
              </dt>
              <dd className="mt-0.5 text-neutral-900">
                {member.maritalStatus ?? "—"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Endereço
              </dt>
              <dd className="mt-0.5 text-neutral-900">
                {member.addressStreet
                  ? `${member.addressStreet}, ${member.addressNumber ?? "s/n"} - ${member.addressDistrict ?? ""} ${member.addressCity ?? ""}/${member.addressState ?? ""}`
                  : "—"}
              </dd>
            </div>
          </dl>
        </SeraCard>

        <SeraCard title="Família">
          {familyLinks.length === 0 ? (
            <EmptyState
              title="Sem vínculos"
              description="Nenhum familiar vinculado."
            />
          ) : (
            <ul className="space-y-2 text-sm">
              {familyLinks.map((f) => (
                <li
                  key={f.linkId}
                  className="flex items-center justify-between border-b border-neutral-100 pb-2"
                >
                  <Link
                    href={`/membros/${f.relatedId}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {f.relatedName}
                  </Link>
                  <StatusBadge label={f.relation} variant="neutral" />
                </li>
              ))}
            </ul>
          )}
        </SeraCard>
      </div>

      <SeraCard title="Ações e Vínculos">
        <MemberDetailActions
          memberId={member.id}
          memberName={member.fullName}
          currentStatus={member.status}
          candidates={candidates}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </SeraCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SeraCard title="Células e Ministérios">
          <EmptyState
            title="Módulos em breve"
            description="Os vínculos com células e ministérios aparecerão aqui."
          />
        </SeraCard>

        <SeraCard title="Frequência e Financeiro">
          <EmptyState
            title="Módulos em breve"
            description="O histórico de presença e contribuições aparecerá aqui."
          />
        </SeraCard>
      </div>

      <SeraCard title="Histórico de Alterações">
        {history.length === 0 ? (
          <EmptyState
            title="Sem alterações registradas"
            description="Mudanças de status e dados principais serão listadas aqui."
          />
        ) : (
          <ul className="space-y-2 text-xs">
            {history.map((h) => (
              <li
                key={h.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-2"
              >
                <span>
                  <strong>{h.field}</strong>: {h.oldValue ?? "—"} →{" "}
                  {h.newValue ?? "—"}
                </span>
                <span className="text-neutral-500">
                  {h.changedByName ?? "Sistema"} ·{" "}
                  {formatDate(h.createdAt, "dd/MM/yyyy HH:mm")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SeraCard>
    </div>
  );
}
