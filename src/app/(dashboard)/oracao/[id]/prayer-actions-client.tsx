"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  markPrayerAnswered,
  registerPrayerCommitment,
} from "@/server/actions/prayer";

export function PrayerActionsClient({
  id,
  canMarkAnswered,
  status,
}: {
  id: string;
  canMarkAnswered: boolean;
  status: string;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);

  async function handlePray() {
    const res = await registerPrayerCommitment(id);
    if (res.ok) setMsg(res.message);
    router.refresh();
  }

  async function handleAnswered() {
    const res = await markPrayerAnswered(id, "Atendido");
    if (res.ok) setMsg(res.message);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {msg ? (
        <div className="rounded-[2px] border border-green-600/30 bg-green-600/10 px-3 py-2 text-xs text-green-600">
          {msg}
        </div>
      ) : null}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handlePray}
          className="inline-flex h-8 items-center rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
        >
          Orei por este pedido
        </button>
        {canMarkAnswered && status !== "atendido" ? (
          <button
            type="button"
            onClick={handleAnswered}
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-800 hover:bg-neutral-50"
          >
            Marcar como atendido
          </button>
        ) : null}
      </div>
    </div>
  );
}
