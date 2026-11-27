"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  messages,
  messageThreadParticipants,
  messageThreads,
} from "@/db/schema";
import { requireSession } from "@/lib/session";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

const createThreadSchema = z.object({
  subject: z.string().trim().min(2, "Assunto obrigatório").max(120),
  kind: z.enum(["direta", "grupo"]).default("direta"),
  participantIds: z.array(z.string().min(1)).min(1, "Selecione participantes"),
  firstMessage: z.string().trim().min(1, "Mensagem inicial obrigatória"),
});

export async function createMessageThread(
  input: unknown
): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = createThreadSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const allParticipants = Array.from(
    new Set([session.user.id, ...parsed.data.participantIds])
  );

  await db.transaction(async (tx) => {
    const [thread] = await tx
      .insert(messageThreads)
      .values({
        subject: parsed.data.subject,
        kind: parsed.data.kind,
        createdBy: session.user.id,
      })
      .returning({ id: messageThreads.id });

    await tx.insert(messageThreadParticipants).values(
      allParticipants.map((uid) => ({
        threadId: thread.id,
        userId: uid,
        lastReadAt: uid === session.user.id ? new Date() : null,
      }))
    );

    await tx.insert(messages).values({
      threadId: thread.id,
      senderUserId: session.user.id,
      body: parsed.data.firstMessage,
    });
  });

  revalidatePath("/mensagens");
  return { ok: true, message: "Conversa iniciada." };
}

export async function sendMessage(
  threadId: string,
  body: string
): Promise<ActionResult> {
  const session = await requireSession();
  if (!body.trim()) return { ok: false, error: "Mensagem vazia." };

  const [part] = await db
    .select()
    .from(messageThreadParticipants)
    .where(
      and(
        eq(messageThreadParticipants.threadId, threadId),
        eq(messageThreadParticipants.userId, session.user.id),
        isNull(messageThreadParticipants.leftAt)
      )
    )
    .limit(1);

  if (!part) return { ok: false, error: "Sem acesso a esta conversa." };

  await db.transaction(async (tx) => {
    await tx.insert(messages).values({
      threadId,
      senderUserId: session.user.id,
      body: body.trim(),
    });
    await tx
      .update(messageThreads)
      .set({ updatedAt: new Date() })
      .where(eq(messageThreads.id, threadId));
    await tx
      .update(messageThreadParticipants)
      .set({ lastReadAt: new Date() })
      .where(eq(messageThreadParticipants.id, part.id));
  });

  revalidatePath(`/mensagens/${threadId}`);
  revalidatePath("/mensagens");
  return { ok: true, message: "Enviada." };
}

export async function deleteOwnMessage(
  messageId: string,
  threadId: string
): Promise<ActionResult> {
  const session = await requireSession();
  await db
    .update(messages)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(messages.id, messageId),
        eq(messages.senderUserId, session.user.id)
      )
    );

  revalidatePath(`/mensagens/${threadId}`);
  return { ok: true, message: "Mensagem removida." };
}

export async function reportMessage(messageId: string): Promise<ActionResult> {
  const session = await requireSession();
  await logAudit({
    userId: session.user.id,
    acao: "denuncia_mensagem_interna",
    entidade: "message",
    entidadeId: messageId,
    detalhes: {},
  });
  return { ok: true, message: "Denúncia registrada para moderação." };
}
