import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { user, userProfiles } from "@/db/schema";
import { requirePermission } from "@/lib/session";

export interface ListUsersFilters {
  search?: string;
  role?: string;
  status?: "all" | "active" | "inactive";
}

export async function listUsers(filters: ListUsersFilters = {}) {
  await requirePermission("usuarios", "ver");

  const conditions = [];

  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(or(ilike(user.name, term), ilike(user.email, term)));
  }

  if (filters.role && filters.role !== "all") {
    conditions.push(eq(userProfiles.role, filters.role));
  }

  if (filters.status === "active") {
    conditions.push(eq(userProfiles.active, true));
  } else if (filters.status === "inactive") {
    conditions.push(eq(userProfiles.active, false));
  }

  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: userProfiles.role,
      active: userProfiles.active,
      createdAt: user.createdAt,
    })
    .from(user)
    .innerJoin(userProfiles, eq(user.id, userProfiles.userId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(user.createdAt));
}
