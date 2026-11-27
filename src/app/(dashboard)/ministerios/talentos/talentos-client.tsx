"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  addMemberAvailability,
  assignMemberSkill,
  createSkillTag,
  inviteMemberByTalent,
} from "@/server/actions/talents";

const WEEKDAYS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

interface Props {
  tags: Array<{ id: string; name: string; category: string }>;
  membersList: Array<{ id: string; fullName: string }>;
  results: Array<{
    id: string;
    fullName: string;
    hasMinistry: boolean;
    skills: Array<{ skillTagId: string; skillName: string; level: string }>;
    availability: Array<{ weekday: number; period: string }>;
  }>;
}

export function TalentosClient({ tags, membersList, results }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tagName, setTagName] = useState("");
  const [tagCategory, setTagCategory] = useState<
    "musica" | "tecnica" | "manual" | "ensino" | "cuidado" | "administracao" | "outro"
  >("musica");
  const [memberId, setMemberId] = useState(membersList[0]?.id ?? "");
  const [skillTagId, setSkillTagId] = useState(tags[0]?.id ?? "");
  const [level, setLevel] = useState<"iniciante" | "intermediario" | "avancado">(
    "intermediario"
  );
  const [weekday, setWeekday] = useState("0");
  const [period, setPeriod] = useState<"manha" | "tarde" | "noite">("noite");
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleCreateTag(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createSkillTag({ name: tagName, category: tagCategory });
      setFeedback(res.ok ? (res.message ?? "Criado") : res.error);
      setTagName("");
      router.refresh();
    });
  }

  function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await assignMemberSkill(memberId, skillTagId, level);
      await addMemberAvailability(memberId, Number(weekday), period);
      setFeedback("Talento e disponibilidade salvos.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="rounded-[2px] border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          {feedback}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <form
          onSubmit={handleCreateTag}
          className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 space-y-3"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
            Nova Habilidade
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Ex: som, violão, libras"
              required
              className="h-9 flex-1 rounded-[2px] border border-neutral-300 px-2 text-sm"
            />
            <select
              value={tagCategory}
              onChange={(e) =>
                setTagCategory(e.target.value as typeof tagCategory)
              }
              className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
            >
              <option value="musica">Música</option>
              <option value="tecnica">Técnica</option>
              <option value="ensino">Ensino</option>
              <option value="cuidado">Cuidado</option>
              <option value="manual">Manual</option>
              <option value="administracao">Administração</option>
              <option value="outro">Outro</option>
            </select>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-9 items-center gap-1 rounded-[2px] bg-neutral-900 px-3 text-xs font-bold uppercase text-neutral-0"
            >
              <Plus className="h-3.5 w-3.5" /> Criar
            </button>
          </div>
        </form>

        {tags.length > 0 && membersList.length > 0 && (
          <form
            onSubmit={handleAssign}
            className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 space-y-3"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Atribuir Talento e Disponibilidade
            </h3>
            <div className="grid gap-2 sm:grid-cols-3">
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
              >
                {membersList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName}
                  </option>
                ))}
              </select>
              <select
                value={skillTagId}
                onChange={(e) => setSkillTagId(e.target.value)}
                className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
              >
                {tags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as typeof level)}
                className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
              >
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>
              <select
                value={weekday}
                onChange={(e) => setWeekday(e.target.value)}
                className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
              >
                {WEEKDAYS.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as typeof period)}
                className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
              >
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
              </select>
              <button
                type="submit"
                disabled={isPending}
                className="h-9 rounded-[2px] bg-neutral-900 px-3 text-xs font-bold uppercase text-neutral-0"
              >
                Salvar
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="overflow-x-auto rounded-[2px] border border-neutral-200 bg-neutral-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-2">Membro</th>
              <th className="px-4 py-2">Habilidades</th>
              <th className="px-4 py-2">Disponibilidade</th>
              <th className="px-4 py-2 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {results.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-2 font-medium">
                  {m.fullName}
                  {!m.hasMinistry && m.skills.length > 0 && (
                    <span className="ml-2 rounded-[2px] bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                      Sem ministério
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-xs text-neutral-600">
                  {m.skills
                    .map((s) => `${s.skillName} (${s.level})`)
                    .join(", ") || "—"}
                </td>
                <td className="px-4 py-2 text-xs text-neutral-600">
                  {m.availability
                    .map((a) => `${WEEKDAYS[a.weekday]} ${a.period}`)
                    .join(", ") || "—"}
                </td>
                <td className="px-4 py-2 text-right">
                  {m.skills.length > 0 && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          const res = await inviteMemberByTalent(
                            m.fullName,
                            m.skills[0].skillName
                          );
                          setFeedback(res.ok ? (res.message ?? "Convidado") : res.error);
                        })
                      }
                      className="rounded-[2px] border border-neutral-300 px-2.5 py-1 text-xs font-semibold hover:bg-neutral-50"
                    >
                      Convidar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
