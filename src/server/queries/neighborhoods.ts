import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { cellMembers, cells, members } from "@/db/schema";

/**
 * Normaliza o nome do bairro ignorando maiúsculas/minúsculas e acentos
 * para agrupamento, mantendo a grafia mais frequente para exibição.
 */
function normalizeKey(value: string | null | undefined): string {
  if (!value || !value.trim()) return "__nao_informado__";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export async function getNeighborhoodStats() {
  const [activeMembers, activeCells, cellLinks] = await Promise.all([
    db
      .select({
        id: members.id,
        fullName: members.fullName,
        neighborhood: members.addressCity,
        city: members.addressCity,
      })
      .from(members)
      .where(and(eq(members.status, "ativo"), isNull(members.deletedAt))),
    db
      .select({
        id: cells.id,
        name: cells.name,
        neighborhood: cells.addressCity,
        weekday: cells.weekday,
      })
      .from(cells)
      .where(isNull(cells.deletedAt)),
    db.select({ memberId: cellMembers.memberId, cellId: cellMembers.cellId }).from(cellMembers),
  ]);

  const memberCellMap = new Map(cellLinks.map((l) => [l.memberId, l.cellId]));
  const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  const groups = new Map<
    string,
    {
      key: string;
      labels: Map<string, number>;
      members: Array<{
        id: string;
        fullName: string;
        city: string | null;
        cellId: string | null;
      }>;
      cells: Array<{
        id: string;
        name: string;
        meetingDay: string | null;
      }>;
    }
  >();

  function getOrCreate(key: string) {
    let g = groups.get(key);
    if (!g) {
      g = { key, labels: new Map(), members: [], cells: [] };
      groups.set(key, g);
    }
    return g;
  }

  for (const m of activeMembers) {
    const key = normalizeKey(m.neighborhood);
    const g = getOrCreate(key);
    const raw = m.neighborhood?.trim() || "Não informado";
    g.labels.set(raw, (g.labels.get(raw) ?? 0) + 1);
    g.members.push({
      id: m.id,
      fullName: m.fullName,
      city: m.city,
      cellId: memberCellMap.get(m.id) ?? null,
    });
  }

  for (const c of activeCells) {
    const key = normalizeKey(c.neighborhood);
    const g = getOrCreate(key);
    const raw = c.neighborhood?.trim() || "Não informado";
    g.labels.set(raw, (g.labels.get(raw) ?? 0) + 1);
    g.cells.push({
      id: c.id,
      name: c.name,
      meetingDay: WEEKDAYS[c.weekday] ?? null,
    });
  }

  return Array.from(groups.values())
    .map((g) => {
      let bestLabel = "Não informado";
      let bestCount = -1;
      for (const [label, count] of g.labels.entries()) {
        if (count > bestCount) {
          bestCount = count;
          bestLabel = label;
        }
      }
      return {
        key: g.key,
        label: g.key === "__nao_informado__" ? "Não informado" : bestLabel,
        memberCount: g.members.length,
        cellCount: g.cells.length,
        members: g.members,
        cells: g.cells,
      };
    })
    .sort((a, b) => b.memberCount - a.memberCount);
}
