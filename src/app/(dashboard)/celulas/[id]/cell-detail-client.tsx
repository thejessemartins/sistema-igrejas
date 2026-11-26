"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, CheckSquare } from "lucide-react";
import { SeraCard } from "@/components/shared/sera-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ATTENDANCE_STATUSES, type AttendanceStatus } from "@/lib/validations";
import {
  addCellMember,
  createCellMeeting,
  getCellMeetingAttendanceAction,
  removeCellMember,
  saveCellAttendanceBatch,
} from "@/server/actions/cells";

interface MemberRow {
  linkId: string;
  memberId: string;
  fullName: string;
  phone: string | null;
  joinedAt: string;
}

interface MeetingRow {
  id: string;
  meetingDate: string;
  topic: string;
  notes: string | null;
  presentCount: number;
  totalCount: number;
}

export function CellDetailClient({
  cellId,
  activeMembers,
  meetings,
  candidates,
  canEdit,
}: {
  cellId: string;
  activeMembers: MemberRow[];
  meetings: MeetingRow[];
  candidates: Array<{ id: string; fullName: string }>;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"membros" | "reunioes">("membros");
  const [selectedMemberId, setSelectedMemberId] = useState(
    candidates[0]?.id ?? ""
  );
  const [meetingDate, setMeetingDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMemberId) return;
    setMsg(null);
    setErr(null);
    const res = await addCellMember(cellId, selectedMemberId);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    setMsg(res.message);
    router.refresh();
  }

  async function handleRemoveMember(linkId: string) {
    setMsg(null);
    setErr(null);
    const res = await removeCellMember(cellId, linkId);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    setMsg(res.message);
    router.refresh();
  }

  async function handleCreateMeeting(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const res = await createCellMeeting({
      cellId,
      meetingDate,
      topic,
      notes,
    });
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    setTopic("");
    setNotes("");
    setMsg(res.message);
    router.refresh();
  }

  async function openAttendance(meetingId: string) {
    setActiveMeetingId(meetingId);
    const saved = await getCellMeetingAttendanceAction(meetingId);
    const map: Record<string, AttendanceStatus> = {};
    for (const m of activeMembers) {
      map[m.memberId] = "presente";
    }
    for (const s of saved) {
      map[s.memberId] = s.status as AttendanceStatus;
    }
    setAttendanceMap(map);
  }

  async function handleSaveAttendance() {
    if (!activeMeetingId) return;
    setMsg(null);
    setErr(null);
    const entries = activeMembers.map((m) => ({
      memberId: m.memberId,
      status: attendanceMap[m.memberId] ?? "presente",
    }));
    const res = await saveCellAttendanceBatch(cellId, activeMeetingId, entries);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    setMsg(res.message);
    setActiveMeetingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {err ? (
        <div className="rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600">
          {err}
        </div>
      ) : null}
      {msg ? (
        <div className="rounded-[2px] border border-green-600/30 bg-green-600/10 px-3 py-2 text-xs text-green-600">
          {msg}
        </div>
      ) : null}

      <div className="flex gap-2 border-b border-neutral-200 pb-2">
        <button
          type="button"
          onClick={() => setTab("membros")}
          className={
            tab === "membros"
              ? "rounded-[2px] bg-blue-600 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-0"
              : "rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
          }
        >
          Membros ({activeMembers.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("reunioes")}
          className={
            tab === "reunioes"
              ? "rounded-[2px] bg-blue-600 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-0"
              : "rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
          }
        >
          Reuniões ({meetings.length})
        </button>
      </div>

      {tab === "membros" ? (
        <SeraCard title="Membros da Célula">
          {canEdit && candidates.length > 0 ? (
            <form
              onSubmit={handleAddMember}
              className="mb-4 flex flex-wrap items-end gap-2 border-b border-neutral-200 pb-4"
            >
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
              >
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="inline-flex h-8 items-center gap-1 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar Membro
              </button>
            </form>
          ) : null}

          {activeMembers.length === 0 ? (
            <EmptyState
              title="Sem membros ativos"
              description="Adicione membros à célula acima."
            />
          ) : (
            <ul className="divide-y divide-neutral-200 text-sm">
              {activeMembers.map((m) => (
                <li
                  key={m.linkId}
                  className="flex items-center justify-between py-2.5"
                >
                  <div>
                    <p className="font-medium text-neutral-900">{m.fullName}</p>
                    <p className="text-xs text-neutral-500">
                      Entrada: {m.joinedAt} · {m.phone ?? "Sem telefone"}
                    </p>
                  </div>
                  {canEdit ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(m.linkId)}
                      className="inline-flex h-7 items-center gap-1 rounded-[2px] border border-neutral-200 px-2 text-[11px] font-bold uppercase text-neutral-600 hover:bg-neutral-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remover
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </SeraCard>
      ) : (
        <div className="space-y-4">
          {canEdit ? (
            <SeraCard title="Nova Reunião">
              <form
                onSubmit={handleCreateMeeting}
                className="grid gap-3 sm:grid-cols-3"
              >
                <input
                  type="date"
                  required
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="h-8 rounded-[2px] border border-neutral-200 px-2 text-xs"
                />
                <input
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Tema da reunião"
                  className="h-8 rounded-[2px] border border-neutral-200 px-2 text-xs"
                />
                <button
                  type="submit"
                  className="inline-flex h-8 items-center justify-center rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
                >
                  Registrar Reunião
                </button>
              </form>
            </SeraCard>
          ) : null}

          <SeraCard title="Reuniões e Frequência">
            {meetings.length === 0 ? (
              <EmptyState
                title="Nenhuma reunião registrada"
                description="Registre uma reunião acima."
              />
            ) : (
              <ul className="divide-y divide-neutral-200 text-sm">
                {meetings.map((mt) => {
                  const pct =
                    mt.totalCount > 0
                      ? Math.round((mt.presentCount / mt.totalCount) * 100)
                      : 0;
                  return (
                    <li
                      key={mt.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                    >
                      <div>
                        <p className="font-medium text-neutral-900">
                          {mt.topic}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {mt.meetingDate} · Presença: {mt.presentCount}/
                          {mt.totalCount} ({pct}%)
                        </p>
                      </div>
                      {canEdit ? (
                        <button
                          type="button"
                          onClick={() => openAttendance(mt.id)}
                          className="inline-flex h-7 items-center gap-1 rounded-[2px] border border-neutral-200 px-2.5 text-[11px] font-bold uppercase text-neutral-700 hover:bg-neutral-50"
                        >
                          <CheckSquare className="h-3.5 w-3.5" />
                          Presença
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </SeraCard>

          {activeMeetingId ? (
            <SeraCard title="Lista de Presença em Lote">
              <div className="space-y-3">
                {activeMembers.map((m) => (
                  <div
                    key={m.memberId}
                    className="flex items-center justify-between border-b border-neutral-100 pb-2 text-sm"
                  >
                    <span>{m.fullName}</span>
                    <select
                      value={attendanceMap[m.memberId] ?? "presente"}
                      onChange={(e) =>
                        setAttendanceMap((prev) => ({
                          ...prev,
                          [m.memberId]: e.target.value as AttendanceStatus,
                        }))
                      }
                      className="h-7 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
                    >
                      {ATTENDANCE_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="inline-flex h-8 items-center rounded-[2px] bg-blue-600 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
                >
                  Salvar presença em lote
                </button>
              </div>
            </SeraCard>
          ) : null}
        </div>
      )}
    </div>
  );
}
