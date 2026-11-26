"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { toggleReadingDay } from "@/server/actions/reading";

export function ReadingDaysClient({
  planId,
  days,
  completedDays,
}: {
  planId: string;
  days: Array<{
    id: string;
    dayNumber: number;
    bibleReference: string;
    devotionalTitle: string;
    devotionalBody: string | null;
  }>;
  completedDays: number[];
}) {
  const router = useRouter();
  const completedSet = new Set(completedDays);

  async function handleToggle(dayNumber: number) {
    await toggleReadingDay(planId, dayNumber, !completedSet.has(dayNumber));
    router.refresh();
  }

  return (
    <ul className="divide-y divide-neutral-200">
      {days.map((d) => {
        const done = completedSet.has(d.dayNumber);
        return (
          <li
            key={d.id}
            className="flex flex-wrap items-center justify-between gap-2 py-2.5"
          >
            <div>
              <p className="text-sm font-medium text-neutral-900">
                Dia {d.dayNumber} · {d.bibleReference} — {d.devotionalTitle}
              </p>
              {d.devotionalBody ? (
                <p className="text-xs text-neutral-500">{d.devotionalBody}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => handleToggle(d.dayNumber)}
              className={
                done
                  ? "inline-flex h-7 items-center gap-1 rounded-[2px] bg-blue-600 px-2.5 text-[11px] font-bold uppercase text-neutral-0"
                  : "inline-flex h-7 items-center gap-1 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2.5 text-[11px] font-bold uppercase text-neutral-700"
              }
            >
              <Check className="h-3.5 w-3.5" />
              {done ? "Lido" : "Marcar"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
