import { and, asc, desc, eq, isNull, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  messages,
  messageThreadParticipants,
  messageThreads,
  user,
} from "@/db/schema";

export async function getActiveUsersForChat(currentUserId: string) {
  return db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(ne(user.id, currentUserId))
    .orderBy(asc(user.name));
}

export async function getUserThreads(userId: string) {
  return db
    .select({
      id: messageThreads.id,
      subject: messageThreads.subject,
      kind: messageThreads.kind,
      updatedAt: messageThreads.updatedAt,
      lastReadAt: messageThreadParticipants.lastReadAt,
    })
    .from(messageThreadParticipants)
    .innerJoin(
      messageThreads,
      eq(messageThreadParticipants.threadId, messageThreads.id)
    )
    .where(
      and(
        eq(messageThreadParticipants.userId, userId),
        isNull(messageThreadParticipants.leftAt),
        isNull(messageThreads.deletedAt)
      )
    )
    .orderBy(desc(messageThreads.updatedAt));
}

export async function getThreadMessages(threadId: string, userId: string) {
  const [part] = await db
    .select()
    .from(messageThreadParticipants)
    .where(
      and(
        eq(messageThreadParticipants.threadId, threadId),
        eq(messageThreadParticipants.userId, userId),
        isNull(messageThreadParticipants.leftAt)
      )
    )
    .limit(1);

  if (!part) return null;

  const [thread] = await db
    .select()
    .from(messageThreads)
    .where(
      and(eq(messageThreads.id, threadId), isNull(messageThreads.deletedAt))
    )
    .limit(1);

  if (!thread) return null;

  const msgs = await db
    .select({
      id: messages.id,
      senderUserId: messages.senderUserId,
      senderName: user.name,
      body: messages.body,
      createdAt: messages.createdAt,
      deletedAt: messages.deletedAt,
    })
    .from(messages)
    .innerJoin(user, eq(messages.senderUserId, user.id))
    .where(eq(messages.threadId, threadId))
    .orderBy(asc(messages.createdAt));

  await db
    .update(messageThreadParticipants)
    .set({ lastReadAt: new Date() })
    .where(eq(messageThreadParticipants.id, part.id));

  return { thread, messages: msgs };
}
