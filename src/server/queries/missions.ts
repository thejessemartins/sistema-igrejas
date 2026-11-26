import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  aidBeneficiaries,
  itemDonations,
  socialProjects,
} from "@/db/schema";
import { requireSession, type AppSession } from "@/lib/session";

export async function getSocialProjects() {
  await requireSession();
  return db
    .select()
    .from(socialProjects)
    .where(isNull(socialProjects.deletedAt))
    .orderBy(desc(socialProjects.createdAt));
}

export async function getSocialProjectById(id: string, session: AppSession) {
  await requireSession();

  const [project] = await db
    .select()
    .from(socialProjects)
    .where(and(eq(socialProjects.id, id), isNull(socialProjects.deletedAt)))
    .limit(1);

  if (!project) return null;

  const canSeeBeneficiaries =
    ["admin", "pastor", "secretario"].includes(session.user.role) ||
    (session.user.memberId &&
      project.responsibleMemberId === session.user.memberId);

  const [donations, beneficiaries] = await Promise.all([
    db
      .select()
      .from(itemDonations)
      .where(eq(itemDonations.projectId, id))
      .orderBy(desc(itemDonations.donatedAt)),
    canSeeBeneficiaries
      ? db
          .select()
          .from(aidBeneficiaries)
          .where(isNull(aidBeneficiaries.deletedAt))
          .orderBy(desc(aidBeneficiaries.createdAt))
      : Promise.resolve([]),
  ]);

  return { project, donations, beneficiaries, canSeeBeneficiaries };
}
