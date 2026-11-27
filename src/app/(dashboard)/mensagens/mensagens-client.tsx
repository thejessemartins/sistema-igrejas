"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createMessageThread } from "@/server/actions/messages";

export function MensagensClient({
  threads,
  users,
}: {
  threads: Array<{
    id: string;
    subject: string;
    kind: string;
    updatedAt: Date;
    lastReadAt: Date | null;
  }>;
  users: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [subject, setSubject] = useState("");
  const [recipientId, setRecipientId] = useState(users[0]?.id ?? "");
  const [firstMessage, setFirstMessage] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createMessageThread({
        subject,
        kind: "direta",
        participantIds: [recipientId],
        firstMessage,
      });
      if (res.ok) {
        setSubject("");
        setFirstMessage("");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {users.length > 0 && (
        <form
          onSubmit={handleCreate}
          className="grid gap-3 rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 sm:grid-cols-3"
        >
          <select
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Assunto"
            required
            className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm"
          />
          <input
            type="text"
            value={firstMessage}
            onChange={(e) => setFirstMessage(e.target.value)}
            placeholder="Mensagem inicial"
            required
            className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm"
          />
          <button
            type="submit"
            disabled={isPending}
            className="h-9 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase text-neutral-0 w-fit"
          >
            Nova Conversa
          </button>
        </form>
      )}

      <div className="divide-y divide-neutral-200 rounded-[2px] border border-neutral-200 bg-neutral-0">
        {threads.length === 0 ? (
          <p className="p-6 text-center text-sm text-neutral-500">
            Nenhuma conversa ainda.
          </p>
        ) : (
          threads.map((t) => {
            const unread =
              !t.lastReadAt ||
              new Date(t.updatedAt) > new Date(t.lastReadAt);
            return (
              <Link
                key={t.id}
                href={`/mensagens/${t.id}`}
                className="flex items-center justify-between p-4 hover:bg-neutral-50"
              >
                <div>
                  <p className="font-semibold text-neutral-900">
                    {t.subject}
                    {unread && (
                      <span className="ml-2 rounded-[2px] bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                        Nova
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-neutral-500 capitalize">
                    {t.kind}
                  </p>
                </div>
                <span className="text-xs text-neutral-400">
                  {new Date(t.updatedAt).toLocaleString("pt-BR")}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
