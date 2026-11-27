"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteOwnMessage,
  reportMessage,
  sendMessage,
} from "@/server/actions/messages";

export function ThreadClient({
  threadId,
  currentUserId,
  messages,
}: {
  threadId: string;
  currentUserId: string;
  messages: Array<{
    id: string;
    senderUserId: string;
    senderName: string;
    body: string;
    createdAt: Date;
    deletedAt: Date | null;
  }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [body, setBody] = useState("");

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await sendMessage(threadId, body);
      if (res.ok) {
        setBody("");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-[2px] border border-neutral-200 bg-neutral-0 p-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className="rounded-[2px] border border-neutral-100 bg-neutral-50 p-3 text-sm"
          >
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="font-semibold text-neutral-800">
                {m.senderName}
              </span>
              <span>{new Date(m.createdAt).toLocaleString("pt-BR")}</span>
            </div>
            <p className="mt-1 text-neutral-800">
              {m.deletedAt ? (
                <em className="text-neutral-400">Mensagem removida</em>
              ) : (
                m.body
              )}
            </p>
            {!m.deletedAt && (
              <div className="mt-2 flex gap-3 text-[11px]">
                {m.senderUserId === currentUserId ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        await deleteOwnMessage(m.id, threadId);
                        router.refresh();
                      })
                    }
                    className="text-red-700 hover:underline"
                  >
                    Remover
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        await reportMessage(m.id);
                      })
                    }
                    className="text-neutral-500 hover:underline"
                  >
                    Denunciar
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escreva sua mensagem..."
          required
          className="h-9 flex-1 rounded-[2px] border border-neutral-300 px-3 text-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className="h-9 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase text-neutral-0"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
