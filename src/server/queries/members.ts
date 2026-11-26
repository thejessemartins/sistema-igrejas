import { and, asc, count, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { memberFamilyLinks, memberHistory, members, user } from "@/db/schema";
import { requirePermission } from "@/lib/session";

const PAGE_SIZE = 20;

export interface GetMembersParams {
  search?: string;
  status?: string;
  page?: number;
}

export async function getMembers(params: GetMembersParams = {}) {
  await requirePermission("membros", "ver");

  const page = Math.max(1, params.page ?? 1);
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = [isNull(members.deletedAt)];

  if (params.search?.trim()) {
    const term = `%${params.search.trim()}%`;
    const digits = params.search.replace(/\D/g, "");
    conditions.push(
      or(
        ilike(members.fullName, term),
        ilike(members.phone, term),
        digits ? ilike(members.cpf, `%${digits}%`) : ilike(members.cpf, term)
      )!
    );
  }

  if (params.status && params.status !== "all") {
    conditions.push(eq(members.status, params.status));
  }

  const where = and(...conditions);

  const [items, [{ total }]] = await Promise.all([
    db
      .select({
        id: members.id,
        fullName: members.fullName,
        phone: members.phone,
        email: members.email,
        status: members.status,
        photoPath: members.photoPath,
        birthDate: members.birthDate,
      })
      .from(members)
      .where(where)
      .orderBy(asc(members.fullName))
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ total: count() }).from(members).where(where),
  ]);

  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getMemberById(id: string) {
  await requirePermission("membros", "ver");

  const [member] = await db
    .select()
    .from(members)
    .where(and(eq(members.id, id), isNull(members.deletedAt)))
    .limit(1);

  if (!member) return null;

  const [directLinks, reverseLinks, history] = await Promise.all([
    db
      .select({
        linkId: memberFamilyLinks.id,
        relation: memberFamilyLinks.relation,
        relatedId: members.id,
        relatedName: members.fullName,
        relatedStatus: members.status,
      })
      .from(memberFamilyLinks)
      .innerJoin(members, eq(memberFamilyLinks.relatedMemberId, members.id))
      .where(
        and(eq(memberFamilyLinks.memberId, id), isNull(members.deletedAt))
      ),
    db
      .select({
        linkId: memberFamilyLinks.id,
        relation: memberFamilyLinks.relation,
        relatedId: members.id,
        relatedName: members.fullName,
        relatedStatus: members.status,
      })
      .from(memberFamilyLinks)
      .innerJoin(members, eq(memberFamilyLinks.memberId, members.id))
      .where(
        and(
          eq(memberFamilyLinks.relatedMemberId, id),
          isNull(members.deletedAt)
        )
      ),
    db
      .select({
        id: memberHistory.id,
        field: memberHistory.field,
        oldValue: memberHistory.oldValue,
        newValue: memberHistory.newValue,
        changedByName: user.name,
        createdAt: memberHistory.createdAt,
      })
      .from(memberHistory)
      .leftJoin(user, eq(memberHistory.changedBy, user.id))
      .where(eq(memberHistory.memberId, id))
      .orderBy(desc(memberHistory.createdAt))
      .limit(50),
  ]);

  return {
    member,
    familyLinks: [...directLinks, ...reverseLinks],
    history,
  };
}

export async function getBirthdays(month: number) {
  await requirePermission("membros", "ver");

  const rows = await db
    .select({
      id: members.id,
      fullName: members.fullName,
      birthDate: members.birthDate,
      phone: members.phone,
      status: members.status,
    })
    .from(members)
    .where(
      and(
        isNull(members.deletedAt),
        sql`EXTRACT(MONTH FROM ${members.birthDate}) = ${month}`
      )
    )
    .orderBy(sql`EXTRACT(DAY FROM ${members.birthDate}) ASC`, asc(members.fullName));

  const currentYear = new Date().getFullYear();

  return rows.map((r) => {
    const birthYear = r.birthDate ? Number(r.birthDate.slice(0, 4)) : null;
    const day = r.birthDate ? Number(r.birthDate.slice(8, 10)) : null;
    return {
      ...r,
      day,
      age: birthYear ? currentYear - birthYear : null,
    };
  });
}

export async function searchMembersForSelect(query: string, excludeId?: string) {
  await requirePermission("membros", "ver");

  const conditions = [isNull(members.deletedAt)];
  if (query.trim()) {
    conditions.push(ilike(members.fullName, `%${query.trim()}%`));
  }

  const rows = await db
    .select({ id: members.id, fullName: members.fullName })
    .from(members)
    .where(and(...conditions))
    .orderBy(asc(members.fullName))
    .limit(20);

  return excludeId ? rows.filter((r) => r.id !== excludeId) : rows;
}
