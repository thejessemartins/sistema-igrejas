import { asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  courseAttendance,
  courseEnrollments,
  courseLessons,
  courses,
  members,
} from "@/db/schema";

export async function getCoursesList() {
  return db
    .select()
    .from(courses)
    .where(isNull(courses.deletedAt))
    .orderBy(desc(courses.createdAt));
}

export async function getCourseDetail(courseId: string) {
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  if (!course || course.deletedAt) return null;

  const [enrollments, lessons, allMembers, attendance] = await Promise.all([
    db
      .select({
        id: courseEnrollments.id,
        memberId: courseEnrollments.memberId,
        memberName: members.fullName,
        status: courseEnrollments.status,
      })
      .from(courseEnrollments)
      .innerJoin(members, eq(courseEnrollments.memberId, members.id))
      .where(eq(courseEnrollments.courseId, courseId))
      .orderBy(asc(members.fullName)),
    db
      .select()
      .from(courseLessons)
      .where(eq(courseLessons.courseId, courseId))
      .orderBy(desc(courseLessons.lessonDate)),
    db
      .select({ id: members.id, fullName: members.fullName })
      .from(members)
      .where(isNull(members.deletedAt))
      .orderBy(asc(members.fullName)),
    db.select().from(courseAttendance),
  ]);

  return { course, enrollments, lessons, allMembers, attendance };
}
