import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  memberAvailability,
  members,
  memberSkills,
  ministryMembers,
  skillTags,
} from "@/db/schema";

export async function getTalentsDashboard(
  skillTagId?: string,
  weekday?: number,
  period?: string
) {
  const [tags, membersList, skillsRows, availRows, ministryRows] =
    await Promise.all([
      db.select().from(skillTags).orderBy(asc(skillTags.name)),
      db
        .select({ id: members.id, fullName: members.fullName })
        .from(members)
        .where(and(eq(members.status, "ativo"), isNull(members.deletedAt)))
        .orderBy(asc(members.fullName)),
      db
        .select({
          memberId: memberSkills.memberId,
          skillTagId: memberSkills.skillTagId,
          skillName: skillTags.name,
          level: memberSkills.level,
        })
        .from(memberSkills)
        .innerJoin(skillTags, eq(memberSkills.skillTagId, skillTags.id)),
      db.select().from(memberAvailability),
      db.select({ memberId: ministryMembers.memberId }).from(ministryMembers),
    ]);

  const membersInMinistry = new Set(ministryRows.map((m) => m.memberId));

  const results = membersList
    .map((m) => {
      const mSkills = skillsRows.filter((s) => s.memberId === m.id);
      const mAvail = availRows.filter((a) => a.memberId === m.id);
      return {
        ...m,
        hasMinistry: membersInMinistry.has(m.id),
        skills: mSkills,
        availability: mAvail,
      };
    })
    .filter((m) => {
      if (skillTagId && !m.skills.some((s) => s.skillTagId === skillTagId)) {
        return false;
      }
      if (weekday !== undefined && !Number.isNaN(weekday)) {
        const matchDay = m.availability.some(
          (a) =>
            a.weekday === weekday && (!period || a.period === period)
        );
        if (!matchDay) return false;
      }
      return true;
    });

  return { tags, membersList, results };
}
