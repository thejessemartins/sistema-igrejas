"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { advanceMemberStage } from "@/server/actions/journey";

interface Props {
  stages: Array<{ id: string; name: string; position: number }>;
  members: Array<{
    memberId: string;
    fullName: string;
    currentStageId: string | null;
    isStale: boolean;
  }>;
}

export function JornadaClient({ stages, members }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedMemberId, setSelectedMemberId] = useState(
    members[0]?.memberId ?? ""
  );
  const [selectedStageId, setSelectedStageId] = useState(stages[0]?.id ?? "");

  function handleMove(memberId: string, nextStageId: string) {
    startTransition(async () => {
      await advanceMemberStage(memberId, nextStageId);
      router.refresh();
    });
  }

  const staleMembers = members.filter((m) => m.isStale);

  return (
    <div className="space-y-6">
      {staleMembers.length > 0 && (
        <div className="rounded-[2px] border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <p className="flex items-center gap-1.5 font-bold uppercase">
            <AlertTriangle className="h-4 w-4" /> Membros parados há mais de 90
            dias ({staleMembers.length})
          </p>
          <p className="mt-1">
            {staleMembers.map((m) => m.fullName).join(", ")}
          </p>
        </div>
      )}

      {members.length > 0 && stages.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-[2px] border border-neutral-200 bg-neutral-0 p-3">
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
          >
            {members.map((m) => (
              <option key={m.memberId} value={m.memberId}>
                {m.fullName}
              </option>
            ))}
          </select>
          <select
            value={selectedStageId}
            onChange={(e) => setSelectedStageId(e.target.value)}
            className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
          >
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.position}. {s.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleMove(selectedMemberId, selectedStageId)}
            className="h-9 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase text-neutral-0"
          >
            Mover para etapa
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage, idx) => {
          const stageMembers = members.filter(
            (m) => m.currentStageId === stage.id
          );
          const nextStage = stages[idx + 1];
          return (
            <div
              key={stage.id}
              className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-3 space-y-2"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  {stage.position}. {stage.name}
                </h3>
                <span className="font-mono text-xs text-neutral-500">
                  {stageMembers.length}
                </span>
              </div>
              <ul className="space-y-1.5 text-sm">
                {stageMembers.map((m) => (
                  <li
                    key={m.memberId}
                    className="flex items-center justify-between rounded-[2px] bg-neutral-50 px-2 py-1.5"
                  >
                    <span className="truncate">{m.fullName}</span>
                    {nextStage && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleMove(m.memberId, nextStage.id)}
                        title={`Avançar para ${nextStage.name}`}
                        className="text-neutral-600 hover:text-neutral-900"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
